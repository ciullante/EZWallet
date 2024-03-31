import { handleDateFilterParams, verifyAuth, handleAmountFilterParams } from '../controllers/utils';
import jwt from 'jsonwebtoken';
jest.mock('jsonwebtoken');

describe("handleDateFilterParams", () => { 

    test("cannot include 'date' with 'from' or 'upTo'", () => {
        const mockReq = {
            query: {
                date: '2020-01-01',
                from: '2020-01-01',
                upTo: '2020-01-01'
            }
        };

        expect(() => handleDateFilterParams(mockReq)).toThrow("cannot include 'date' with 'from' or 'upTo'");
    });

    test('should return a filter if there is only date', () => {
        const mockReq = {
            query: {
                date: '2020-01-01'
            }
        };
        const dFrom = new Date('2020-01-01');
        const dUpTo = new Date('2020-01-01');
        dUpTo.setHours(23,59,59,999);
        expect(handleDateFilterParams(mockReq)).toEqual({date: {$gte: dFrom, $lte: dUpTo}});
    });

    test('should return a filter if there is only from', () => {
        const mockReq = {
            query: {
                from: '2020-01-01'
            }
        };
        const dFrom = new Date('2020-01-01');
        expect(handleDateFilterParams(mockReq)).toEqual({date: {$gte: dFrom}});
    });

    test('should return a filter if there is only upTo', () => {
        const mockReq = {
            query: {
                upTo: '2020-01-01'
            }
        };
        const upToDate = new Date('2020-01-01');
        upToDate.setHours(23,59,59,999);
        expect(handleDateFilterParams(mockReq)).toEqual({date: {$lte: upToDate}});
    });

    test('should return a filter if there is only from and upTo', () => {
        const mockReq = {
            query: {
                from: '2020-01-01',
                upTo: '2020-01-02'
            }
        };


        const fromDate = new Date(mockReq.query.from);
        const upToDate = new Date(mockReq.query.upTo);
        upToDate.setHours(23,59,59,999);

        expect(handleDateFilterParams(mockReq)).toEqual({date: {$gte: fromDate, $lte: upToDate}});
    });

    /*test('should have an exception if there is from and upTo and from is greater than upTo', () => {
        const mockReq = {
            query: {
                from: '2020-01-02',
                upTo: '2020-01-01'
            }
        };

        expect(() => handleDateFilterParams(mockReq)).toThrow("cannot have a time span with from 'greater' than 'upTo'");
    });*/

    test('should have an empty filter if there is not any date filter', () => {
        const mockReq = {
            query: {}
        };

        expect(handleDateFilterParams(mockReq)).toEqual({date: {}});
    });

    test("should has an error if date is not valid", () => {
        const mockReq = {
            query: {
                date: '2020/05/30'
            }
        };

        expect(() => handleDateFilterParams(mockReq)).toThrow("Query parameters are not in the format 'YYYY-MM-DD'");
    });

    test("should have an error if dates 'from' and/or 'upTo' are not valid", () => {
        const mockReq = {
            query: {
                from: '2020/05/30',
                upTo: '2020/05/30'
            }
        };

        expect(() => handleDateFilterParams(mockReq)).toThrow("Query parameters are not in the format 'YYYY-MM-DD'");
    });

    test("should has an error if date 'from' is not valid", () => {
        const mockReq = {
            query: {
                from: '2020/05/30'
            }
        };

        expect(() => handleDateFilterParams(mockReq)).toThrow("Query parameters are not in the format 'YYYY-MM-DD'");
    });

    test("should has an error if date 'upTo' is not valid", () => {
        const mockReq = {
            query: {
                upTo: '2020/05/30'
            }
        };

        expect(() => handleDateFilterParams(mockReq)).toThrow("Query parameters are not in the format 'YYYY-MM-DD'");
    });
})

describe("verifyAuth", () => { 
    test("should return false if accessToken and/or refreshToken are missing", () => {
        const mockReq = {
            cookies: {}
        };
        const mockRes = {
            flag: jest.fn().mockReturnThis(),
            cause: jest.fn().mockReturnThis()
        };
        expect(verifyAuth(mockReq, mockRes, () => {})).toEqual({flag: false, cause: "Unauthorized"});
    });

    test("should return false if at least one of the elemets of the accessToken is missing", () => {
        const mockReq = {
            cookies: {
                accessToken: "accessToken",
                refreshToken: "refreshToken"
            }
        };
        const mockRes = {
            flag: jest.fn().mockReturnThis(),
            cause: jest.fn().mockReturnThis()
        };
        jest.spyOn(jwt, 'verify').mockImplementation(() => {
            return {email: "email", role: "role"};
        });

        expect(verifyAuth(mockReq, mockRes, () => {})).toEqual({flag: false, cause: "Token is missing information"});
    });

    test("should return false if at least one of the elements of the refreshToken is missing", () => {
        const mockReq = {
            cookies: {
                accessToken: "accessToken",
                refreshToken: "refreshToken"
            }
        };
        const mockRes = {
            flag: jest.fn().mockReturnThis(),
            cause: jest.fn().mockReturnThis()
        }
        jest.spyOn(jwt, 'verify').mockImplementationOnce(() => {
            return {username: "username", email: "email", role: "role"};
        }); 
        jest.spyOn(jwt, 'verify').mockImplementationOnce(() => {
            return {email: "email", role: "role"};
        });
        expect(verifyAuth(mockReq, mockRes, () => {})).toEqual({flag: false, cause: "Token is missing information"});

    });

    test("should return false if the elements of the accessToken and refreshToken are not consistent", () => {
        const mockReq = {
            cookies: {
                accessToken: "accessToken",
                refreshToken: "refreshToken"
            }
        };
        const mockRes = {
            flag: jest.fn().mockReturnThis(),
            cause: jest.fn().mockReturnThis()
        };
        const decodedAccessToken = jest.spyOn(jwt, 'verify').mockImplementationOnce(() => {
            return {username: "username1", email: "email1", role: "role"};
        }); 
        const decodedRefreshToken = jest.spyOn(jwt, 'verify').mockImplementationOnce(() => {
            return {username: "username2", email: "email2", role: "role"};
        });
        expect(verifyAuth(mockReq, mockRes, () => {})).toEqual({flag: false, cause: "Mismatched users"});
    });
    
    test("should return true if the authorization is of type simple", () => {
        const mockReq = {
            cookies: {
                accessToken: "accessToken",
                refreshToken: "refreshToken"
            }
        };
        const mockRes = {
            flag: jest.fn().mockReturnThis(),
            cause: jest.fn().mockReturnThis()
        };
        const info = {authType: "Simple"};
        jest.spyOn(jwt, 'verify').mockImplementation(() => {
            return {username: "username", email: "email", role: "role"};
        });
        expect(verifyAuth(mockReq, mockRes, info)).toEqual({flag: true, cause: "authorized"});
    });

    test("should return true if the authorization is of type user and accessToken is valid", () => {
        const mockReq = {
            cookies: {
                accessToken: "accessToken",
                refreshToken: "refreshToken"
            }
        };
        const mockRes = {
            flag: jest.fn().mockReturnThis(),
            cause: jest.fn().mockReturnThis()
        };
        const info = {authType: "User", username: "username"};
        jest.spyOn(jwt, 'verify').mockImplementation(() => {
            return {username: "username", email: "email", role: "role"};
        });
        expect(verifyAuth(mockReq, mockRes, info)).toEqual({flag: true, cause: "authorized"});
    });

    test("should return false if the authorization is of type user and accessToken is not valid", () => {
        const mockReq = {
            cookies: {
                accessToken: "accessToken",
                refreshToken: "refreshToken"
            }
        };
        const mockRes = {
            flag: jest.fn().mockReturnThis(),
            cause: jest.fn().mockReturnThis()
        };
        const info = {authType: "User", username: "username2"};
        jest.spyOn(jwt, 'verify').mockImplementation(() => {
            return {username: "username", email: "email", role: "role"};
        });
        expect(verifyAuth(mockReq, mockRes, info)).toEqual({flag: false, cause: "Not authorized for action on this user."});
    });

    test("should return true if the authentication is of type admin and accessToken is valid" , () => {
        const mockReq = {
            cookies: {
                accessToken: "accessToken",
                refreshToken: "refreshToken"
            }
        };
        const mockRes = {
            flag: jest.fn().mockReturnThis(),
            cause: jest.fn().mockReturnThis()
        };
        const info = {authType: "Admin"};
        jest.spyOn(jwt, 'verify').mockImplementation(() => {
            return {username: "username", email: "email", role: "Admin"};
        });
        expect(verifyAuth(mockReq, mockRes, info)).toEqual({flag: true, cause: "authorized"});
    });

    test("should return false if the authorization is of type admin and accessToken is not valid", () => {
        const mockReq = {
            cookies: {
                accessToken: "accessToken",
                refreshToken: "refreshToken"
            }
        };
        const mockRes = {
            flag: jest.fn().mockReturnThis(),
            cause: jest.fn().mockReturnThis()
        };
        const info = {authType: "Admin"};
        jest.spyOn(jwt, 'verify').mockImplementation(() => {
            return {username: "username", email: "email", role: "User"};
        });
        expect(verifyAuth(mockReq, mockRes, info)).toEqual({flag: false, cause: "Not authorized for this action"});
    });

    test("should return true if the authentication is of type Group and accessToken is valid" , () => {
        const mockReq = {
            cookies: {
                accessToken: "accessToken",
                refreshToken: "refreshToken"
            }
        };
        const mockRes = {
            flag: jest.fn().mockReturnThis(),
            cause: jest.fn().mockReturnThis()
        };
        const info = {authType: "Group", emails: ["email", "email2"]};
        jest.spyOn(jwt, 'verify').mockImplementation(() => {
            return {username: "username", email: "email", role: "User"};
        });
        expect(verifyAuth(mockReq, mockRes, info)).toEqual({flag: true, cause: "authorized"});
    });

    test("should return false if the authorization is of type Group and accessToken is not valid", () => {
        const mockReq = {
            cookies: {
                accessToken: "accessToken",
                refreshToken: "refreshToken"
            }
        };
        const mockRes = {
            flag: jest.fn().mockReturnThis(),
            cause: jest.fn().mockReturnThis()
        };
        const info = {authType: "Group", emails: ["email", "email2"]};
        jest.spyOn(jwt, 'verify').mockImplementation(() => {
            return {username: "username", email: "email3", role: "User"};
        });
        expect(verifyAuth(mockReq, mockRes, info)).toEqual({flag: false, cause: "Not authorized for this action"});
    });

    test("should return false if the authorization is of type which is not supported", () => {
        const mockReq = {
            cookies: {
                accessToken: "accessToken",
                refreshToken: "refreshToken"
            }
        };
        const mockRes = {
            flag: jest.fn().mockReturnThis(),
            cause: jest.fn().mockReturnThis()
        };
        const info = {authType: "Regular"};
        jest.spyOn(jwt, 'verify').mockImplementation(() => {
            return {username: "username", email: "email", role: "User"};
        });
        expect(verifyAuth(mockReq, mockRes, info)).toEqual({flag: false, cause: "Not authorized for this action"});
    });

    test("should return true if the authentication is of type simple but the accessToken has been refreshed", () => {
        
        const mockReq = {
            cookies: {
                accessToken: "accessToken", 
                refreshToken: "accessToken"
            }
        }
        const mockRes = {
            flag: jest.fn().mockReturnThis(),
            cause: jest.fn().mockReturnThis(),
            cookie: jest.fn(), 
            locals: { refreshedTokenMessage: "refreshedTokenMessage" }
        }
        const info = { authType: "Simple"};

        jwt.verify.mockImplementationOnce(() => {
            throw {name: "TokenExpiredError"}});
        jwt.verify.mockReturnValueOnce({username: "username", email: "email", role: "User"});
        const newAccessToken = {username: "username", email: "email", role: "User", id: 0};
        jwt.sign.mockReturnValueOnce(newAccessToken);
        expect(verifyAuth(mockReq, mockRes, info)).toEqual({flag: true, cause: "authenticated"});
        expect(mockRes.cookie).toHaveBeenCalledWith("accessToken", newAccessToken, {httpOnly: true, maxAge: 3600000, path: "/api", secure: true, sameSite: "none"});
        expect(mockRes.locals.refreshedTokenMessage).toEqual("Access token has been refreshed. Remember to copy the new one in the headers of subsequent calls");
    });

    test("should return true if the authentication is of type user but the accessToken has been refreshed", () => {
        
        const mockReq = {
            cookies: {
                accessToken: "accessToken", 
                refreshToken: "accessToken"
            }
        }
        const mockRes = {
            flag: jest.fn().mockReturnThis(),
            cause: jest.fn().mockReturnThis(),
            cookie: jest.fn(), 
            locals: { refreshedTokenMessage: "refreshedTokenMessage" }
        }
        const info = { authType: "User", username: "username"};

        jwt.verify.mockImplementationOnce(() => {
            throw {name: "TokenExpiredError"}});
        jwt.verify.mockReturnValueOnce({username: "username", email: "email", role: "User"});
        const newAccessToken = {username: "username", email: "email", role: "User", id: 0};
        jwt.sign.mockReturnValueOnce(newAccessToken);
        expect(verifyAuth(mockReq, mockRes, info)).toEqual({flag: true, cause: "authenticated"});
        expect(mockRes.cookie).toHaveBeenCalledWith("accessToken", newAccessToken, {httpOnly: true, maxAge: 3600000, path: "/api", secure: true, sameSite: "none"});
        expect(mockRes.locals.refreshedTokenMessage).toEqual("Access token has been refreshed. Remember to copy the new one in the headers of subsequent calls");
    });

    test("should return false if the authentication is of type user but the accessToken has been refreshed and not valid", () => {
        
        const mockReq = {
            cookies: {
                accessToken: "accessToken", 
                refreshToken: "accessToken"
            }
        }
        const mockRes = {
            flag: jest.fn().mockReturnThis(),
            cause: jest.fn().mockReturnThis(),
            cookie: jest.fn(), 
            locals: { refreshedTokenMessage: "refreshedTokenMessage" }
        }
        const info = { authType: "User", username: "username2"};

        jwt.verify.mockImplementationOnce(() => {
            throw {name: "TokenExpiredError"}});
        jwt.verify.mockReturnValueOnce({username: "username", email: "email", role: "User"});
        
        expect(verifyAuth(mockReq, mockRes, info)).toEqual({flag: false, cause: "Not valid token for the request user"});
        
    });

    test("should return true if the authentication is of type admin but the accessToken has been refreshed", () => {
        
        const mockReq = {
            cookies: {
                accessToken: "accessToken", 
                refreshToken: "accessToken"
            }
        }
        const mockRes = {
            flag: jest.fn().mockReturnThis(),
            cause: jest.fn().mockReturnThis(),
            cookie: jest.fn(), 
            locals: { refreshedTokenMessage: "refreshedTokenMessage" }
        }
        const info = { authType: "Admin"};

        jwt.verify.mockImplementationOnce(() => {
            throw {name: "TokenExpiredError"}});
        jwt.verify.mockReturnValueOnce({username: "username", email: "email", role: "Admin"});
        const newAccessToken = {username: "username", email: "email", role: "Admin", id: 0};
        jwt.sign.mockReturnValueOnce(newAccessToken);
        expect(verifyAuth(mockReq, mockRes, info)).toEqual({flag: true, cause: "authenticated"});
        expect(mockRes.cookie).toHaveBeenCalledWith("accessToken", newAccessToken, {httpOnly: true, maxAge: 3600000, path: "/api", secure: true, sameSite: "none"});
        expect(mockRes.locals.refreshedTokenMessage).toEqual("Access token has been refreshed. Remember to copy the new one in the headers of subsequent calls");
    });

    test("should return false if the authentication is of type admin but the accessToken has been refreshed and not valid", () => {
        
        const mockReq = {
            cookies: {
                accessToken: "accessToken", 
                refreshToken: "accessToken"
            }
        }
        const mockRes = {
            flag: jest.fn().mockReturnThis(),
            cause: jest.fn().mockReturnThis(),
            cookie: jest.fn(), 
            locals: { refreshedTokenMessage: "refreshedTokenMessage" }
        }
        const info = { authType: "Admin"};

        jwt.verify.mockImplementationOnce(() => {
            throw {name: "TokenExpiredError"}});
        jwt.verify.mockReturnValueOnce({username: "username", email: "email", role: "User"});
        
        expect(verifyAuth(mockReq, mockRes, info)).toEqual({flag: false, cause: "Not valid token for the request role"});
        
    });

    test("should return true if the authentication is of type group but the accessToken has been refreshed", () => {
        
        const mockReq = {
            cookies: {
                accessToken: "accessToken", 
                refreshToken: "accessToken"
            }
        }
        const mockRes = {
            flag: jest.fn().mockReturnThis(),
            cause: jest.fn().mockReturnThis(),
            cookie: jest.fn(), 
            locals: { refreshedTokenMessage: "refreshedTokenMessage" }
        }
        const info = { authType: "Group", emails: ["email", "email2"]};

        jwt.verify.mockImplementationOnce(() => {
            throw {name: "TokenExpiredError"}});
        jwt.verify.mockReturnValueOnce({username: "username", email: "email", role: "User"});
        const newAccessToken = {username: "username", email: "email", role: "User", id: 0};
        jwt.sign.mockReturnValueOnce(newAccessToken);
        expect(verifyAuth(mockReq, mockRes, info)).toEqual({flag: true, cause: "authenticated"});
        expect(mockRes.cookie).toHaveBeenCalledWith("accessToken", newAccessToken, {httpOnly: true, maxAge: 3600000, path: "/api", secure: true, sameSite: "none"});
        expect(mockRes.locals.refreshedTokenMessage).toEqual("Access token has been refreshed. Remember to copy the new one in the headers of subsequent calls");
    });

    test("should return false if the authentication is of type group but the accessToken has been refreshed and not valid", () => {
        
        const mockReq = {
            cookies: {
                accessToken: "accessToken", 
                refreshToken: "accessToken"
            }
        }
        const mockRes = {
            flag: jest.fn().mockReturnThis(),
            cause: jest.fn().mockReturnThis(),
            cookie: jest.fn(), 
            locals: { refreshedTokenMessage: "refreshedTokenMessage" }
        }
        const info = { authType: "Group", emails: ["email2", "email3"] };

        jwt.verify.mockImplementationOnce(() => {
            throw {name: "TokenExpiredError"}});
        jwt.verify.mockReturnValueOnce({username: "username", email: "email", role: "User"});
        
        expect(verifyAuth(mockReq, mockRes, info)).toEqual({flag: false, cause: "Not valid token for the request role"});
        
    });

    test("should return false if the authorization is of type which is not supported and the accessToken has been refreshed", async () => {
        const mockReq = {
            cookies: {
                accessToken: "accessToken", 
                refreshToken: "accessToken"
            }
        }
        const mockRes = {
            flag: jest.fn().mockReturnThis(),
            cause: jest.fn().mockReturnThis(),
            cookie: jest.fn(), 
            locals: { refreshedTokenMessage: "refreshedTokenMessage" }
        }
        const info = { authType: "Regular" };

        jwt.verify.mockImplementationOnce(() => {
            throw {name: "TokenExpiredError"}});
        jwt.verify.mockReturnValueOnce({username: "username", email: "email", role: "User"});
        
        expect(verifyAuth(mockReq, mockRes, info)).toEqual({flag: false, cause: "Not valid token for the request role"});
    });

    test("should return false if the accessToken has expired", async () => {
        const mockReq = {
            cookies: {
                accessToken: "accessToken", 
                refreshToken: "accessToken"
            }
        };
        const mockRes = {
            flag: jest.fn().mockReturnThis(),
            cause: jest.fn().mockReturnThis(),
            cookie: jest.fn(), 
            locals: { refreshedTokenMessage: "refreshedTokenMessage" }
        };

        const info = { authType: "User" };

        jwt.verify.mockImplementationOnce(() => {
            throw {name: "TokenExpiredError"}});

        jwt.verify.mockImplementationOnce(() => {
            throw {name: "TokenExpiredError"}});
        
        jwt.verify.mockReturnValueOnce({username: "username", email: "email", role: "User"});
        expect(verifyAuth(mockReq, mockRes, info)).toEqual({flag: false, cause: "Token expired, log-in again"});

    });

    test("should return false if there is an other error if the accessToken has expired", async () => {
        const mockReq = {
            cookies: {
                accessToken: "accessToken", 
                refreshToken: "accessToken"
            }
        };
        const mockRes = {
            flag: jest.fn().mockReturnThis(),
            cause: jest.fn().mockReturnThis(),
            cookie: jest.fn(), 
            locals: { refreshedTokenMessage: "refreshedTokenMessage" }
        };

        const info = { authType: "User" };
        
        jwt.verify.mockImplementationOnce(() => {
            throw {name: "TokenExpiredError"}});

        jwt.verify.mockImplementationOnce(() => {
            throw {name: "OtherError"}});
        
        jwt.verify.mockReturnValueOnce({username: "username", email: "email", role: "User"});
        expect(verifyAuth(mockReq, mockRes, info)).toEqual({flag: false, cause: "OtherError"});

    });

    test("should return false if there is Other Error", async () => {
        const mockReq = {
            cookies: {
                accessToken: "accessToken", 
                refreshToken: "accessToken"
            }
        };
        const mockRes = {
            flag: jest.fn().mockReturnThis(),
            cause: jest.fn().mockReturnThis(),
            cookie: jest.fn(), 
            locals: { refreshedTokenMessage: "refreshedTokenMessage" }
        };

        const info = { authType: "User" };

        jwt.verify.mockImplementationOnce(() => {
            throw {name: "OtherError"}});
        
        jwt.verify.mockReturnValueOnce({username: "username", email: "email", role: "User"});
        expect(verifyAuth(mockReq, mockRes, info)).toEqual({flag: false, cause: "OtherError"});
    });

})

describe("handleAmountFilterParams", () => { 
    test ('should return a filter if there is only minAmount', () => {
        const mockReq = {
            query: {
                min: 100
            }
        };

        expect(handleAmountFilterParams(mockReq)).toEqual({amount: {$gte: mockReq.query.min}});
    });

    test ('should return a filter if there is only maxAmount', () => {
        const mockReq = {
            query: {
                max: 100
            }
        };

        expect(handleAmountFilterParams(mockReq)).toEqual({amount: {$lte: mockReq.query.max}});
    });

    test ('should return a filter if there is both minAmount and maxAmount', () => {
        const mockReq = {
            query: {
                min: 100,
                max: 200
            }
        };

        expect(handleAmountFilterParams(mockReq)).toEqual({amount: {$gte: mockReq.query.min, $lte: mockReq.query.max}});
    });

    /*test ('should have an exception if there is both minAmount and maxAmount and minAmount is greater than maxAmount', () => {
        const mockReq = {
            query: {
                minAmount: 200,
                maxAmount: 100
            }
        };

        expect(() => handleAmountFilterParams(mockReq)).toThrow("Cannot have minAmount higher than maxAmount");
    });*/

    test ('should have an empty filter if there is not any amount filter', () => {
        const mockReq = {
            query: {}
        };

        expect(handleAmountFilterParams(mockReq)).toEqual({amount: {}});
    });

    test("should has an error if min is not a number", () => {
        const mockReq = {
            query: {
                min: "min"
            }
        };

        expect(() => handleAmountFilterParams(mockReq)).toThrow("A parameter is not a numerical value");
    });

    test("should has an error if max is not a number", () => {
        const mockReq = {
            query: {
                max: "max"
            }
        };

        expect(() => handleAmountFilterParams(mockReq)).toThrow("A parameter is not a numerical value");
    });
})
