import { Group, User } from "../models/User.js";
import { transactions } from "../models/model.js";
import { isValidEmail } from "./auth.js";
import { verifyAuth } from "./utils.js";
import jwt from 'jsonwebtoken'

/**
 * Return all the users
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having attributes `username`, `email` and `role`
  - Optional behavior:
    - empty array is returned if there are no users
 */
export const getUsers = async (req, res) => {
  try {
    const authenticated = verifyAuth(req, res, { authType: "Admin" });
    if (!authenticated.flag)
      return res.status(401).json({
        error: authenticated.cause
      });

    const users = await User.find().select('username email role -_id');
    res.status(200).json({
      data: { users },
      refreshedTokenMessage: res.locals.refreshedTokenMessage
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      refreshedTokenMessage: res.locals.refreshedTokenMessage
    });
  }
}

/**
 * Return information of a specific user
  - Request Body Content: None
  - Response `data` Content: An object having attributes `username`, `email` and `role`.
  - Optional behavior:
    - error 400 is returned if the user is not found in the system //fixed from 401 to 400
 */
export const getUser = async (req, res) => {
  try {
    /*---------------------------------- VALIDITY CHECKS ---------------------------------------------*/
    if (!req.params.username || req.params.username === ":username") {
      return res.status(404).json({ error: "Parameters error" });
    }

    //checking if it is admin or user 
    const { flag: admin_authorization, cause } = verifyAuth(req, res, { authType: "Admin" });
    if (!admin_authorization) {
      const { flag: user_authorization, cause } = verifyAuth(req, res,
        { authType: "User", username: req.params.username });
      if (!user_authorization) {
        return res.status(401).json({ error: cause });
      }
      else {
        const current_username = jwt.verify(req.cookies.accessToken, process.env.ACCESS_KEY).username;
        if (current_username != req.params.username) {
          return res.status(401).json({ error: "not authorized" });
        }
      }
    }

    // retrieving the requested user
    const requested_user = await User.findOne({ username: req.params.username });
    if (!requested_user) return res.status(400).json({
      error: "User not found",
      refreshedTokenMessage: res.locals.refreshedTokenMessage
    });
    return res.status(200).json({
      data: {
        username: requested_user.username,
        email: requested_user.email,
        role: requested_user.role
      },
      refreshedTokenMessage: res.locals.refreshedTokenMessage
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      refreshedTokenMessage: res.locals.refreshedTokenMessage
    });
  }
}

/**
 * Create a new group
  - Request Body Content: An object having a string attribute for the `name` of the group and an array that lists all the `memberEmails`
  - Response `data` Content: An object having an attribute `group` (this object must have a string attribute for the `name`
    of the created group and an array for the `members` of the group), an array that lists the `alreadyInGroup` members
    (members whose email is already present in a group) and an array that lists the `membersNotFound` (members whose email
    +does not appear in the system)
  - Optional behavior:
    - error 401 is returned if there is already an existing group with the same name
    - error 401 is returned if all the `memberEmails` either do not exist or are already in a group
 */
export const createGroup = async (req, res) => {
  try {
    // Check valid authentication (user must be logged)
    const authenticated = verifyAuth(req, res, { authType: "Simple" });

    if (!authenticated.flag) {
      return res.status(401).json({ error: authenticated.cause });
    }

    //var callerEmail = jwt.verify(req.cookies.accessToken, process.env.ACCESS_KEY).email;
    const caller = await User.findOne({ "refreshToken": req.cookies.refreshToken });
    const callerEmail = caller.email;
    const callerGroup = await Group.findOne({ members: { $elemMatch: { email: callerEmail } } });

    if (callerGroup) {
      return res.status(400).json({
        error: "You are already in a group",
        refreshedTokenMessage: res.locals.refreshedTokenMessage
      });
    }

    // Input parameters
    const { name, memberEmails } = req.body;

    // Input parameters are not valid
    if (!name || !memberEmails || memberEmails.length == 0) {
      return res.status(400).json({
        error: "Input not valid",
        refreshedTokenMessage: res.locals.refreshedTokenMessage
      });
    }

    if (!memberEmails.includes(callerEmail)) {
      memberEmails.push(callerEmail);
    }

    // Check if there is a group with the same name
    const existingGroup = await Group.findOne({ name: name });

    if (existingGroup) {
      return res.status(400).json({
        error: `Group with name ${name} already exists!`,
        refreshedTokenMessage: res.locals.refreshedTokenMessage
      })
    }

    var members = [];
    var alreadyInGroup = [];
    var membersNotFound = [];

    //const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

    // For each of the email provided, we check if they are eligible as members
    for (const email of memberEmails) {

      // Check that emails are in the correct format
      //const emailFormat = email.match(emailRegex);
      if (!isValidEmail(email)) {
        return res.status(400).json({
          error: "Format of email is not valid",
          refreshedTokenMessage: res.locals.refreshedTokenMessage
        });
      }

      // We verify if a user with that email does exist or not
      const user = await User.findOne({ email: email });
      // I case it does not exist, the email goes in membersNotFound
      if (!user) membersNotFound.push(email);
      else {
        // We look for a group having that user among the members
        const group = await Group.findOne({ members: { $elemMatch: { email: email } } });
        // If that group exists, this user goes in alreadyInGroup
        if (group) alreadyInGroup.push(email);
        // Otherwise, the member is valid
        else members.push({ email: email, user: user._id });
      }
    }

    // We do not create the group if all the members are not valid
    if ((members.length == 1 && members[0].email == callerEmail) || members.length == 0) {
      return res.status(400).json({
        error: "Members of the group are not valid",
        refreshedTokenMessage: res.locals.refreshedTokenMessage
      });
    }

    // Otherwise we proceed creating the group
    const new_group = new Group({ name, members });

    await new_group.save();
    return res.status(200).json({
      data: {
        group: { name: name, members: members.map(e => ({email: e.email})) },
        alreadyInGroup: alreadyInGroup.map(e => ({email: e})),
        membersNotFound: membersNotFound.map(e => ({email: e})) 
      },
      refreshedTokenMessage: res.locals.refreshedTokenMessage
    })


  } catch (err) {
    res.status(500).json({
      error: err.message,
      refreshedTokenMessage: res.locals.refreshedTokenMessage
    })
  }
}
/**
 * Return all the groups
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having a string attribute for the `name` of the group
    and an array for the `members` of the group
  - Optional behavior:
    - empty array is returned if there are no groups
 */
export const getGroups = async (req, res) => {
  try {
    //only admins can use this function
    const { flag, cause } = verifyAuth(req, res, { authType: "Admin" });
    if (!flag) {
      return res.status(401).json({ error: cause });
    }

    const groups = await Group.find({});
    const data = groups.map((e) =>
    ({
      name: e.name, members: e.members.map((m) =>
        ({ email: m.email })
      )
    }))


    return res.status(200).json({
      data: data,
      refreshedTokenMessage: res.locals.refreshedTokenMessage
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message,
      refreshedTokenMessage: res.locals.refreshedTokenMessage
    });
  }
}

/**
 * Return information of a specific group
  - Request Body Content: None
  - Response `data` Content: An object having a string attribute for the `name` of the group and an array for the 
    `members` of the group
  - Optional behavior:
    - error 400 is returned if the group does not exist // 401 -> 400
 */
export const getGroup = async (req, res) => {
  try {
    /*---------------------------------- VALIDITY CHECKS ---------------------------------------------*/
    if (!req.params.name || req.params.name === ":name") {
      return res.status(404).json({ error: "Parameters error" });
    }
    //searching the group
    const group = await Group.findOne({ name: req.params.name });
    if (!group) {
      return res.status(400).json({ error: "Group doesn't exist" });
    }

    // Check if user is admin or if is in the group
    const { flag: admin_authorization, cause } = verifyAuth(req, res, { authType: "Admin" });
    if (!admin_authorization) {
      const { flag: group_authorization, cause } = verifyAuth(req, res,
        { authType: "Group", emails: group.members.map(e => e.email) });
      if (!group_authorization) {
        return res.status(401).json({ error: cause });
      }
    }

    //return data
    return res.status(200).json({
      data: { group: {
        name: group.name, members: group.members.map(e => ({ email: e.email })) },
      },
      refreshedTokenMessage: res.locals.refreshedTokenMessage
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message,
      refreshedTokenMessage: res.locals.refreshedTokenMessage
    });
  }
}

/**
 * Add new members to a group
  - Request Body Content: An array of strings containing the emails of the members to add to the group
  - Response `data` Content: An object having an attribute `group` (this object must have a string attribute for the `name` of the
    created group and an array for the `members` of the group, this array must include the new members as well as the old ones), 
    an array that lists the `alreadyInGroup` members (members whose email is already present in a group) and an array that lists 
    the `membersNotFound` (members whose email does not appear in the system)
  - Optional behavior:
    - error 400 is returned if the group does not exist //401 -> 400
    - error 400 is returned if all the `memberEmails` either do not exist or are already in a group // 401->400
 */
export const addToGroup = async (req, res) => {
  try {
    /*---------------------------------- VALIDITY CHECKS ---------------------------------------------*/
    if (!req.params.name || req.params.name === ":name") {
      return res.status(404).json({ error: "Parameters error" });
    }

    if (!req.body.emails) {
      return res.status(400).json({ error: "Body error" });
    }

    if (!Array.isArray(req.body.emails)) {
      return res.status(400).json({ error: "Emails doesn't contain an array" });
    }
    if (!req.body.emails.every(e => isValidEmail(e) && e !== "")) {
      return res.status(400).json({ error: "Not valid email format" });
    }

    /*--------------------------      Optional Behavior 1      ---------------------------------------*/
    const group = await Group.findOne({ name: req.params.name });
    if (!group) {
      return res.status(400).json({ error: "Group does not exist" });
    }
    /*--------------------------     Check Auth     ---------------------------------*/
    if (req.route.path === "/groups/:name/add") {
      const { flag: group_authorization, cause } = verifyAuth(req, res,
        { authType: "Group", emails: group.members.map(e => e.email) });
      if (!group_authorization) {
        return res.status(401).json({ error: cause });
      }
    }
    else if (req.route.path === "/groups/:name/insert") {
      const { flag: admin_authorization, cause } = verifyAuth(req, res, { authType: "Admin" });
      if (!admin_authorization) {
        return res.status(401).json({ error: cause });
      }
    }
    /*--------------------------      Body      ---------------------------------------*/

    const { emails: memberEmails } = req.body;
    const alreadyInGroup = [];
    const membersNotFound = [];
    const newMembers = [];
    for (const email of memberEmails) {
      const user_to_add = await User.findOne({ email: email });

      if (!user_to_add) membersNotFound.push({ email: email });
      else {
        const group_to_check = await Group.findOne({ members: { $elemMatch: { email: email } } });
        if (group_to_check) alreadyInGroup.push({ email: email });
        else newMembers.push({ email: email, user: user_to_add._id });
      }
    }
    /*--------------------------      Optional Behavior 2      ---------------------------------------*/
    if (newMembers.length == 0) {
      return res.status(400).json({
        error: "no new member available",
        refreshedTokenMessage: res.locals.refreshedTokenMessage
      });
    }
    group.members = group.members.concat(newMembers);
    await group.save();
    return res.status(200).json({
      data: {
        group: { name: group.name, members: group.members.map(e => ({ email: e.email })) },
        alreadyInGroup: alreadyInGroup,
        membersNotFound: membersNotFound,
      },
      refreshedTokenMessage: res.locals.refreshedTokenMessage
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message,
      refreshedTokenMessage: res.locals.refreshedTokenMessage
    });
  }
}

/**
 * Remove members from a group
  - Request Body Content: An object having an attribute `group` (this object must have a string attribute for the `name` of the
    created group and an array for the `members` of the group, this array must include only the remaining members),
    an array that lists the `notInGroup` members (members whose email is not in the group) and an array that lists 
    the `membersNotFound` (members whose email does not appear in the system)
  - Optional behavior:
    - error 400 is returned if the group does not exist // 401 -> 400
    - error 400 is returned if all the `memberEmails` either do not exist or are not in the group // 401 -> 400
 */
export const removeFromGroup = async (req, res) => {
  try {
    /*---------------------------------- VALIDITY CHECKS ---------------------------------------------*/
    if (!req.params.name || req.params.name === ":name") {
      return res.status(404).json({ error: "Parameters error" });
    }

    if (!req.body.emails) {
      return res.status(400).json({ error: "Body error" });
    }
    if (!Array.isArray(req.body.emails)) {
      return res.status(400).json({ error: "Emails doesn't contain an array" });
    }
    if (!req.body.emails.every(e => isValidEmail(e) && e !== "")) {
      return res.status(400).json({ error: "Not valid email format" });
    }

    /*--------------------------      Optional Behavior 1      ---------------------------------------*/
    const group = await Group.findOne({ name: req.params.name });
    if (!group) {
      return res.status(400).json({ error: "Group doesn't exist" });
    }
    /* An error must be returned if the group contains only one member */
    if (group.members.length == 1) {
      return res.status(400).json({ error: "There's only one member in the group: ERROR" });
    }
    /*--------------------------     Check Auth     ---------------------------------*/
    if (req.route.path === "/groups/:name/remove") {
      const { flag: group_authorization, cause } = verifyAuth(req, res,
        { authType: "Group", emails: group.members.map(e => e.email) });
      if (!group_authorization) {
        return res.status(401).json({ error: cause });
      }
    }
    else if (req.route.path === "/groups/:name/pull") {
      const { flag: admin_authorization, cause } = verifyAuth(req, res, { authType: "Admin" });
      if (!admin_authorization) {
        return res.status(401).json({ error: cause });
      }
    }
    /*--------------------------      Body      ---------------------------------------*/
    const { emails : memberEmails } = req.body;
    const notInGroup = [];
    const membersNotFound = [];
    let removeMembers = [];
    for (const email of memberEmails) {
      const user_to_remove = await User.findOne({ email: email });
      if (!user_to_remove) membersNotFound.push({ email: email });
      else {
        if (!group.members.some(e => e.email == email)) notInGroup.push({ email: email });
        else removeMembers.push({ email: email, user: user_to_remove._id });
      }
    }

    /*--------------------------      Optional Behavior 2     ---------------------------------------*/
    removeMembers = [...new Set(removeMembers)];
    if (removeMembers.length == 0) {
      return res.status(400).json({
        error: "emails are not valid",
        refreshedTokenMessage: res.locals.refreshedTokenMessage
      });
    }

    if (removeMembers.length === group.members.length) {
      removeMembers = removeMembers.filter(e => e.email != group.members[0].email);
    }

    group.members = group.members.filter(e => !removeMembers.some(r => r.email === e.email));
    await group.save();
    return res.status(200).json({
      data: {
        group: { name: group.name, members: group.members.map(e => ({ email: e.email })) },
        notInGroup: notInGroup,
        membersNotFound: membersNotFound
      },
      refreshedTokenMessage: res.locals.refreshedTokenMessage
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message,
      refreshedTokenMessage: res.locals.refreshedTokenMessage
    });
  }
}

/**
 * Delete a user
  - Request Parameters: None
  - Request Body Content: A string equal to the `email` of the user to be deleted
  - Response `data` Content: An object having an attribute that lists the number of `deletedTransactions` and a boolean attribute that
    specifies whether the user was also `deletedFromGroup` or not.
  - Optional behavior:
    - error 401 is returned if the user does not exist 
 */
export const deleteUser = async (req, res) => {
  try {
    // Check valid authentication (user must be logged)
    const authenticated = verifyAuth(req, res, { authType: "Admin" });
    if (!authenticated.flag) {
      return res.status(401).json({
        error: authenticated.cause
      });
    }
    const email = req.body.email;
    if ( email === undefined || email === null) {
      return res.status(400).json({
        error: "Request does not contain the email",
        refreshedTokenMessage: res.locals.refreshedTokenMessage
      });
    }

    if (email === "") {
      return res.status(400).json({
        error: "The email field is empty",
        refreshedTokenMessage: res.locals.refreshedTokenMessage
      });
    }

    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    const emailFormat = email.match(emailRegex);
    if (!emailFormat) {
      return res.status(400).json({
        error: "Email format is not correct",
        refreshedTokenMessage: res.locals.refreshedTokenMessage
      });
    }

    // retrieve user from the EMAIL in request body
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).json({
        error: "User not found or doesn't exist",
        refreshedTokenMessage: res.locals.refreshedTokenMessage
      });
    }

    if(user.role === "Admin"){
      return res.status(400).json({
        error: "Cannot delete an Admin",
        refreshedTokenMessage: res.locals.refreshedTokenMessage
      });
    }

    // getting transactions and check if we have more than zero
    const nTransactions = await transactions.countDocuments({ username: user.username });
    if (nTransactions != 0) {
      // deleting transactions that belongs to a user
      await transactions.deleteMany({ username: user.username });
    }
    var inGroup = false;
    // simple remove here if present in one group
    var existingGroup = await Group.findOne({ members: { $elemMatch: { email: email } } });
    if (existingGroup) {
      if (existingGroup.members.length == 1) {
        await Group.deleteOne({ name: existingGroup.name })
      }
      else {
        existingGroup.members = existingGroup.members.filter(
          member => member.email !== email
        );
        await existingGroup.save();
      }
      inGroup = true;
    }

    // Remove user 
    await User.deleteOne({ username: user.username });
    return res.status(200).json({
      data: { deletedTransactions: nTransactions, deletedFromGroup: inGroup },
      refreshedTokenMessage: res.locals.refreshedTokenMessage
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      refreshedTokenMessage: res.locals.refreshedTokenMessage
    });
  }
}

/**
 * Delete a group
  - Request Body Content: A string equal to the `name` of the group to be deleted
  - Response `data` Content: A message confirming successful deletion
  - Optional behavior:
    - error 401 is returned if the group does not exist
 */
export const deleteGroup = async (req, res) => {
  try {
    // Check valid authentication (user must be logged)
    const authenticated = verifyAuth(req, res, { authType: "Admin" });
    if (!authenticated.flag) {
      return res.status(401).json({ error: authenticated.cause });
    }

    const name = req.body.name;
    if (!name || name.length == 0) {
      return res.status(400).json({
        error: "name not valid or missing",
        refreshedTokenMessage: res.locals.refreshedTokenMessage
      });
    }
    //checking if the group exist or not
    const group = await Group.findOne({ name: name });
    if (!group)
      return res.status(400).json({
        error: "Group does not exist",
        refreshedTokenMessage: res.locals.refreshedTokenMessage
      });

    //deleting the group if no errors occurred
    await Group.deleteOne({ name: name });
    return res.status(200).json({
      data: { message: "Group has been deleted" },
      refreshedTokenMessage: res.locals.refreshedTokenMessage
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      refreshedTokenMessage: res.locals.refreshedTokenMessage
    });
  }
}
