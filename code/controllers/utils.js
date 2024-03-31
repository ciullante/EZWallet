import jwt, { decode } from 'jsonwebtoken'
import { Group } from '../models/User.js';
import { getTransactionsByUserByCategory } from './controller.js';

/**
 * Handle possible date filtering options in the query parameters for getTransactionsByUser when called by a Regular user.
 * @param req the request object that can contain query parameters
 * @returns an object that can be used for filtering MongoDB queries according to the `date` parameter.
 *  The returned object must handle all possible combination of date filtering parameters, including the case where none are present.
 *  Example: {date: {$gte: "2023-04-30T00:00:00.000Z"}} returns all transactions whose `date` parameter indicates a date from 30/04/2023 (included) onwards
 * @throws an error if the query parameters include `date` together with at least one of `from` or `upTo`
 */
export const handleDateFilterParams = (req) => {
    const { date, from, upTo } = req.query;
    const formatRegex = /^\d{4}-\d{2}-\d{2}$/;

    // check if from or upTo are in the params
    if (date && (from || upTo)) {
        throw new Error("cannot include 'date' with 'from' or 'upTo'");
    }
    
    let filter = {};
    filter.date = {};
    if(date){
        if(!formatRegex.test(date)) throw new Error("Query parameters are not in the format 'YYYY-MM-DD'");
        const dFrom = new Date(date);
        const dUpTo = new Date(date);
        dUpTo.setHours(23,59,59,999);
        //filter.date = {$eq: new Date(date)};   
        filter.date.$gte = dFrom;
        filter.date.$lte = dUpTo;
    } 
    else{
        // Handle both case
        if(from && upTo){
            if(!formatRegex.test(from) || !formatRegex.test(upTo)) 
                throw new Error("Query parameters are not in the format 'YYYY-MM-DD'");
            const dFrom = new Date(from);
            const dUpTo = new Date(upTo);
            dUpTo.setHours(23,59,59,999);
            //if(dFrom > dUpTo) throw new Error("cannot have a time span with from 'greater' than 'upTo'");
            filter.date.$gte = dFrom;
            filter.date.$lte = dUpTo;
        }
        // Handle From case
        if(from && !upTo){
            if(!formatRegex.test(from)) 
                throw new Error("Query parameters are not in the format 'YYYY-MM-DD'");
            filter.date.$gte = new Date(from);
        }
        // Handle upTo case
        if(upTo && !from) {
            if(!formatRegex.test(upTo)) 
                throw new Error("Query parameters are not in the format 'YYYY-MM-DD'");
            const upToDate = new Date(upTo);
            upToDate.setHours(23,59,59,999);
            filter.date.$lte = upToDate;
        }    
    } 

    return filter;
}

/**
 * Handle possible authentication modes depending on `authType`
 * @param req the request object that contains cookie information
 * @param res the result object of the request
 * @param info an object that specifies the `authType` and that contains additional information, depending on the value of `authType`
 *      Example: {authType: "Simple"}
 *      Additional criteria:
 *          - authType === "User":
 *              - either the accessToken or the refreshToken have a `username` different from the requested one => error 401
 *              - the accessToken is expired and the refreshToken has a `username` different from the requested one => error 401
 *              - both the accessToken and the refreshToken have a `username` equal to the requested one => success
 *              - the accessToken is expired and the refreshToken has a `username` equal to the requested one => success
 *          - authType === "Admin":
 *              - either the accessToken or the refreshToken have a `role` which is not Admin => error 401
 *              - the accessToken is expired and the refreshToken has a `role` which is not Admin => error 401
 *              - both the accessToken and the refreshToken have a `role` which is equal to Admin => success
 *              - the accessToken is expired and the refreshToken has a `role` which is equal to Admin => success
 *          - authType === "Group":
 *              - either the accessToken or the refreshToken have a `email` which is not in the requested group => error 401
 *              - the accessToken is expired and the refreshToken has a `email` which is not in the requested group => error 401
 *              - both the accessToken and the refreshToken have a `email` which is in the requested group => success
 *              - the accessToken is expired and the refreshToken has a `email` which is in the requested group => success
 * @returns true if the user satisfies all the conditions of the specified `authType` and false if at least one condition is not satisfied
 *  Refreshes the accessToken if it has expired and the refreshToken is still valid
 */
export const verifyAuth = (req, res, info) => {
    const cookie = req.cookies
    if (!cookie.accessToken || !cookie.refreshToken) {
        return {flag : false, cause : "Unauthorized"};
    }
    try {
        const decodedAccessToken = jwt.verify(cookie.accessToken, process.env.ACCESS_KEY);
        const decodedRefreshToken = jwt.verify(cookie.refreshToken, process.env.ACCESS_KEY);
        // All the elements of the Access Token must be present
        if (!decodedAccessToken.username || !decodedAccessToken.email || !decodedAccessToken.role) {
            return { flag : false, cause : "Token is missing information"};
        }
        // All the elements of the Refresh Token must be present
        if (!decodedRefreshToken.username || !decodedRefreshToken.email || !decodedRefreshToken.role) {
            return { flag : false, cause : "Token is missing information"};
        }
        // The values of access and refresh token must be consistent
        if (decodedAccessToken.username !== decodedRefreshToken.username || decodedAccessToken.email !== decodedRefreshToken.email || decodedAccessToken.role !== decodedRefreshToken.role) {
            return { flag : false, cause : "Mismatched users"};
        }
        if(info.authType == "Simple"){
            return {flag : true, cause : "authorized"};
        }
        // Case verification is associated to a certain user AND accessToken is valid
        if(info.authType == "User"){
            if(decodedAccessToken.username !== info.username){
                return { flag: false, cause: "Not authorized for action on this user." };
            }
            return {flag : true, cause : "authorized"};
        }
        // Case verification is associated to an admin AND accessToken is valid
        if(info.authType == "Admin"){
            if(decodedAccessToken.role !== info.authType){
                return { flag: false, cause: "Not authorized for this action" };
            }
            return {flag : true, cause : "authorized"};
        }
        // Case verification is associated to an admin AND accessToken is valid
        if(info.authType == "Group"){
            if(!info.emails.includes(decodedAccessToken.email)){
                return { flag: false, cause: "Not authorized for this action" };
            }
            return {flag : true, cause : "authorized"};
        }
    
        return { flag: false, cause: "Not authorized for this action" };

    } catch (err) {
        // Case in which the access token is expired
        if (err.name === "TokenExpiredError") {
            try {
                const refreshToken = jwt.verify(cookie.refreshToken, process.env.ACCESS_KEY)
                var return_object = {flag : true, cause : "authorized"};
                if (info.authType == "Simple"){
                    return_object = {flag : true, cause : "authorized"};    
                }
                else if (info.authType == "User") {
                    if (refreshToken.username != info.username) {
                        return {flag : false, cause : "Not valid token for the request user"};
                    }
                }
                else if (info.authType == "Admin") {
                    if(refreshToken.role !== info.authType){
                        return {flag : false, cause : "Not valid token for the request role"};
                    }
                }
                else if (info.authType == "Group"){
                    if (!info.emails.includes(refreshToken.email)) {       
                        return {flag : false, cause : "Not valid token for the request role"};
                    }
                }
                else{   
                    return {flag : false, cause : "Not valid token for the request role"};
                }

                const newAccessToken = jwt.sign({
                    username: refreshToken.username,
                    email: refreshToken.email,
                    id: refreshToken.id,
                    role: refreshToken.role
                }, process.env.ACCESS_KEY, { expiresIn: '1h' })

                res.cookie('accessToken', newAccessToken, { httpOnly: true, path: '/api', maxAge: 60 * 60 * 1000, sameSite: 'none', secure: true })
                res.locals.refreshedTokenMessage = 'Access token has been refreshed. Remember to copy the new one in the headers of subsequent calls'

                return {flag : true, cause : "authenticated"};

            } catch (err) {
                if (err.name === "TokenExpiredError") {
                    return {flag : false, cause : "Token expired, log-in again"};
                } else {
                    return {flag : false, cause : err.name};
                }
            }
        } else {
            return {flag : false, cause : err.name};
        }
    }
}

/**
 * Handle possible amount filtering options in the query parameters for getTransactionsByUser when called by a Regular user.
 * @param req the request object that can contain query parameters
 * @returns an object that can be used for filtering MongoDB queries according to the `amount` parameter.
 *  The returned object must handle all possible combination of amount filtering parameters, including the case where none are present.
 *  Example: {amount: {$gte: 100}} returns all transactions whose `amount` parameter is greater or equal than 100
 */
export const handleAmountFilterParams = (req) => {
    // I consider a min amount and a max amount to consider (>min and <max)
    const {min, max} = req.query;
    let filter = {};
    filter.amount = {};
    // assigning the range for the possible query
    if(min){
        if(isNaN(parseFloat(min))) throw new Error("A parameter is not a numerical value");
        filter.amount.$gte = parseFloat(min);   
    } 
    if(max) {
        if(isNaN(parseFloat(max))) throw new Error("A parameter is not a numerical value");
        filter.amount.$lte = parseFloat(max);
    }
    /*if(min > max){
        throw new Error("Cannot have minAmount higher than maxAmount");
    }*/
    return filter;
}