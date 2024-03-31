import request from 'supertest';
import { app } from '../app';
import { User, Group } from '../models/User.js';
import { transactions, categories } from '../models/model.js';
import * as utils from '../controllers/utils';
import * as users from '../controllers/users';
import jwt from 'jsonwebtoken'

/**
 * In order to correctly mock the calls to external modules it is necessary to mock them using the following line.
 * Without this operation, it is not possible to replace the actual implementation of the external functions with the one
 * needed for the test cases.
 * `jest.mock()` must be called for every external module that is called in the functions under test.
 */
jest.mock("../models/User.js")
jest.mock("../controllers/utils")

/**
 * Defines code to be executed before each test case is launched
 * In this case the mock implementation of `User.find()` is cleared, allowing the definition of a new mock implementation.
 * Not doing this `mockReset()` means that test cases may use a mock implementation intended for other test cases.
 */
beforeEach(() => {
    jest.restoreAllMocks();
});

describe("getUsers", () => {
  test("Should return empty list if there are no users", async() => {
    const mockReq = {};
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals : {refreshedTokenMessage : "refreshedTokenMessage"}
    };
    const userss = [];
    jest.spyOn(utils, "verifyAuth").mockReturnValue({flag : true});
    jest.spyOn(User, 'find').mockReturnValue({
        select: jest.fn().mockResolvedValueOnce(userss)
      });
    await users.getUsers(mockReq, mockRes);
    expect(utils.verifyAuth).toHaveBeenCalled();
    expect(User.find).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
        data: {users: userss},
        refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
    });
    });

  test("should retrieve list of all users", async () => {
    const mockReq = {};
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals : {refreshedTokenMessage : "refreshedTokenMessage"}
    };
    const usersList = [
      {username: "test1", email: "test1@example.com", role: "User"},
      {username: "test2", email: "test2@example.com", role: "User"}
    ];
    /*
    utils.verifyAuth = jest.fn(() => ({
      authorized : true
    }));
    User.find = jest.fn(() => ({
      select : () => (usersList)
    }));
    utils.verifyAuth = jest.fn(() => ({
        authorized : true
    }));
    const response = await request(app) 
      .get("/api/users");

    expect(response.status).toBe(200);
    expect(response.body).toStrictEqual({data : usersList});
    */
    jest.spyOn(utils, "verifyAuth").mockReturnValue({flag : true});
    jest.spyOn(User, 'find').mockReturnValue({
        select: jest.fn().mockResolvedValueOnce(usersList)
      });
    await users.getUsers(mockReq, mockRes);
    expect(utils.verifyAuth).toHaveBeenCalled();
    expect(User.find).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
        data: {users: usersList},
        refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
    });
    });

  // should we manage a possible DB error?
  /*test.skip("Should return error 400 if response from the db is null", async() => {
    const mockReq = {};
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals : {refreshedTokenMessage : "refreshedTokenMessage"}
    }
    jest.spyOn(utils, "verifyAuth").mockReturnValue({authorized : true});
    jest.spyOn(User, "find").mockReturnValue(null);
    await getUsers(mockReq, mockRes);
    expect(utils.verifyAuth).toHaveBeenCalled();
    expect(User.find).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(400);
  });*/

  test("Should return error 401 if not authorized", async() => {
    const mockReq = {};
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals : {refreshedTokenMessage : "refreshedTokenMessage"}
    };
    jest.spyOn(utils, "verifyAuth").mockReturnValue({flag : false, cause: "cause"});
    await users.getUsers(mockReq, mockRes);
    expect(utils.verifyAuth).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
        error: "cause"
    });
    });
    

  test("Should return error 500 if the search of users went wrong", async() => {
    const mockReq = {};
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals : {refreshedTokenMessage : "refreshedTokenMessage"}
    };
    jest.spyOn(utils, "verifyAuth").mockReturnValue({flag : true});
    jest.spyOn(User, "find").mockImplementation(() => {throw new Error("error")});
    await users.getUsers(mockReq, mockRes);
    expect(utils.verifyAuth).toHaveBeenCalled();
    expect(User.find).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
        error : "error",
        refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
    });
    });
});

describe("getGroups", () => {
    test("Should return empty list if there is no group", async () => {

        Group.find = jest.fn(() => ([]))

        utils.verifyAuth = jest.fn(() => ({
            flag: true
        }));

        const mockReq = {};
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" }
        };

        await users.getGroups(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({
            data: [],
            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
        });
    });


    test("Should return the lists of groups if there is any", async () => {
        const groupsList = [
            {
                name: "group1",
                members: [
                    { email: "email1@email.com"},
                    { email: "email2@email.com"}
                ]
            },
            {
                name: "group2",
                members: [
                    { email: "email3@email.com"},
                    { email: "email4@email.com"}
                ]
            }
        ];

        Group.find = jest.fn(() => (groupsList));

        utils.verifyAuth = jest.fn(() => ({
            flag: true
        }));

        const mockReq = {};
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" }
        };

        await users.getGroups(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({
            data: groupsList,
            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
        });

    });

    test("Should return error 401 if not authorized", async () => {

        utils.verifyAuth = jest.fn(() => ({
            flag: false
        }));

        const mockReq = {};
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" }
        };

        await users.getGroups(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(401);

    });

    test("Should return error 500 if something wrong", async () => {

        utils.verifyAuth = jest.fn(() => {
            throw err("");
        });

        const mockReq = {};
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" }
        };

        await users.getGroups(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(500);

    });
})

describe("getUser", () => {
    test("should return 404 if not params", async () => {
        utils.verifyAuth = jest.fn(() => ({ authorized: false }));

        const mockReq = {
            params: {},
            route: {
                path: "/users/:username"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" },
        };

        await users.getUser(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(404);

    });

    test("should return 401 if not authorized", async () => {
        utils.verifyAuth = jest.fn(() => ({ flag: false }));

        const mockReq = {
            params: { username: "none" },
            route: {
                path: "/users/:username"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" },
        };

        await users.getUser(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(401);

    });

    test("should return 401 if authorized as user for different user", async () => {

        utils.verifyAuth = jest.fn(() => ({flag: true }))
            .mockReturnValueOnce({ flag: false });

        jwt.verify = jest.fn(() => ({
            username: "none"
        }));

        const mockReq = {
            params: { username: "u1" },
            route: {
                path: "/users/:username"
            },
            cookies: {
                accessToken: "",
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" },
        };

        await users.getUser(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(401);
    });

    test("should return 400 if user does not exist", async () => {
        utils.verifyAuth = jest.fn(() => ({ flag: true }));

        User.findOne = jest.fn(() => (null));

        const mockReq = {
            params: { username: "u1" },
            route: {
                path: "/users/:username"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" },
        };

        await users.getUser(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    test("should return 200 if user exists", async () => {
        const requested_user = {
            username: "name1",
            email: "email",
            role: "admin",
        };

        utils.verifyAuth = jest.fn(() => ({ flag: true }));

        User.findOne = jest.fn(() => (requested_user));

        const mockReq = {
            params: { username: "name1" },
            route: {
                path: "/users/:username"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" },
        };

        await users.getUser(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({
            data: requested_user,
            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
        });
    });

    test("should return 500 if error", async () => {
        utils.verifyAuth = jest.fn(() => { throw err("") });

        const mockReq = {
            params: { username: "name1" },
            route: {
                path: "/users/:username"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" },
        };

        await users.getUser(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(500);
    });
});


describe("createGroup", () => {
    test("should return statu 401, Unauthorized", async () => {
        const mockReq = {
            body: {
                name: "g1",
                memberEmails: ["user1@mail.it", "user2@mail.it"]
            }
        }

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        utils.verifyAuth = jest.fn().mockReturnValue({ flag: false, cause: "Unauthorized" });
        await users.createGroup(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({ error: "Unauthorized" })
    });

    test("Should return 400, the caller is already in a group", async () => {
        const mockReq = {
            body: {
                name: "g1",
                memberEmails: ["user1@mail.it", "user2@mail.it"]
            },
            cookies: {
                refreshToken: 'example_refresh_token',
            },
        }

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" }
        }

        utils.verifyAuth = jest.fn().mockReturnValue({ flag: true, cause: "authorized" });
        jest.spyOn(User, 'findOne').mockResolvedValueOnce({ email: "user@example.com" });
        jest.spyOn(Group, 'findOne').mockResolvedValueOnce({ "name": "g1", "members": ["email1", "email2"] });

        await users.createGroup(mockReq, mockRes);
        expect(User.findOne.mock.calls).toHaveLength(1);
        expect(Group.findOne.mock.calls).toHaveLength(1);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "You are already in a group",
            refreshedTokenMessage: "token"
        });
        expect(mockRes.status).toHaveBeenCalledWith(400);
    })

    test("should return 400, Input not valid", async () => {
        const mockReq = {
            body: {
                memberEmails: ["user1@mail.it", "user2@mail.it"]
            },
            cookies: {
                refreshToken: 'example_refresh_token',
            },
        }

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" }
        }
        utils.verifyAuth = jest.fn().mockReturnValue({ flag: true, cause: "authorized" });
        jest.spyOn(User, 'findOne').mockResolvedValueOnce({ email: "user@example.com" });
        jest.spyOn(Group, 'findOne').mockResolvedValueOnce(undefined);

        await users.createGroup(mockReq, mockRes);

        expect(User.findOne.mock.calls).toHaveLength(1);
        expect(Group.findOne.mock.calls).toHaveLength(1);
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "Input not valid",
            refreshedTokenMessage: "token"
        });
    })

    test("Should return 400, group already exist", async () => {
        const mockReq = {
            body: {
                name: "g1",
                memberEmails: ["user1@mail.it", "user2@mail.it"]
            },
            cookies: {
                refreshToken: 'example_refresh_token',
            },
        }

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" }
        }

        utils.verifyAuth = jest.fn().mockReturnValue({ flag: true, cause: "authorized" });
        jest.spyOn(User, 'findOne').mockResolvedValueOnce({ email: "user@example.com" });
        jest.spyOn(Group, 'findOne').mockResolvedValueOnce(undefined).mockResolvedValueOnce({ name: "g1" });

        await users.createGroup(mockReq, mockRes);

        expect(User.findOne.mock.calls).toHaveLength(1);
        expect(Group.findOne.mock.calls).toHaveLength(2);
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "Group with name g1 already exists!",
            refreshedTokenMessage: "token"
        });
    })

    test("Should return 400, Format of email is not valid", async () => {
        const mockReq = {
            body: {
                name: "g1",
                memberEmails: ["bad_mail", "user2@mail.it"]
            },
            cookies: {
                refreshToken: 'example_refresh_token',
            },
        }

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" }
        }

        utils.verifyAuth = jest.fn().mockReturnValue({ flag: true, cause: "authorized" });
        jest.spyOn(User, 'findOne').mockResolvedValueOnce({ email: "user@example.com" });
        jest.spyOn(Group, 'findOne').mockResolvedValue(undefined);

        await users.createGroup(mockReq, mockRes);

        expect(User.findOne.mock.calls).toHaveLength(1);
        expect(Group.findOne.mock.calls).toHaveLength(2);
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "Format of email is not valid",
            refreshedTokenMessage: "token"
        });
    })

    test("Should return 400, Members of the group are not valid", async () => {
        const mockReq = {
            body: {
                name: "g1",
                memberEmails: ["user1@example.com", "user2@example.com"]
            },
            cookies: {
                refreshToken: 'example_refresh_token',
            },
        }

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" }
        }

        utils.verifyAuth = jest.fn().mockReturnValue({ flag: true, cause: "authorized" });
        jest.spyOn(User, 'findOne').mockResolvedValueOnce({ email: "user@example.com" })
            .mockResolvedValueOnce({ email: "user1@example.com" }).mockResolvedValue(undefined);
        jest.spyOn(Group, 'findOne').mockResolvedValueOnce(undefined).mockResolvedValueOnce(undefined)
            .mockResolvedValue({ name: "example_group" });

        await users.createGroup(mockReq, mockRes);

        expect(User.findOne.mock.calls).toHaveLength(1 + 2 + 1);
        expect(Group.findOne.mock.calls).toHaveLength(2 + 1);
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "Members of the group are not valid",
            refreshedTokenMessage: "token"
        });
    })

    test("Should return 200, caller not included in memberEmails", async () => {
        const mockReq = {
            body: {
                name: "g1",
                memberEmails: ["user1@example.com", "user2@example.com"]
            },
            cookies: {
                refreshToken: 'example_refresh_token',
            },
        }

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" }
        }

        utils.verifyAuth = jest.fn().mockReturnValue({ flag: true, cause: "authorized" });
        jest.spyOn(User, 'findOne').mockResolvedValueOnce({ email: "user@example.com" })
            .mockResolvedValueOnce({ email: "user1@example.com" }).mockResolvedValue(undefined);
        jest.spyOn(Group, 'findOne').mockResolvedValueOnce(undefined).mockResolvedValueOnce(undefined)
            .mockResolvedValue(undefined);

        await users.createGroup(mockReq, mockRes);

        // expect(User.findOne.mock.calls).toHaveLength(1 + 2 + 1);
        // expect(Group.findOne.mock.calls).toHaveLength(2 + 1);
        // expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({
            data: {
                group: { name: "g1", members: [{ email: "user1@example.com" }] },
                alreadyInGroup: [],
                membersNotFound: [{email: "user2@example.com"}, {email: "user@example.com"}]              },
            refreshedTokenMessage: "token"
        });
    })
    
    test("Should return 200, caller included in memberEmails", async () => {
        const mockReq = {
            body: {
                name: "g1",
                memberEmails: ["user1@example.com", "user2@example.com"]
            },
            cookies: {
                refreshToken: 'example_refresh_token',
            },
        }

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" }
        }

        utils.verifyAuth = jest.fn().mockReturnValue({ flag: true, cause: "authorized" });
        jest.spyOn(User, 'findOne')
            .mockResolvedValueOnce({ email: "user1@example.com" })
            .mockResolvedValueOnce({ email: "user1@example.com" })
            .mockResolvedValueOnce({ email: "user2@example.com"})
            .mockResolvedValue(undefined);
        jest.spyOn(Group, 'findOne')
            .mockResolvedValueOnce(undefined)
            .mockResolvedValueOnce(undefined)
            .mockResolvedValueOnce({name : "g2"})
            .mockResolvedValue(undefined);

        await users.createGroup(mockReq, mockRes);

        expect(User.findOne.mock.calls).toHaveLength(1 + 2);
        expect(Group.findOne.mock.calls).toHaveLength(2 + 2);
        
        expect(mockRes.json).toHaveBeenCalledWith({
            data: {
                group: { name: "g1", members: [{ email: "user2@example.com" }] },
                alreadyInGroup: [{email : "user1@example.com"}],
                membersNotFound: []              },
            refreshedTokenMessage: "token"
        });
        expect(mockRes.status).toHaveBeenCalledWith(200);
    })
    test("should return status 500, catch test", async () => {
        const mockReq = {
            body: {
                name: "g1",
                memberEmails: ["user1@mail.it", "user2@mail.it"]
            },
            cookies: {
                refreshToken: 'example_refresh_token',
            },
        }

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" }
        }

        utils.verifyAuth = jest.fn(() => { throw err("") });
        await users.createGroup(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(500);
    });
})

describe("getGroup", () => {
    
    test("Should return 404 if param not valid", async () => {

        Group.findOne = jest.fn(() => (null));

        const mockReq = {
            params: {}
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" },
        };

        await users.getGroup(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(404);

    });


    test("Should return 400 if the group does not exist", async () => {

        Group.findOne = jest.fn(() => (null));

        const mockReq = {
            params: { name: "g1" }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" },
        };

        await users.getGroup(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "Group doesn't exist",
        });

    });

    test("Should return 401 if not authorized", async () => {
        const group_data = { "name": "g1", "members": ["email1", "email2"] };
        Group.findOne = jest.fn(() => (group_data));

        utils.verifyAuth = jest.fn(() => ({
            authorized: false
        }));

        const mockReq = {
            params: { name: "g1" }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" },
        };

        await users.getGroup(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(401);
    });

    test("Should return 200 if group exists and authorized", async () => {
        const group_data = { "name": "g1", "members": [{email:"email1"}, {email: "email2"}] };
        Group.findOne = jest.fn(() => (group_data));

        utils.verifyAuth = jest.fn(() => ({
            flag: true
        }));

        const mockReq = {
            params: { name: "g1" }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" },
        };

        await users.getGroup(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({
            "data": {
                group: {
                    name : group_data.name,
                    members : group_data.members.map(e => ({email : e.email}))
                }
            },
            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
        });

    })

    test("Should return 500 if error occurs", async () => {
        Group.findOne = jest.fn(() => {
            throw err("");
        });

        const mockReq = {
            params: { name: "g1" }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" },
        };

        await users.getGroup(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(500);

    })

});

describe("addToGroup", () => {

    test("Should return 404 if not params.name", async () => {
        Group.findOne = jest.fn(() => ({ "name": "g1", "members": [] }));
        utils.verifyAuth = jest.fn(() => ({ flag: false }));

        const mockReq = {
            params: {},
            body : {
            
            },
            route: {
                path: "/groups/:name/add"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" },
        };

        await users.addToGroup(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(404);
    });
    
    test("Should return 400 if not body.emails", async () => {
        Group.findOne = jest.fn(() => ({ "name": "g1", "members": [] }));
        utils.verifyAuth = jest.fn(() => ({ flag: false }));

        const mockReq = {
            params: { name: "g1" },
            body : {
            
            },
            route: {
                path: "/groups/:name/add"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" },
        };

        await users.addToGroup(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    test("Should return 400 if body.emails has no emails", async () => {
        Group.findOne = jest.fn(() => ({ "name": "g1", "members": [] }));
        utils.verifyAuth = jest.fn(() => ({ flag: false }));

        const mockReq = {
            params: { name: "g1" },
            body : {
                emails : "string"
            },
            route: {
                path: "/groups/:name/add"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" },
        };

        await users.addToGroup(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    test("Should return 400 if body.emails has one invalid email", async () => {
        Group.findOne = jest.fn(() => ({ "name": "g1", "members": [] }));
        utils.verifyAuth = jest.fn(() => ({ flag: false }));

        const mockReq = {
            params: { name: "g1" },
            body : {
                emails : ["gs@aol.com", "string"]
            },
            route: {
                path: "/groups/:name/add"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" },
        };

        await users.addToGroup(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    test("Should return 401 if not authorized as admin", async () => {
        Group.findOne = jest.fn(() => ({ "name": "g1", "members": [] }));
        utils.verifyAuth = jest.fn(() => ({ flag: false }));


        const mockReq = {
            params: { name: "g1" },
            body : {
                emails : []
            },
            route: {
                path: "/groups/:name/insert"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" },
        };

        await users.addToGroup(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(401);
    });

    test("Should return 401 if user not in group", async () => {
        Group.findOne = jest.fn(() => ({ "name": "g1", "members": [{email :"gs@aol.com"}] }));
        utils.verifyAuth = jest.fn((req, res, emails) => ({flag: false, emails : emails}));


        const mockReq = {
            params: { name: "g1" },
            body : {
                emails : []
            },
            route: {
                path: "/groups/:name/add"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" },
        };

        await users.addToGroup(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(401);
    });

    test("Should return 400 if group does not exist", async () => {
        Group.findOne = jest.fn(() => (null));
        utils.verifyAuth = jest.fn(() => ({ flag: true }));

        const mockReq = {
            params: { name: "g1" },
            body : {
                emails : []
            },
            route: {
                path: "/groups/:name/add"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" },
        };

        await users.addToGroup(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);

    });

    test("Should return 400 if all the members are already in a group", async () => {
        const membersNotFound = ["m1@aol.com", "m2@aol.com", "m3@aol.com"];

        Group.findOne = jest.fn(() => ({ "name": "g2", "members": [] }))

        utils.verifyAuth = jest.fn(() => ({ authorized: true }));

        User.findOne = jest.fn(() => null);

        const mockReq = {
            params: { name: "g1"},
            body: {
                emails: membersNotFound
            },
            route: {
                path: "/group/:name/add"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" },
        };

        await users.addToGroup(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "no new member available",
            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
        });

    });

    test("Should return 200 if we can add at least once", async () => {

        User.findOne = jest.fn(() => null)
            .mockReturnValueOnce({
                "name": "giacomo",
                "_id": "123",
                "email": "email1@email.com"
            })
            .mockReturnValueOnce({
                "name": "giovanni",
                "_id": "456",
                "email": "email2@email.com"
            });

        Group.findOne = jest.fn(() => null)
            .mockReturnValueOnce({
                "name": "g1",
                "members": [],
                save: () => null
            })
            .mockReturnValueOnce({
                "name": "g2",
                "members": []
            });

        jest.spyOn(utils, "verifyAuth")
            .mockReturnValue({ flag: true, cause: "" });

        const mockReq = {
            params: { name: "g1" },
            body: {
                emails: ["email1@email.com", "email2@email.com", "email3@email.com"]
            },
            route: {
                path: "/groups/:name/add"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" },
        };

        await users.addToGroup(mockReq, mockRes);

        expect(mockRes.json).toHaveBeenCalledWith({
            data: {
                group: { "name": "g1", "members": [{ email: "email2@email.com"}] },
                alreadyInGroup: [{email : "email1@email.com"}],
                membersNotFound: [{email : "email3@email.com"}]
            },
            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
        });
        expect(mockRes.status).toHaveBeenCalledWith(200);

    });

    test("Should return 500 if error", async () => {
        Group.findOne = jest.fn(() => { throw err("") });

        const mockReq = {
            params: { name: "g1" },
            route: {
                path: "/groups/:name/add"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" },
        };

        await users.addToGroup(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(500);
    });

});

describe("removeFromGroup", () => {

    test("Should return 404 not valid req.params.name", async () => {
        const group_data = { "name": "g1", "members": ["email2"] };

        Group.findOne = jest.fn(() => (group_data));

        const mockReq = {
            params: {},
            route: { path: "/groups/:name/remove" }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" },
        };

        await users.removeFromGroup(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    test("Should return 400 if not valid body.emails", async () => {
        const group_data = { "name": "g1", "members": ["email2"] };

        Group.findOne = jest.fn(() => (group_data));

        const mockReq = {
            params: { name: "g1" },
            body : {},
            route: { path: "/groups/:name/remove" }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" },
        };

        await users.removeFromGroup(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    test("Should return 400 if body.emails not an array", async () => {
        const group_data = { "name": "g1", "members": ["email2"] };

        Group.findOne = jest.fn(() => (group_data));

        const mockReq = {
            params: { name: "g1" },
            body : { emails : "string"},
            route: { path: "/groups/:name/remove" }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" },
        };

        await users.removeFromGroup(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    test("Should return 400 if at least one email is not valid", async () => {
        const group_data = { "name": "g1", "members": ["email2"] };

        Group.findOne = jest.fn(() => (group_data));

        const mockReq = {
            params: { name: "g1" },
            body : {
                emails : ["string"]
            },
            route: { path: "/groups/:name/remove" }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" },
        };

        await users.removeFromGroup(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    test("should return 400 if the group does not exist", async () => {
        Group.findOne = jest.fn(() => (null));

        const mockReq = {
            params: { name: "g1" },
            body : {
                emails : []
            },
            route: { path: "groups/:name/remove" }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" },
        };

        await users.removeFromGroup(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "Group doesn't exist"
        });

    });

    test("should return 400 if there is only one member in the group", async () => {
        Group.findOne = jest.fn(() => ({members : ["gs@aol.com"]}));

        const mockReq = {
            params: { name: "g1" },
            body : {
                emails : []
            },
            route: { path: "groups/:name/remove" }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" },
        };

        await users.removeFromGroup(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "There's only one member in the group: ERROR"
        });

    });

    test("Should return 401 if not authorized in group", async () => {
        const group_data = { "name": "g1", "members": [{email : "email1"}, {email : "email2"}] };

        Group.findOne = jest.fn(() => (group_data));

        utils.verifyAuth = jest.fn((req, res, emails) => ({
            flag: false, emails : emails
        }));

        const mockReq = {
            params: { name: "g1" },
            body : {emails : []},
            route: { path: "/groups/:name/remove" }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" },
        };

        await users.removeFromGroup(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(401);
    });

    test("Should return 401 if not authorized ad admin", async () => {
        const group_data = { "name": "g1", "members": [{email : "email1"}, {email : "email2"}] };

        Group.findOne = jest.fn(() => (group_data));

        utils.verifyAuth = jest.fn((req, res, emails) => ({
            flag: false, emails : emails
        }));

        const mockReq = {
            params: { name: "g1" },
            body : {emails : []},
            route: { path: "/groups/:name/pull" }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" },
        };

        await users.removeFromGroup(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(401);
    });

    test("Should return 500 if error", async () => {
        Group.findOne = jest.fn(() => { throw err("") });

        const mockReq = {
            params: { name: "g1" },
            route: { path: "/groups/:name/remove" }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" },
        };

        await users.removeFromGroup(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(500);
    });

    test("Should return 400 if all the memberEmails either do not exist or not in group", async () => {
        const group_data = { "name": "g1", "members": ["email1@aol.com", "email2@aol.com"] };

        Group.findOne = jest.fn(() => (group_data));

        utils.verifyAuth = jest.fn(() => ({
            flag: true
        }));

        User.findOne = jest.fn(() => (null))
            .mockReturnValueOnce({ "name": "user" })

        const mockReq = {
            params: { name: "g1" },
            route: { path: "/groups/:name/remove" },
            body: {
                emails: ["email1@aol.com", "email2@aol.come"]
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" },
        };

        await users.removeFromGroup(mockReq, mockRes);

        expect(mockRes.json).toHaveBeenCalledWith({
            error: "emails are not valid",
            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
        });
        expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    test("Should return 200 if it was possible to remove some members", async () => {
        const group_data = {
            "name": "g1", "members": [
                { email: "email1@aol.com" },
                { email: "email3@aol.com" }],
            save: () => (null),
        };
        const user_data = [
            { "email": "email3@aol.com", "_id": "3" },
            { "email": "email1@aol.com", "_id": "1" },
        ];
        const data_to_send = ["email3@aol.com", "email4@aol.com"];

        Group.findOne = jest.fn(() => (null))
            .mockReturnValueOnce(group_data);

        utils.verifyAuth = jest.fn(() => ({
            flag: true
        }));

        User.findOne = jest.fn(() => (null))
            .mockReturnValueOnce(user_data[0]);

        const mockReq = {
            params: { name: "g1" },
            route: { path: "/groups/:name/remove" },
            body: {
                emails: data_to_send
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" },
        };

        await users.removeFromGroup(mockReq, mockRes);

        expect(mockRes.json).toHaveBeenCalledWith({
            data: {
                group: {
                    name: "g1",
                    members: [{ email: "email1@aol.com" }]
                },
                membersNotFound: [{email : "email4@aol.com"}],
                notInGroup: []
            },
            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
        });
        expect(mockRes.status).toHaveBeenCalledWith(200);

    });

    test("Should return 200 if it was possible to remove all the members except the first one", async () => {
        const group_data = {
            "name": "g1", "members": [
                { email: "email1@aol.com" },
                { email: "email3@aol.com" }],
            save: () => (null),
        };
        const user_data = [
            { "email": "email3@aol.com", "_id": "3" },
            { "email": "email1@aol.com", "_id": "1" },
        ];
        const data_to_send = ["email3@aol.com", "email1@aol.com"];

        Group.findOne = jest.fn(() => (null))
            .mockReturnValueOnce(group_data);

        utils.verifyAuth = jest.fn(() => ({
            flag: true
        }));

        User.findOne = jest.fn(() => (null))
            .mockReturnValueOnce(user_data[0])
            .mockReturnValueOnce(user_data[1]);

        const mockReq = {
            params: { name: "g1" },
            route: { path: "/groups/:name/remove" },
            body: {
                emails: data_to_send
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" },
        };

        await users.removeFromGroup(mockReq, mockRes);

        expect(mockRes.json).toHaveBeenCalledWith({
            data: {
                group: {
                    name: "g1",
                    members: [{ email: "email1@aol.com" }]
                },
                membersNotFound: [],
                notInGroup: []
            },
            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
        });
        expect(mockRes.status).toHaveBeenCalledWith(200);

    });

})

describe("deleteUser", () => {
    test("should delete the user and return a success response", async () => {
        const mockReq = {
            body: {
                email: "email1@gmail.com"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "refreshedTokenMessage" }
        };
        jest.spyOn(utils, 'verifyAuth').mockReturnValue({ flag: true });
        jest.spyOn(User, "findOne").mockReturnValueOnce({ "email": "email1@gmail.com" });
        jest.spyOn(transactions, "countDocuments").mockReturnValue(1);
        jest.spyOn(transactions, "deleteMany").mockReturnValue();
        jest.spyOn(Group, "findOne").mockReturnValueOnce({ "name": "g1", "members": ["email1@gmail.com", "email2@gmail.com"], save: jest.fn()});
        jest.spyOn(User.prototype, "save").mockImplementation(() => {});
        jest.spyOn(User, "deleteOne").mockReturnValueOnce();
        await users.deleteUser(mockReq, mockRes);
        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(User.findOne).toHaveBeenCalled();
        expect(transactions.countDocuments).toHaveBeenCalled();
        expect(transactions.deleteMany).toHaveBeenCalled();
        expect(Group.findOne).toHaveBeenCalled();
        expect(Group.deleteOne).toHaveBeenCalled();
        expect(User.deleteOne).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({
            data: {
                deletedFromGroup: true,
                deletedTransactions: 1
            },
            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
        });
    });

    test("should return 401 if user is not authorized", async () => {
        const mockReq = {
            body: {
                email: "email1@gmail.com"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "refreshedTokenMessage" }
        };
        jest.spyOn(utils, 'verifyAuth').mockReturnValue({ flag: false, cause: "error" });
        await users.deleteUser(mockReq, mockRes);
        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "error",
        });
    });

    test("should return 400 if user does not exist", async () => {
        const mockReq = {
            body: {
                email: "email1@gmail.com",
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "refreshedTokenMessage" }
        };
        jest.spyOn(utils, 'verifyAuth').mockReturnValue({ flag: true });
        jest.spyOn(User, "findOne").mockReturnValue(null);
        await users.deleteUser(mockReq, mockRes);
        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(User.findOne).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "User not found or doesn't exist",
            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
        });
    });

    test("shoul return 400 if request does not contain email", async () => {
        const mockReq = {
            body: {}
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "refreshedTokenMessage" }
        };
        jest.spyOn(utils, 'verifyAuth').mockReturnValue({ flag: true });
        await users.deleteUser(mockReq, mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "Request does not contain the email",
            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
        });
    });

    test("should return 400 if the email is empty", async () => {
        const mockReq = {
            body: {
                email: ""
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "refreshedTokenMessage" }
        };
        jest.spyOn(utils, 'verifyAuth').mockReturnValue({ flag: true });
        await users.deleteUser(mockReq, mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "The email field is empty",
            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
        });
    });

    test("should return 400 if the email is not valid", async () => {
        const mockReq = {
            body: {
                email: "email1"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "refreshedTokenMessage" }
        };
        jest.spyOn(utils, 'verifyAuth').mockReturnValue({ flag: true });
        await users.deleteUser(mockReq, mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "Email format is not correct",
            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
        });
    });

    test("should return 500 if there is an error while deleting the user", async () => {
        const mockReq = {
            body: {
                email: "email1@gmail.com",
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "refreshedTokenMessage" }
        };
        jest.spyOn(utils, 'verifyAuth').mockReturnValue({ flag: true });
        jest.spyOn(User, "findOne").mockReturnValue({ "email": "email1" });
        jest.spyOn(transactions, "countDocuments").mockRejectedValue(new Error("error"));
        await users.deleteUser(mockReq, mockRes);
        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(User.findOne).toHaveBeenCalled();
        expect(transactions.countDocuments).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "error",
            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
        });
    });

    test("should return 200 if successful and the user is the last member of the group", async () => {
        const mockReq = {
            body: {
                email: "email1@gmail.com"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "refreshedTokenMessage" }
        };

        jest.spyOn(utils, 'verifyAuth').mockReturnValue({ flag: true });
        jest.spyOn(User, "findOne").mockReturnValueOnce({ "email": "email1@gmail.com" });
        jest.spyOn(transactions, "countDocuments").mockReturnValue(0);
        jest.spyOn(Group, "findOne").mockReturnValueOnce({"name" : "group", "members": ["email1@gmail.com"]});
        jest.spyOn(User, "findOne").mockReturnValueOnce(); 
        jest.spyOn(User, "deleteOne").mockReturnValue();
        await users.deleteUser(mockReq, mockRes);
        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(User.findOne).toHaveBeenCalled();
        expect(transactions.countDocuments).toHaveBeenCalled();
        expect(Group.findOne).toHaveBeenCalled();
        expect(Group.deleteOne).toHaveBeenCalled();
        expect(User.deleteOne).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({
            data: {
                deletedFromGroup: true,
                deletedTransactions: 0
            },
            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
        });
    });

    test("should return 400 if you try to delete an admin", async () => {
        const mockReq = {
            body: {
                email: "email1@gmail.com",
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "refreshedTokenMessage" }
        };

        jest.spyOn(utils, 'verifyAuth').mockReturnValue({ flag: true });
        jest.spyOn(User, "findOne").mockReturnValueOnce({ "email": "email1@gmail.com", "username":"user1", "role":"Admin" });
        await users.deleteUser(mockReq, mockRes);
        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(User.findOne).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "Cannot delete an Admin",
            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
        });
    });

    test("should return 200 if the user is deleted and he does not belong to any group", async () => {
        const mockReq = {
            body: {
                email: "email1@gmail.com",
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "refreshedTokenMessage" }
        };

        jest.spyOn(utils, 'verifyAuth').mockReturnValue({ flag: true });
        jest.spyOn(User, "findOne").mockReturnValueOnce({ "email": "email1@gmail.com" });
        jest.spyOn(transactions, "countDocuments").mockReturnValue(0);
        jest.spyOn(Group, "findOne").mockReturnValueOnce(null);
        jest.spyOn(User, "deleteOne").mockReturnValue();
        await users.deleteUser(mockReq, mockRes);
        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(User.findOne).toHaveBeenCalled();
        expect(transactions.countDocuments).toHaveBeenCalled();
        expect(Group.findOne).toHaveBeenCalled();
        expect(Group.deleteOne).toHaveBeenCalled();
        expect(User.deleteOne).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({
            data: {
                deletedFromGroup: false,
                deletedTransactions: 0
            },
            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
        });
    });
})

describe("deleteGroup", () => {
    test("should delete the group and return a success response", async () => {
        const mockReq = {
            body: {
                name: "g1"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "refreshedTokenMessage" }
        };
        jest.spyOn(Group, "findOne").mockReturnValue({ "name": "g1", "members": ["email1", "email2"] });
        jest.spyOn(utils, "verifyAuth").mockReturnValue({ flag: true });
        jest.spyOn(Group, "deleteOne").mockReturnValue();
        await users.deleteGroup(mockReq, mockRes);
        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(Group.findOne).toHaveBeenCalled();
        expect(Group.deleteOne).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({
            data: { message: "Group has been deleted" },
            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
        });
    });

    test("should return an error response if authentication fails", async () => {
        const mockReq = {
            body: {
                name: "g1"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "refreshedTokenMessage" }
        };
        jest.spyOn(utils, "verifyAuth").mockReturnValue({ flag: false, cause: "cause" });
        await users.deleteGroup(mockReq, mockRes);
        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "cause"
        });
    });

    test("should return an error response if the group does not exist", async () => {
        const mockReq = {
            body: {
                name: "g1"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "refreshedTokenMessage" }
        };
        jest.spyOn(utils, "verifyAuth").mockReturnValue({ flag: true });
        jest.spyOn(Group, "findOne").mockReturnValue(null);
        await users.deleteGroup(mockReq, mockRes);
        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(Group.findOne).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "Group does not exist",
            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
        });
    });

    test("should return an error response if there is an error while deleting the group", async () => {
        const mockReq = {
            body: {
                name: "g1"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "refreshedTokenMessage" }
        };
        jest.spyOn(utils, "verifyAuth").mockReturnValue({ flag: true });
        jest.spyOn(Group, "findOne").mockReturnValue({ "name": "g1", "members": ["email1", "email2"] });
        jest.spyOn(Group, "deleteOne").mockRejectedValue(new Error("error"));
        await users.deleteGroup(mockReq, mockRes);
        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(Group.findOne).toHaveBeenCalled();
        expect(Group.deleteOne).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "error",
            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
        });
    });

    test("should return an error response if the name is not valid", async () => {
        const mockReq = {
            body: {
                name: ""
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "refreshedTokenMessage" }
        };
        jest.spyOn(utils, "verifyAuth").mockReturnValue({ flag: true });
        await users.deleteGroup(mockReq, mockRes);
        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "name not valid or missing",
            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
        });
    });

    test("should return an error response if the name is not provided", async () => {
        const mockReq = {
            body: {
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "refreshedTokenMessage" }
        };
        jest.spyOn(utils, "verifyAuth").mockReturnValue({ flag: true });
        await users.deleteGroup(mockReq, mockRes);
        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "name not valid or missing",
            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
        });
    });
})