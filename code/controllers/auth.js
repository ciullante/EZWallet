import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import jwt from 'jsonwebtoken';
import { verifyAuth } from './utils.js';

export function isValidEmail(email) {
    const regex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return regex.test(email);
}

export function isValidFloat(str) {
    const regex = /^[-+]?[0-9]*(?:\.[0-9]*)?(?:[eE][-+]?[0-9]+)?$/;
    return regex.test(str);
}

/**
 * Register a new user in the system
  - Request Body Content: An object having attributes `username`, `email` and `password`
  - Response `data` Content: A message confirming successful insertion
  - Optional behavior:
    - error 400 is returned if there is already a user with the same username and/or email
 */
export const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        if(!username || !email || !password || username == "" || email == "" || password == ""){
            return res.status(400).json({
                error: "parameters are not valid",
                refreshedTokenMessage: res.locals.refreshedTokenMessage
            });
        }

        const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
        const emailFormat = email.match(emailRegex);
        if (!emailFormat) {
            return res.status(400).json({
                error: "email format is not correct",
                refreshedTokenMessage: res.locals.refreshedTokenMessage
            });
        }
        const existingUserEmail = await User.findOne({ email: req.body.email });
        const existingUsername = await User.findOne({ username: req.body.username });
        if (existingUserEmail || existingUsername)
            return res.status(400).json({
                error: "you are already registered",
                refreshedTokenMessage: res.locals.refreshedTokenMessage
            });

        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = await User.create({
            username,
            email,
            password: hashedPassword
        });

        return res.status(200).json({
            data: { message: 'User added succesfully' },
            refreshedTokenMessage: res.locals.refreshedTokenMessage
        });
    } catch (err) {
        return res.status(500).json({
            error: err.message,
            refreshedTokenMessage: res.locals.refreshedTokenMessage
        });
    }
};

/**
 * Register a new user in the system with an Admin role
  - Request Body Content: An object having attributes `username`, `email` and `password`
  - Response `data` Content: A message confirming successful insertion
  - Optional behavior:
    - error 400 is returned if there is already a user with the same username and/or email
 */
export const registerAdmin = async (req, res) => {
    try {
        // In order to register a new admin, you have to be an admin
        // In this mock implementation, anybody can create an admin. 
        // This is a characteristic which has to be removed for the deployment

        // const authenticated = verifyAuth(req, res, {authType : "Admin"});
        // if(!authenticated.authorized){
        //     return res.status(401).json({data : { message : authenticated.cause}});
        // }

        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                error: "Body error"
            });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({
                error: "Format of email is not valid"
            });
        }

        const existingUserEmail = await User.findOne({ email: req.body.email });
        const existingUsername = await User.findOne({ username: req.body.username });
        if (existingUserEmail || existingUsername) {
            return res.status(400).json({
                error: "You are already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        await User.create({
            username,
            email,
            password: hashedPassword,
            role: "Admin"
        });
        res.status(200).json({ data: { message: "User registered successfully" } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

/**
 * Perform login 
  - Request Body Content: An object having attributes `email` and `password`
  - Response `data` Content: An object with the created accessToken and refreshToken
  - Optional behavior:
    - error 400 is returned if the user does not exist
    - error 400 is returned if the supplied password does not match with the one in the database
 */
export const login = async (req, res) => {
    try {

        /*---------------------------------- VALIDITY CHECKS ---------------------------------------------*/
        const { email, password } = req.body;

        if ( !email || !password ) {
            return res.status(400).json({ error: "Body error" });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({ error: "Not a valid formatted email" });
        }

        const existingUser = await User.findOne({ email: email })
        if (!existingUser) return res.status(400).json({ error: "user not found, please register" });

        //Check if is already logged in (verifyAuth will update access token if necessary)
        const { flag, cause } = verifyAuth(req, res, { authType: "User", username: existingUser.username });
        if (flag) {
            return res.status(401).json({ error: cause });
        }
        //else we create tokens
        const match = await bcrypt.compare(password, existingUser.password)
        if (!match) return res.status(400).json({ error: 'wrong credentials' })
        //CREATE ACCESSTOKEN
        const accessToken = jwt.sign({
            email: existingUser.email,
            id: existingUser.id,
            username: existingUser.username,
            role: existingUser.role
        }, process.env.ACCESS_KEY, { expiresIn: '1h' })
        //CREATE REFRESH TOKEN
        const refreshToken = jwt.sign({
            email: existingUser.email,
            id: existingUser.id,
            username: existingUser.username,
            role: existingUser.role
        }, process.env.ACCESS_KEY, { expiresIn: '7d' })
        //SAVE REFRESH TOKEN TO DB
        existingUser.refreshToken = refreshToken
        const savedUser = await existingUser.save()
        res.cookie("accessToken", accessToken, { httpOnly: true, domain: "localhost", path: "/api", maxAge: 60 * 60 * 1000, sameSite: "none", secure: true })
        res.cookie('refreshToken', refreshToken, { httpOnly: true, domain: "localhost", path: '/api', maxAge: 7 * 24 * 60 * 60 * 1000, sameSite: 'none', secure: true })
        res.status(200).json({
            data: { accessToken: accessToken, refreshToken: refreshToken }
        })
    } catch (error) {
        return res.status(500).json({
            error: error.message,
            refreshedTokenMessage: res.locals.refreshedTokenMessage
        });
    }
}

/**
 * Perform logout
  - Auth type: Simple
  - Request Body Content: None
  - Response `data` Content: A message confirming successful logout
  - Optional behavior:
    - error 400 is returned if the user does not exist
 */
export const logout = async (req, res) => {
    try {
        

        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken)
            return res.status(400).json({
                error: "RefreshToken does not exist",
                refreshedTokenMessage: res.locals.refreshedTokenMessage
            });
        const user = await User.findOne({ refreshToken: refreshToken });
        if (!user) {
            return res.status(400).json({
                error: "User does not exist",
                refreshedTokenMessage: res.locals.refreshedTokenMessage
            });
        }
        
        user.refreshToken = null;
        res.cookie("accessToken", "", { httpOnly: true, path: '/api', maxAge: 0, sameSite: 'none', secure: true });
        res.cookie('refreshToken', "", { httpOnly: true, path: '/api', maxAge: 0, sameSite: 'none', secure: true });
        await user.save();
        res.status(200).json({
            data: { message: "User logged out" }
        });
    } catch (error) {
        res.status(500).json({
            error: error.message,
            refreshedTokenMessage: res.locals.refreshedTokenMessage
        });
    }
}
