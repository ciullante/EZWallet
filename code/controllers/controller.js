import { categories, transactions } from "../models/model.js";
import { Group, User } from "../models/User.js";
import { isValidFloat } from "./auth.js";
import { handleDateFilterParams, handleAmountFilterParams, verifyAuth } from "./utils.js";

/**
 * Create a new category
  - Request Body Content: An object having attributes `type` and `color`
  - Response `data` Content: An object having attributes `type` and `color`
 */
export const createCategory = async (req, res) => {
    try {
        const authenticated = verifyAuth(req, res, { authType: "Admin" });
        if (!authenticated.flag)
            return res.status(401).json({
                error: authenticated.cause
            });

        const { type, color } = req.body;

        if (!type || !color || type == "" || color == "") {
            return res.status(400).json({
                error: "Parameters are not valid",
                refreshedTokenMessage: res.locals.refreshedTokenMessage
            });
        }

        const existCategory = await categories.findOne({ type }, { type });
        if (existCategory) {
            return res.status(400).json({
                error: "Category " + type + " already exists",
                refreshedTokenMessage: res.locals.refreshedTokenMessage
            });
        }
        const new_categories = new categories({ type, color });
        new_categories.save()
            .then(data => res.status(200).json({
                data: data,
                refreshedTokenMessage: res.locals.refreshedTokenMessage
            }))
            .catch(err => { throw err })
    } catch (error) {
        return res.status(500).json({
            error: error.message,
            refreshedTokenMessage: res.locals.refreshedTokenMessage
        });
    }
}

/**
 * Edit a category's type or color
  - Request Body Content: An object having attributes `type` and `color` equal to the new values to assign to the category
  - Response `data` Content: An object with parameter `message` that confirms successful editing and a parameter `count` that is equal to the count of transactions whose category was changed with the new type
  - Optional behavior:
    - error 401 returned if the specified category does not exist
    - error 401 is returned if new parameters have invalid values
 */
export const updateCategory = async (req, res) => {
    try {
        const authenticated = verifyAuth(req, res, { authType: "Admin" });
        if (!authenticated.flag)
            return res.status(401).json({
                error: authenticated.cause
            });

        const categoryExists = await categories.findOne({ type: req.params.type });
        if (!categoryExists) {
            return res.status(400).json({
                error: "Category " + req.params.type + " not found",
                refreshedTokenMessage: res.locals.refreshedTokenMessage
            });
        }

        const { type, color } = req.body;

        if (!type || !color || type == "" || color == "") {
            return res.status(400).json({
                error: "Parameters are not valid",
                refreshedTokenMessage: res.locals.refreshedTokenMessage
            });
        }

        if (type !== req.params.type && await categories.findOne({ type: type }))
            return res.status(400).json({
                error: "Category " + type + " already exist",
                refreshedTokenMessage: res.locals.refreshedTokenMessage
            });
        let count;

        if (type !== req.params.type)
            count = (await transactions.updateMany({ type: req.params.type }, { type })).modifiedCount;
        else
            count = await transactions.countDocuments({ type: type });

        await categories.updateOne({ type: req.params.type }, { type, color });

        return res.status(200).json({
            data: { message: "Category " + req.params.type + " updated", count: count },
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
 * Delete a category
  - Request Body Content: An array of strings that lists the `types` of the categories to be deleted
  - Response `data` Content: An object with parameter `message` that confirms successful deletion and a parameter `count` that is equal to the count of affected transactions (deleting a category sets all transactions with that category to have `investment` as their new category)
  - Optional behavior:
    - error 401 is returned if the specified category does not exist
 */
export const deleteCategory = async (req, res) => {
    try {
        const authenticated = verifyAuth(req, res, { authType: "Admin" });
        if (!authenticated.flag)
            return res.status(401).json({
                error: authenticated.cause
            });

        const { types } = req.body;

        if (!types || types.length == 0) {
            return res.status(400).json({
                error: "Parameters are not valid",
                refreshedTokenMessage: res.locals.refreshedTokenMessage
            });
        }

        let count = 0;

        const resultCategories = await categories.find();
        if (resultCategories.length === types.length) {
            types.shift();
        }
        if (resultCategories.length != 1) {
            for (const type of types) {
                if(type === "")
                    return res.status(400).json({
                        error: "Parameters are not valid",
                        refreshedTokenMessage: res.locals.refreshedTokenMessage
                    });
                const categoryExists = await categories.findOne({ type: type });
                if (!categoryExists)
                    return res.status(400).json({
                        error: "Category not found",
                        refreshedTokenMessage: res.locals.refreshedTokenMessage
                    });
            }
            for (const type of types) {
                await categories.deleteOne({ type: type });
                const firstCategory = await categories.findOne();
                const resultUpdate = await transactions.updateMany({ type: type }, { type: firstCategory.type });
                count += resultUpdate.modifiedCount;
            }
            return res.status(200).json({
                data: { message: "Categories " + types + " deleted", count: count },
                refreshedTokenMessage: res.locals.refreshedTokenMessage
            });
        }
        return res.status(400).json({
            error: "You can't delete all categories",
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
 * Return all the categories
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having attributes `type` and `color`
  - Optional behavior:
    - empty array is returned if there are no categories
 */
export const getCategories = async (req, res) => {
    try {
        const authenticated = verifyAuth(req, res, { authType: "Simple" });

        if (!authenticated.flag) {
            return res.status(401).json({
                error: authenticated.cause
            });
        }

        let all_categories = await categories.find({})
        let filtered_categories = all_categories.map(v => Object.assign({}, { type: v.type, color: v.color }))

        return res.status(200).json({
            data: filtered_categories,
            refreshedTokenMessage: res.locals.refreshedTokenMessage
        });

    } catch (error) {
        res.status(500).json({
            error: error.message,
            refreshedTokenMessage: res.locals.refreshedTokenMessage
        })
    }
}

/**
 * Create a new transaction made by a specific user
  - Request Body Content: An object having attributes `username`, `type` and `amount`
  - Response `data` Content: An object having attributes `username`, `type`, `amount` and `date`
  - Optional behavior:
    - error 400 is returned if the username or the type of category does not exist // 401 ->400
 */
export const createTransaction = async (req, res) => {
    try {
        /*---------------------------------- VALIDITY CHECKS ---------------------------------------------*/
        if (!req.params.username || req.params.username === ":username") {
            return res.status(404).json({ error: "Parameters error" });
        }

        const { username, amount, type } = req.body;

        if (!username || !amount || !type ) {
            return res.status(400).json({ error: "Body error" });
        }

        // This test was already covered by the previous check
        // if (username === "" || amount === "" || type === "") {
        //     return res.status(400).json({ error: "Attributes are void strings" });
        // }

        if (!isValidFloat(amount)) {
            return res.status(400).json({ error: "Amount is not a float" });
        }

        if (username !== req.params.username) {
            return res.status(400).json({ error: "Usernames not equal" });
        }

        //check login
        const { flag, cause } = verifyAuth(req, res, { authType: "User", username: username });
        if (!flag) {
            return res.status(401).json({ error: cause });
        }

        //checking if parameters are valid
        const user = await User.findOne({ username: username });
        if (!user) {
            return res.status(400).json({
                error: "Username invalid",
                refreshedTokenMessage: res.locals.refreshedTokenMessage
            });
        }
        const category = await categories.findOne({ type: type });
        if (!category) {
            return res.status(400).json({
                error: "Category type invalid",
                refreshedTokenMessage: res.locals.refreshedTokenMessage
            });
        }

        // creating the new transaction
        const new_transactions = new transactions({ username, amount, type });
        await new_transactions.save();
        res.status(200).json({
            data: {
                username: new_transactions.username,
                type: new_transactions.type,
                amount: new_transactions.amount,
                date: new_transactions.date
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
 * Return all transactions made by all users
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having attributes `username`, `type`, `amount`, `date` and `color`
  - Optional behavior:
    - empty array must be returned if there are no transactions
 */
export const getAllTransactions = async (req, res) => {
    try {
        const authenticated = verifyAuth(req, res, { authType: "Admin" });
        if (!authenticated.flag) {
            return res.status(401).json({
                error: authenticated.cause
            });
        }
        /**
         * MongoDB equivalent to the query "SELECT * FROM transactions, categories WHERE transactions.type = categories.type"
         */

        let all_transactions = await transactions.aggregate([
            {
                $lookup: {
                    from: "categories",
                    localField: "type",
                    foreignField: "type",
                    as: "categories_info"
                }
            },
            { $unwind: "$categories_info" },
            {
                $project: {
                    "_id" : 0,
                    "username": "$username",
                    "type": "$type",
                    "amount": "$amount",
                    "date": "$date",
                    "color": "$categories_info.color"
                }
            }
        ]);

        // let result_data = all_transactions.map(v => Object.assign({}, {
        //     _id: v._id, username: v.username, amount: v.amount, type: v.type, color: v.categories_info.color, date: v.date
        // }));

        return res.status(200).json({
            data: all_transactions,
            refreshedTokenMessage: res.locals.refreshedTokenMessage
        });
    } catch (error) {
        res.status(500).json({
            error: error.message,
            refreshedTokenMessage: res.locals.refreshedTokenMessage
        })
    }
}

/**
 * Return all transactions made by a specific user
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having attributes `username`, `type`, `amount`, `date` and `color`
  - Optional behavior:
    - error 401 is returned if the user does not exist
    - empty array is returned if there are no transactions made by the user
    - if there are query parameters and the function has been called by a Regular user then the returned transactions must be filtered according to the query parameters
 */
export const getTransactionsByUser = async (req, res) => {
    try {
        //Distinction between route accessed by Admins or Regular users for functions that can be called by both
        //and different behaviors and access rights

        if (req.url.indexOf("/transactions/users/") >= 0) {
            const authenticated = verifyAuth(req, res, { authType: "Admin" });
            if (!authenticated.flag)
                return res.status(401).json({
                    error: authenticated.cause
                });
            if (req.params.username != ":username") {
                let user = await User.findOne({ username: req.params.username });
                if (!user)
                    return res.status(400).json({
                        error: "User doesn't exist",
                        refreshedTokenMessage: res.locals.refreshedTokenMessage
                    });
            }
            const requestedTransactions = await transactions.aggregate([
                { $match: (req.params.username && req.params.username != ":username") ? { username: req.params.username } : {} },
                {
                    $lookup: {
                        from: "categories",
                        localField: "type",
                        foreignField: "type",
                        as: "categories_info"
                    }
                },
                { $unwind: "$categories_info" },
                {
                    $project: {
                        "username": "$username",
                        "type": "$type",
                        "amount": "$amount",
                        "date": "$date",
                        "color": "$categories_info.color"
                    }
                }
            ]);
            return res.status(200).json({
                data: requestedTransactions,
                refreshedTokenMessage: res.locals.refreshedTokenMessage
            });
        } else {
            //Regular users can access only their transactions
            const authenticated = verifyAuth(req, res, { authType: "User", username: req.params.username });
            if (!authenticated.flag)
                return res.status(401).json({
                    error: authenticated.cause
                });
            if (req.params.username != ":username") {
                let user = await User.findOne({ username: req.params.username });
                if (!user)
                    return res.status(400).json({
                        error: "User doesn't exist",
                        refreshedTokenMessage: res.locals.refreshedTokenMessage
                    });
            }
            const filtro = {
                $and: [
                    { username: req.params.username },
                    (req.query.date || req.query.from || req.query.upTo) ? handleDateFilterParams(req) : {},
                    (req.query.minAmount || req.query.maxAmount) ? handleAmountFilterParams(req) : {}
                ]
            };
            const requestedTransactions = await transactions.aggregate([
                { $match: filtro },
                {
                    $lookup: {
                        from: "categories",
                        localField: "type",
                        foreignField: "type",
                        as: "categories_info"
                    }
                },
                { $unwind: "$categories_info" },
                {
                    $project: {
                        "username": "$username",
                        "type": "$type",
                        "amount": "$amount",
                        "date": "$date",
                        "color": "$categories_info.color"
                    }
                }
            ]);
            return res.status(200).json({
                data: requestedTransactions,
                refreshedTokenMessage: res.locals.refreshedTokenMessage
            });
        }

    } catch (error) {
        return res.status(500).json({
            error: error.message,
            refreshedTokenMessage: res.locals.refreshedTokenMessage
        });
    }
}

/**
 * Return all transactions made by a specific user filtered by a specific category
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having attributes `username`, `type`, `amount`, `date` and `color`, filtered so that `type` is the same for all objects
  - Optional behavior:
    - empty array is returned if there are no transactions made by the user with the specified category
    - error 401 is returned if the user or the category does not exist
 */
export const getTransactionsByUserByCategory = async (req, res) => {
    try {

        if (req.url.indexOf("/transactions/users/") >= 0) {
            const authenticatedAsAdmin = verifyAuth(req, res, { authType: "Admin" });
            if (!authenticatedAsAdmin.flag)
                return res.status(401).json({
                    error: authenticatedAsAdmin.cause
                });
            if (req.params.username != ":username") {
                let user = await User.findOne({ username: req.params.username });
                if (!user)
                    return res.status(400).json({
                        error: "User doesn't exist",
                        refreshedTokenMessage: res.locals.refreshedTokenMessage
                    });
            }
            const category = await categories.findOne({ type: req.params.category });
            if (!category)
                return res.status(400).json({
                    error: "Category doesn't exist",
                    refreshedTokenMessage: res.locals.refreshedTokenMessage
                });

            const filtro = {
                $and: [
                    (req.params.username && req.params.username != ":username") ? { username: req.params.username } : {},
                    { type: req.params.category }
                ]
            };

            const requestedTransactions = await transactions.aggregate([
                {
                    $lookup: {
                        from: "categories",
                        localField: "type",
                        foreignField: "type",
                        as: "categories_info"
                    }
                },
                { $unwind: "$categories_info" },
                {
                    $project: {
                        "username": "$username",
                        "type": "$type",
                        "amount": "$amount",
                        "date": "$date",
                        "color": "$categories_info.color"
                    }
                },
                { $match: filtro }
            ]);
            return res.status(200).json({
                data: requestedTransactions,
                refreshedTokenMessage: res.locals.refreshedTokenMessage
            });
        } else {
            const authenticatedAsUser = verifyAuth(req, res, { authType: "User", username: req.params.username });
            if (!authenticatedAsUser.flag)
                return res.status(401).json({
                    error: authenticatedAsUser.cause
                });
            if (req.params.username != ":username") {
                let user = await User.findOne({ username: req.params.username });
                if (!user)
                    return res.status(400).json({
                        error: "User doesn't exist",
                        refreshedTokenMessage: res.locals.refreshedTokenMessage
                    });
            }
            const category = await categories.findOne({ type: req.params.category });
            if (!category)
                return res.status(400).json({
                    error: "Category doesn't exist",
                    refreshedTokenMessage: res.locals.refreshedTokenMessage
                });
            const filtro = {
                $and: [
                    { username: req.params.username },
                    { type: req.params.category }
                ]
            };
            const requestedTransactions = await transactions.aggregate([
                {
                    $lookup: {
                        from: "categories",
                        localField: "type",
                        foreignField: "type",
                        as: "categories_info"
                    }
                },
                { $unwind: "$categories_info" },
                {
                    $project: {
                        "username": "$username",
                        "type": "$type",
                        "amount": "$amount",
                        "date": "$date",
                        "color": "$categories_info.color"
                    }
                },
                { $match: filtro }
            ]);
            return res.status(200).json({
                data: requestedTransactions,
                refreshedTokenMessage: res.locals.refreshedTokenMessage
            });
        }
    } catch (error) {
        return res.status(500).json({
            error: error.message,
            refreshedTokenMessage: res.locals.refreshedTokenMessage
        });
    }
}

/**
 * Return all transactions made by members of a specific group
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having attributes `username`, `type`, `amount`, `date` and `color`
  - Optional behavior:
    - error 401 is returned if the group does not exist
    - empty array must be returned if there are no transactions made by the group
 */
export const getTransactionsByGroup = async (req, res) => {
    try {
        //const urlElements = req.url.split("/");

        // Get the requested group 
        const groupName = req.params.name;
        const group = await Group.findOne({ name: groupName });

        if (!group) {
            return res.status(400).json({
                error: "Group not found"
            });
        }

        // Get an array of the emails of the members of the group
        const groupEmails = group.members.map(members => members.email);

        if ( req.route.path === "/groups/:name/transactions") {
            // Authenticate user (must be in the requested group)
            const authenticated = verifyAuth(req, res, { authType: "Group", emails: groupEmails });
            if (!authenticated.flag) {
                return res.status(401).json({
                    error: authenticated.cause
                });
            }
        }

        else if (req.route.path === "/transactions/groups/:name") {
            // Authenticate admin (must be an admin)
            const authenticated = verifyAuth(req, res, { authType: "Admin" });
            if (!authenticated.flag) {
                return res.status(401).json({
                    error: authenticated.cause
                });
            };
        }

        // Get an array of the usernames of the members of the group
        var groupUsernames = await User.find({ email: { $in: groupEmails } });
        groupUsernames = groupUsernames.map(member => member.username);

        // Perform the query: 

        // SELECT T.username, T.type, T.amount, T.date, C.color
        // FROM transactions T INNER JOIN categories C ON T.type = C.type
        // WHERE T.username in groupUsernames;

        const requestedTransactions = await transactions.aggregate([
            {
                $lookup: {
                    from: "categories",
                    localField: "type",
                    foreignField: "type",
                    as: "categories_info"
                }
            },
            { $unwind: "$categories_info" },
            { $match: { username: { $in: groupUsernames } } },
            {
                $project: {
                    "_id" : 0,
                    "username": "$username",
                    "type": "$type",
                    "amount": "$amount",
                    "date": "$date",
                    "color": "$categories_info.color"
                }
            }
        ]);

        return res.status(200).json({
            data: requestedTransactions,
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
 * Return all transactions made by members of a specific group filtered by a specific category
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having attributes `username`, `type`, `amount`, `date` and `color`, filtered so that `type` is the same for all objects.
  - Optional behavior:
    - error 401 is returned if the group or the category does not exist
    - empty array must be returned if there are no transactions made by the group with the specified category
 */
export const getTransactionsByGroupByCategory = async (req, res) => {
    try {
        //const urlElements = req.url.split("/");

        // Get the requested group 
        const groupName = req.params.name;
        const group = await Group.findOne({ name: groupName });

        if (!group) {
            return res.status(400).json({
                error: "Group not found"
            });
        }

        // Get an array of the emails of the members of the group
        const groupEmails = group.members.map(members => members.email);

        if (req.route.path === "/groups/:name/transactions/category/:category") {
            // Authenticate user (must be in the requested group)
            const authenticated = verifyAuth(req, res, { authType: "Group", emails: groupEmails });
            if (!authenticated.flag) {
                return res.status(401).json({
                    error: authenticated.cause
                });
            }
        }

        else if (req.route.path === "/transactions/groups/:name/category/:category") {
            // Authenticate admin (must be an admin)
            const authenticated = verifyAuth(req, res, { authType: "Admin" });
            if (!authenticated.flag) {
                return res.status(401).json({
                    error: authenticated.cause
                });
            };
        }

        const category = await categories.findOne({ type: req.params.category });
        if (!category) {
            return res.status(400).json({
                error: "Category not found",
                refreshedTokenMessage: res.locals.refreshedTokenMessage
            })
        }

        // Get an array of the usernames of the members of the group
        var groupUsernames = await User.find({ email: { $in: groupEmails } });
        groupUsernames = groupUsernames.map(member => member.username);

        // Perform the query: 

        // SELECT T.username, T.type, T.amount, T.date, C.color
        // FROM transactions T INNER JOIN categories C ON T.type = C.type
        // WHERE T.username in groupUsernames AND
        //       T.category = categoryName

        const requestedTransactions = await transactions.aggregate([
            {
                $lookup: {
                    from: "categories",
                    localField: "type",
                    foreignField: "type",
                    as: "categories_info"
                }
            },
            { $unwind: "$categories_info" },
            { $match: { $and: [{ username: { $in: groupUsernames } }, { type: req.params.category }] } },
            {
                $project: {
                    "_id" : 0,
                    "username": "$username",
                    "type": "$type",
                    "amount": "$amount",
                    "date": "$date",
                    "color": "$categories_info.color"
                }
            }
        ]);

        return res.status(200).json({
            data: requestedTransactions,
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
 * Delete a transaction made by a specific user
  - Request Body Content: The `_id` of the transaction to be deleted
  - Response `data` Content: A string indicating successful deletion of the transaction
  - Optional behavior:
    - error 401 is returned if the user or the transaction does not exist
 */
export const deleteTransaction = async (req, res) => {
    try {
        var transactionId = req.body._id;
        var username = req.params.username;

        /*var authenticated = verifyAuth(req, res, {authType : "Admin"});
        if(!authenticated.flag){
            authenticated = verifyAuth(req, res, {authType : "User", username : username});
            if(!authenticated.flag){
                return res.status(401).json({
                    error : authenticated.cause
                });
            }
        }*/
        const { flag, cause } = verifyAuth(req, res, { authType: "User", username: username });
        if (!flag) {
            return res.status(401).json({ error: cause });
        }

        if (typeof transactionId === "undefined" || transactionId === null) {
            return res.status(400).json({
                error: "Request body does not contain all the necessary attributes",
                refreshedTokenMessage: res.locals.refreshedTokenMessage
            });
        }

        if (transactionId === ""){
            return res.status(400).json({
                error: "Transaction ID is an empty string",
                refreshedTokenMessage: res.locals.refreshedTokenMessage
            });
        }

        // find the user, owner of the transaction
        const user = await User.findOne({ username: req.params.username });
        if (!user)
            return res.status(400).json({
                error: "User of the transaction does not exist",
                refreshedTokenMessage: res.locals.refreshedTokenMessage
            });

        // find the transaction that is linked to that the specific user
        const trs = await transactions.findOne({ _id: transactionId, username: username });
        if (!trs) {
            return res.status(400).json({
                error: `${transactionId} does not correspond to any transaction`,
                refreshedTokenMessage: res.locals.refreshedTokenMessage
            });
        }

        await transactions.deleteOne({ _id: req.body._id });
        return res.status(200).json({
            data: { message: "Transaction has been deleted" },
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
 * Delete multiple transactions identified by their ids
  - Request Body Content: An array of strings that lists the `_ids` of the transactions to be deleted
  - Response `data` Content: A message confirming successful deletion
  - Optional behavior:
    - error 401 is returned if at least one of the `_ids` does not have a corresponding transaction. Transactions that have an id are not deleted in this case
 */
export const deleteTransactions = async (req, res) => {
    try {
        // Check admin authentication
        const authenticated = verifyAuth(req, res, { authType: "Admin" });
        if (!authenticated.flag) {
            return res.status(401).json({
                error: authenticated.cause
            });
        }

        // Get _ids of transactions
        const { _ids } = req.body;

        if (!_ids || _ids.length == 0) {
            return res.status(400).json({
                error: "Input is not valid",
                refreshedTokenMessage: res.locals.refreshedTokenMessage
            });
        }
        // Each _id must be a valid one
        for (const _id of _ids) {
            if (_id == "") {
                return res.status(400).json({
                    error: `empty string passed`,
                    refreshedTokenMessage: res.locals.refreshedTokenMessage
                });
            }
            const transaction = await transactions.findById(_id);
            if (!transaction) {
                return res.status(400).json({
                    error: `${_id} does not correspond to any transaction`,
                    refreshedTokenMessage: res.locals.refreshedTokenMessage
                });
            }
        }
        // Delete each single transaction
        for (const _id of _ids) {
            await transactions.deleteOne({ _id: req.body._id });
        }
        return res.status(200).json({
            data: { message: "Transcations Deleted" },
            refreshedTokenMessage: res.locals.refreshedTokenMessage
        });
    } catch (error) {
        return res.status(500).json({
            error: error.message,
            refreshedTokenMessage: res.locals.refreshedTokenMessage
        });
    }
}
