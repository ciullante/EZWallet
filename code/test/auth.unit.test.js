import { User } from '../models/User.js';
import * as auth from '../controllers/auth'
import * as utils from '../controllers/utils'
import jwt from 'jsonwebtoken';
const bcrypt = require("bcryptjs")

jest.mock("bcryptjs")
jest.mock('../models/User.js');
jest.mock('jsonwebtoken');

beforeEach(() => {
    jest.restoreAllMocks();
});

describe('register', () => { 
    test('should return 200 if registration has succeeded', async () => {
        const mockReq = {body: {
            username: "test1",
            email: "test1@email.com",
            password: "test1password"
        }};
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals : {refreshedTokenMessage : "refreshedTokenMessage"}
        };
        //jest.mock(email, "match").mockReturnValue(true);
        jest.spyOn(User, "findOne").mockReturnValue(null);
        jest.spyOn(User, "findOne").mockReturnValue(null);
        await auth.register(mockReq, mockRes);
        //expect(email.match).toBeCalled();
        expect(User.findOne).toBeCalledTimes(2);
        expect(mockRes.status).toHaveBeenCalledWith(200);
        /*expect(mockRes.json).toHaveBeenCalledWith({
            data: {message: "User added succesfully"},
            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
        });*/
    });

    test('should return error 400 if the email has an incorrect format', async () => {
        const mockReq = {body: {
            username: "test1",
            email: "test1@email.com%&$!=ì#",
            password: "test1password"
        }};
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals : {refreshedTokenMessage : "refreshedTokenMessage"}
        };
        //jest.mock(email, "match").mockReturnValue(false);
        await auth.register(mockReq, mockRes);
        //expect(email.match).toBeCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        /*expect(mockRes.json).toHaveBeenCalledWith({
            error: "email format is not correct",
            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
        });*/
    });

    test('should return error 400 if the user is already registered', async () => {
        const mockReq = {body: {
            username: "test1",
            email: "test1@email.com",
            password: "test1password"
        }};
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals : {refreshedTokenMessage : "refreshedTokenMessage"}
        };
        //jest.mock(email, "match").mockReturnValue(true);
        jest.spyOn(User, "findOne").mockReturnValue(true);
        await auth.register(mockReq, mockRes);
        //expect(email.match).toBeCalled();
        expect(User.findOne).toBeCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        /*expect(mockRes.json).toHaveBeenCalledWith({
            error : "you are already registered",
            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
        });*/
    });

    test('should return error 500 if error', async () => {
        const mockReq = {body: {
            username: "test1",
            email: "test1@email.com",
            password: "test1password"
        }};
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals : {refreshedTokenMessage : "refreshedTokenMessage"}
        };
        //jest.mock(email, "match").mockReturnValue(true);
        jest.spyOn(User, "findOne").mockImplementation(() => {throw err("")});
        await auth.register(mockReq, mockRes);
        //expect(email.match).toBeCalled();
        expect(User.findOne).toBeCalled();
        expect(mockRes.status).toHaveBeenCalledWith(500);
        /*expect(mockRes.json).toHaveBeenCalledWith({
            error : "error"
        });*/
    });

    test('should return error 400 if is missing an attribute or a parameter is an empty string', async () => {
        const mockReq = {body: {
            username: "",
            email: "test1@email.com",
        }};
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals : {refreshedTokenMessage : "refreshedTokenMessage"}
        };
        await auth.register(mockReq, mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(400);
        /*expect(mockRes.json).toHaveBeenCalledWith({
            error: "parameters are not valid",
            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
        });*/
    });

});

describe("registerAdmin", () => { 
    test('TEST 1: should return 400, Body error, missing username', async () => {
        const mockReq = {
            body: {
                email: "mail@example.com",
                password: "secure"
            }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" }
        }

        await auth.registerAdmin(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ error: "Body error" })
    });
    test('TEST 2: should return 400, Body error, missing email', async () => {
        const mockReq = {
            body: {
                username: "user",
                password: "secure"
            }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" }
        }

        await auth.registerAdmin(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ error: "Body error" })
    });
    test('TEST 3: should return 400, Body error, missing password', async () => {
        const mockReq = {
            body: {
                username: "user",
                email: "mail@example.com"
            }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" }
        }

        await auth.registerAdmin(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ error: "Body error" })
    });
    test('TEST 4: should return 400, email format error', async () => {
        const mockReq = {
            body: {
                username: "user",
                email: "bad_email",
                password: "secure"
            }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" }
        }

        await auth.registerAdmin(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ error: "Format of email is not valid" })
    });
    test('TEST 5: should return 400, You are already registered (username) ', async () => {
        const mockReq = {
            body: {
                username: "user",
                email: "mail@example.com",
                password: "secure"
            }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" }
        }

        jest.spyOn(User, "findOne").mockReturnValueOnce({username: "user"}).mockReturnValueOnce(undefined);
        
        await auth.registerAdmin(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ error: "You are already registered" })
    });
    test('TEST 6: should return 400, You are already registered (email) ', async () => {
        const mockReq = {
            body: {
                username: "user",
                email: "mail@example.com",
                password: "secure"
            }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" }
        }

        jest.spyOn(User, "findOne").mockReturnValueOnce(undefined).mockReturnValueOnce({email: "mail@example.com"});
        
        await auth.registerAdmin(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ error: "You are already registered" })
    });

    test('TEST 7: should return 200, User registered successfully ', async () => {
        const mockReq = {
            body: {
                username: "user",
                email: "mail@example.com",
                password: "secure"
            }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" }
        }

        jest.spyOn(User, "findOne").mockReturnValueOnce(undefined).mockReturnValueOnce(undefined);
        jest.spyOn(User, "create");
        bcrypt.hash = jest.fn().mockReturnValue("hashed_password");
        await auth.registerAdmin(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({ data: { message: "User registered successfully" } })
    });
    test('TEST 8: should return 500, catch test ', async () => {
        const mockReq = {
            body: {
                username: "user",
                email: "mail@example.com",
                password: "secure"
            }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" }
        }

        jest.spyOn(User, "findOne").mockImplementation(() => {throw err("")})
 
        await auth.registerAdmin(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(500);
    });
    
})

describe('login', () => { 

    test("should return 400 if user does not exist", async () => {

        User.findOne = jest.fn(() => (null));

        const mockReq = {
            body : {
                email : "email@aol.com", password : "password"
            },
        };
        const mockRes = {
            status : jest.fn().mockReturnThis(),
            json : jest.fn(),
            locals : {refreshedTokenMessage : "token"},
        };

        await auth.login(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            error : "user not found, please register"
        });

    });

    test("should return 401 if user already logged", async () => {
        const user_found = {
            email : "email@aol.com",
            _id : "1",
            username : "name",
            role : "role"
        }

        User.findOne = jest.fn(() => (user_found));
        utils.verifyAuth = jest.fn(() => ({flag : true}));

        const mockReq = {
            body : {
                email : "email@aol.com", password : "password"
            },
        };
        const mockRes = {
            status : jest.fn().mockReturnThis(),
            json : jest.fn(),
            locals : {refreshedTokenMessage : "token"},
        };

        await auth.login(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(401);

    });

    test("should return 400 if body empty", async () => {

        const user_found = {
            email : "email@aol.com",
            _id : "1",
            username : "name",
            role : "role"
        }

        User.findOne = jest.fn(() => (user_found));
        utils.verifyAuth = jest.fn(() => ({flag : false}));
        bcrypt.compare = jest.fn(() => (false))

        const mockReq = {
            body : {},
        };
        const mockRes = {
            status : jest.fn().mockReturnThis(),
            json : jest.fn(),
            locals : {refreshedTokenMessage : "token"},
        };

        await auth.login(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            error : "Body error"
        });
    });
    
    test("should return 400 email is not valid", async () => {

        const user_found = {
            email : "email@aol.com",
            _id : "1",
            username : "name",
            role : "role"
        }

        User.findOne = jest.fn(() => (user_found));
        utils.verifyAuth = jest.fn(() => ({flag : false}));
        bcrypt.compare = jest.fn(() => (false))

        const mockReq = {
            body : {
                email : "email", password : "password"
            },
        };
        const mockRes = {
            status : jest.fn().mockReturnThis(),
            json : jest.fn(),
            locals : {refreshedTokenMessage : "token"},
        };

        await auth.login(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            error : "Not a valid formatted email"
        });
    });

    test("should return 400 if password is not correct", async () => {

        const user_found = {
            email : "email@aol.com",
            _id : "1",
            username : "name",
            role : "role"
        }

        User.findOne = jest.fn(() => (user_found));
        utils.verifyAuth = jest.fn(() => ({flag : false}));
        bcrypt.compare = jest.fn(() => (false))

        const mockReq = {
            body : {
                email : "email@aol.com", password : "password"
            },
        };
        const mockRes = {
            status : jest.fn().mockReturnThis(),
            json : jest.fn(),
            locals : {refreshedTokenMessage : "token"},
        };

        await auth.login(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            error : "wrong credentials"
        });
    });

    test("should return 500 if error", async () => {

        User.findOne = jest.fn(() => {
            throw err("");
        });

        const mockReq = {
            body : {
                email : "email@aol.com", password : "password"
            },
        };
        const mockRes = {
            status : jest.fn().mockReturnThis(),
            json : jest.fn(),
            locals : {refreshedTokenMessage : "token"},
        };

        await auth.login(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(500);
    });

    test("should return 200 if login is correct", async () => {

        const user_found = {
            email : "email@aol.com",
            _id : "1",
            username : "name",
            role : "role",
            save : async () => (null)
        }

        User.findOne = jest.fn(() => (user_found));
        utils.verifyAuth = jest.fn(() => ({flag : false}));
        bcrypt.compare = jest.fn(() => (true))
        jwt.sign = jest.fn(() => ("token"))

        const mockReq = {
            body : {
                email : "email@aol.com", password : "password"
            },
        };
        const mockRes = {
            status : jest.fn().mockReturnThis(),
            json : jest.fn(),
            locals : {refreshedTokenMessage : "token"},
            cookie : () => (null)
        };

        await auth.login(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({
            data : {
                refreshToken : "token",
                accessToken : "token"
            }
        });

    });

});

describe('logout', () => { 
    
    test('should return 200', async () => {
        const mockReq = {
            cookies: {
                accessToken: "accessToken",
                refreshToken : "refreshToken"
            }
        };
        const mockRes = {
            status : jest.fn().mockReturnThis(),
            json : jest.fn(),
            locals : {refreshedTokenMessage : "refreshedTokenMessage"},
            cookie: jest.fn()
        };
        jest.spyOn(User, "findOne").mockReturnValue({username: "username", save: jest.fn()});
        jest.spyOn(User.prototype, "save").mockImplementation(() => {});
        await auth.logout(mockReq, mockRes);
        expect(User.findOne).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({
            data: {message: 'User logged out'}
        });

    });

    test("should return 500 if error", async () => {
        const mockReq = {
            cookies: {
                accessToken: "accessToken",
                refreshToken: "refreshToken"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: "refreshedTokenMessage"},
            cookie: jest.fn()
        };

        jest.spyOn(User, "findOne").mockRejectedValue(new Error("error"));
        await auth.logout(mockReq, mockRes);
        expect(User.findOne).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "error",
            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
        });
    });

    test("should return 400 if user not found", async () => {
        const mockReq = {
            cookies: {
                accessToken: "accessToken",
                refreshToken: "refreshToken"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: "refreshedTokenMessage"},
        };
        jest.spyOn(User, "findOne").mockReturnValue(null);
        await auth.logout(mockReq, mockRes);
        expect(User.findOne).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "User does not exist",
            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
        });
    });

    test("should return 400 if refresh token does not exist", async () => {
        const mockReq = {
            cookies: {
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {refreshedTokenMessage: "refreshedTokenMessage"},
        };
        await auth.logout(mockReq, mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "RefreshToken does not exist",
            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
        });
    });

});
