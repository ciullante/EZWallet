import request from 'supertest';
import { app } from '../app';
import * as controller from '../controllers/controller'
import { categories, transactions } from '../models/model';
import * as utils from '../controllers/utils';
import { User, Group } from '../models/User';

jest.mock('../models/model');

beforeEach(() => {
    jest.restoreAllMocks();
});

describe("createCategory", () => {

    test('Should create a new Category and return 200', async () => {
        const mockReq = {
            body: {
                type: "investment",
                color: "ffff"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "refreshedTokenMessage" }
        };
        jest.spyOn(utils, "verifyAuth").mockReturnValue({ flag: true });
        jest.spyOn(categories, "findOne").mockReturnValue(null);
        jest.spyOn(categories.prototype, 'save').mockResolvedValueOnce({
            type: "investment",
            color: "ffff"
        });
        await controller.createCategory(mockReq, mockRes);
        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(categories.findOne).toHaveBeenCalled();
        expect(categories.prototype.save).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({
            data: { type: "investment", color: "ffff" },
            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
        });

        // maybe useful for integration tests
        /*const newCat = {type: "investment",color: "ffff"};
        utils.verifyAuth = jest.fn(() => ({authorized : true}));
        categories.findOne = jest.fn(() => (null));
        //categories.constructor = jest.fn(() => ({save : (() => (null))}))
        const response = await request(app)
            .post("/api/categories")
            .send(newCat);
        expect(response.status).toBe(200);
        expect(response.body).toStrictEqual({
            data: {
                type: "invesment",
                color: "ffff"
            }
        });*/
    });

    test("shold return 401 if not authorized", async () => {
        const mockReq = {
            body: {
                type: "investment",
                color: "ffff"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "refreshedTokenMessage" }
        };
        jest.spyOn(utils, "verifyAuth").mockReturnValue({ flag: false, cause: "Unauthorized" });
        await controller.createCategory(mockReq, mockRes);
        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "Unauthorized"
        });
    });

    test("should return 400 if the category already exist", async () => {

        const mockReq = {
            body: {
                type: "investment",
                color: "ffff"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "refreshedTokenMessage" }
        };
        jest.spyOn(utils, "verifyAuth").mockReturnValue({ flag: true });
        jest.spyOn(categories, "findOne").mockReturnValue({ type: "investment" });
        await controller.createCategory(mockReq, mockRes);
        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(categories.findOne).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "Category " + mockReq.body.type + " already exists",
            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
        });
    });

    test("should return 500 if error", async () => {
        const mockReq = {
            body: {
                type: "investment",
                color: "ffff"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "refreshedTokenMessage" }
        };
        jest.spyOn(utils, "verifyAuth").mockReturnValue({ flag: true });
        jest.spyOn(categories, "findOne").mockRejectedValue(new Error("error"));
        await controller.createCategory(mockReq, mockRes);
        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(categories.findOne).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "error",
            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
        });
    });

    test("should return 400 if a parameter is invalid (missing or empty)", async () => {
        const mockReq = {
            body: {
                type: "investment",
                color: ""
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "refreshedTokenMessage" }
        };
        jest.spyOn(utils, "verifyAuth").mockReturnValue({ flag: true });
        await controller.createCategory(mockReq, mockRes);
        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "Parameters are not valid",
            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
        });
    });

});

describe("updateCategory", () => {

    test("should return 200 if the update is successfull", async () => {
        const mockReq = {
            params: {
                type: "investment",
            },
            body: {
                type: "research",
                color: "ffff",
            },
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "refreshedTokenMessage" }
        };
        jest.spyOn(utils, "verifyAuth").mockReturnValue({ flag: true });
        jest.spyOn(categories, "findOne").mockReturnValueOnce({ type: "investment", color: "ffff" });
        jest.spyOn(categories, "findOne").mockReturnValue(null);
        jest.spyOn(transactions, "updateMany").mockResolvedValue({ modifiedCount: 1 });
        jest.spyOn(categories, "updateOne").mockResolvedValue();
        await controller.updateCategory(mockReq, mockRes);
        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(categories.findOne).toHaveBeenCalled();
        expect(transactions.updateMany).toHaveBeenCalled();
        expect(categories.updateOne).toHaveBeenCalled();
        //expect(transactions.countDocuments).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({
            data: { message: "Category investment updated", count: 1 },
            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
        });

        /*const category = {type : "research", color: "ffff"};
        utils.verifyAuth = jest.fn(() => ({authorized : true}));
        categories.findOne = jest.fn(() => (null));
        transactions.updateMany = jest.fn(() => ({
            modifiedCount: () => 1
        }))
        const response = await request(app)
            .post("/api/categories/investment")
            .send(category);
        expect(response.status).toBe(200)
        expect(response.body).toStrictEqual({
            data: {message: "Category investment updated", count: 1}
        });*/
    });

    test("shold return 401 if not authorized", async () => {
        const mockReq = {
            params: {
                type: "investment",
            },
            body: {
                type: "research",
                color: "ffff",
            },
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "refreshedTokenMessage" }
        };
        jest.spyOn(utils, "verifyAuth").mockReturnValue({ flag: false, cause: "Unauthorized" });
        await controller.updateCategory(mockReq, mockRes);
        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "Unauthorized"
        });
    });

    test("should return 400 if category is not found", async () => {
        const mockReq = {
            params: {
                type: "investment",
            },
            body: {
                type: "research",
                color: "ffff",
            },
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "refreshedTokenMessage" }
        };
        jest.spyOn(utils, "verifyAuth").mockReturnValue({ flag: true });
        jest.spyOn(categories, "findOne").mockReturnValue(null);
        await controller.updateCategory(mockReq, mockRes);
        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(categories.findOne).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "Category investment not found",
            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
        });
    });

    test("should return 400 if category (body type) already exists", async () => {
        const mockReq = {
            params: {
                type: "investment",
            },
            body: {
                type: "research",
                color: "ffff",
            },
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "refreshedTokenMessage" }
        };
        jest.spyOn(utils, "verifyAuth").mockReturnValue({ flag: true });
        jest.spyOn(categories, "findOne").mockReturnValueOnce({ type: "investment", color: "ffff" });
        jest.spyOn(categories, "findOne").mockReturnValue({ type: "research", color: "ffff" });
        await controller.updateCategory(mockReq, mockRes);
        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(categories.findOne).toHaveBeenCalled();
        //expect(transactions.updateMany).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "Category research already exist",
            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
        });
    });

    test("should return 500 if there's an error on update", async () => {
        const mockReq = {
            params: {
                type: "investment",
            },
            body: {
                type: "research",
                color: "ffff",
            },
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "refreshedTokenMessage" }
        };
        jest.spyOn(utils, "verifyAuth").mockReturnValue({ flag: true });
        jest.spyOn(categories, "findOne").mockReturnValueOnce(true);
        jest.spyOn(categories, "findOne").mockReturnValue(null);
        jest.spyOn(transactions, "updateMany").mockRejectedValue(new Error("error"));
        //jest.spyOn(categories, "updateOne").mockResolvedValue();
        await controller.updateCategory(mockReq, mockRes);
        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(categories.findOne).toHaveBeenCalled();
        expect(transactions.updateMany).toHaveBeenCalled();
        //expect(categories.updateOne).toHaveBeenCalled();
        //expect(transactions.countDocuments).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "error",
            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
        });
    });

    test("should return 400 if a parameter is invalid (missing or empty string)", async () => {
        const mockReq = {
            params: {
                type: "investment"
            },
            body: {
                color: ""
            },
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "refreshedTokenMessage" }
        };
        jest.spyOn(utils, "verifyAuth").mockReturnValue({ flag: true });
        jest.spyOn(categories, "findOne").mockReturnValue({ type: "investment", color: "ffff" });
        await controller.updateCategory(mockReq, mockRes);
        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(categories.findOne).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "Parameters are not valid",
            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
        });
    });
})

describe("deleteCategory", () => {

    test("should delete the list of types and return 200", async () => {
        const mockReq = {
            body: { types: ["investment", "research"] }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "refreshedTokenMessage" }
        };
        jest.spyOn(utils, "verifyAuth").mockReturnValue({ flag: true });
        jest.spyOn(categories, "find").mockReturnValue([
            { type: "investment", color: "ffff" }, { type: "research", color: "ffff" }, { type: "depo", color: "fffa" }
        ]);
        jest.spyOn(categories, "findOne").mockReturnValue({ type: "something" });
        //jest.spyOn(categories, "findOne").mockReturnValue({type: "research", color: "ffff"});
        jest.spyOn(categories, "deleteOne").mockReturnValue();
        //jest.spyOn(categories, "findOne").mockReturnValue({type: "something"});
        jest.spyOn(transactions, "updateMany").mockReturnValue({ modifiedCount: 1 });
        //jest.spyOn(categories, "findOne").mockReturnValue({type: "depo", color: "ffff"});
        await controller.deleteCategory(mockReq, mockRes);
        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(categories.find).toHaveBeenCalled();
        expect(categories.findOne).toHaveBeenCalled();
        expect(categories.deleteOne).toHaveBeenCalled();
        //expect(categories.findOne).toHaveBeenCalled();
        //expect(transactions.updateMany).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({
            data: { message: "Categories " + mockReq.body.types + " deleted", count: 2 },
            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
        });
    });

    test("should return 401 if the authorization fails", async () => {
        const mockReq = {
            body: { types: ["investment", "research"] }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "refreshedTokenMessage" }
        };
        jest.spyOn(utils, "verifyAuth").mockReturnValue({ flag: false, cause: "Unauthorized" });
        await controller.deleteCategory(mockReq, mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "Unauthorized"
        });
    });

    test("should return 400 if a category is not found", async () => {
        const mockReq = {
            body: { types: ["investment", "research"] }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "refreshedTokenMessage" }
        };
        jest.spyOn(utils, "verifyAuth").mockReturnValue({ flag: true });
        jest.spyOn(categories, "find").mockReturnValue([
            { type: "investment", color: "ffff" }, { type: "research", color: "ffff" }, { type: "depo", color: "fffa" }
        ]);
        jest.spyOn(categories, "findOne").mockReturnValue(null);
        await controller.deleteCategory(mockReq, mockRes);
        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(categories.find).toHaveBeenCalled();
        expect(categories.findOne).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "Category not found",
            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
        });
    });

    test("should return 400 if I want to cancel all the categories", async () => {
        const mockReq = {
            body: { types: ["investment", "research"] }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "refreshedTokenMessage" }
        };
        jest.spyOn(utils, "verifyAuth").mockReturnValue({ flag: true });
        jest.spyOn(categories, "find").mockReturnValue([
            { type: "investment", color: "ffff" }
        ]);
        await controller.deleteCategory(mockReq, mockRes);
        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(categories.find).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "You can't delete all categories",
            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
        });
    });

    test("should return 500 if the updateMany goes wrong", async () => {
        const mockReq = {
            body: { types: ["investment", "research"] }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "refreshedTokenMessage" }
        };
        jest.spyOn(utils, "verifyAuth").mockReturnValue({ flag: true });
        jest.spyOn(categories, "find").mockReturnValue([
            { type: "investment", color: "ffff" }, { type: "research", color: "ffff" }, { type: "depo", color: "fffa" }
        ]);
        jest.spyOn(categories, "findOne").mockReturnValue({ type: "investment", color: "ffff" });
        jest.spyOn(categories, "deleteOne").mockReturnValue();
        jest.spyOn(categories, "findOne").mockReturnValue({ type: "investment", color: "ffff" });
        jest.spyOn(transactions, "updateMany").mockRejectedValue(new Error("error"));
        await controller.deleteCategory(mockReq, mockRes);
        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(categories.find).toHaveBeenCalled();
        expect(categories.findOne).toHaveBeenCalled();
        expect(categories.deleteOne).toHaveBeenCalled();
        expect(categories.findOne).toHaveBeenCalled();
        expect(transactions.updateMany).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "error",
            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
        });
    });

    test("should return 400 if a parameter is invalid (missing or empty)", async () => {
        const mockReq = {
            body: { types: ["investment", ""] }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "refreshedTokenMessage" }
        };
        jest.spyOn(utils, "verifyAuth").mockReturnValue({ flag: true });
        jest.spyOn(categories, "find").mockReturnValue([
            { type: "investment", color: "ffff" }, { type: "research", color: "ffff" }, { type: "depo", color: "fffa" }
        ]);
        jest.spyOn(categories, "findOne").mockReturnValue(true);
        await controller.deleteCategory(mockReq, mockRes);
        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(categories.find).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "Parameters are not valid",
            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
        });
    });
})

describe("getCategories", () => {
    test('TEST 1: return 401, Unauthorized', async () => {
        const mockReq = {
            body: {}
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" }
        }

        utils.verifyAuth = jest.fn().mockReturnValue({ flag: false, cause: "Unauthorized" });
        await controller.getCategories(mockReq, mockRes);

        expect(mockRes.json).toHaveBeenCalledWith({ error: "Unauthorized" })
        expect(mockRes.status).toHaveBeenCalledWith(401);
    });
    test('TEST 2: return 200, success', async () => {
        const mockReq = {
            body: {}
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" }
        }
        const categories_list = [{ type: "pizza", color: "#ffffff" }, { type: "spesa", color: "#000000" }];
        utils.verifyAuth = jest.fn().mockReturnValue({ flag: true, cause: "authorized" });
        jest.spyOn(categories, "find").mockResolvedValue(categories_list)
        await controller.getCategories(mockReq, mockRes);

        expect(mockRes.json).toHaveBeenCalledWith({
            data: categories_list,
            refreshedTokenMessage: "token"
        })
        expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    test('TEST 3: return 500, catch tests', async () => {
        const mockReq = {
            body: {}
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" }
        }

        utils.verifyAuth = jest.fn(() => { throw err("") });
        await controller.getCategories(mockReq, mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(500);
    });
})

describe("createTransaction", () => {

    test("Should return 404 if not params.username", async () => {

        const transaction = { username: "u0", amount: 400, type: "grocery" };

        const mockReq = {
            params: {},
            body: {
                transaction
            },
            route: {
                path: "/users/:username/transactions"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" },
        };

        await controller.createTransaction(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(404);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "Parameters error",
        });

    });

    test("Should return 400 if error in body", async () => {

        const transaction = { username: "u0", amount: 400, type: "grocery" };

        const mockReq = {
            params: { username: "g1" },
            body: {

            },
            route: {
                path: "/users/:username/transactions"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" },
        };

        await controller.createTransaction(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "Body error",
        });

    });

    test("Should return 400 if parameter is void string", async () => {

        const transaction = { username: "", amount: 400, type: "grocery" };

        const mockReq = {
            params: { username: "g1" },
            body: {
                transaction
            },
            route: {
                path: "/users/:username/transactions"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" },
        };

        await controller.createTransaction(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);

    });

    test("Should return 400 not valid float", async () => {

        const transaction = { username: "g1", amount: "daje", type: "grocery" };

        const mockReq = {
            params: { username: "g1" },
            body: transaction,
            route: {
                path: "/users/:username/transactions"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" },
        };

        await controller.createTransaction(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "Amount is not a float",
        });

    });

    test("Should return 400 if body and req names are not equal", async () => {

        const transaction = { username: "u0", amount: 400, type: "grocery" };

        const mockReq = {
            params: { username: "u1" },
            body: transaction,
            route: {
                path: "/users/:username/transactions"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" },
        };

        await controller.createTransaction(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "Usernames not equal",
        });

    });

    test("Should return 401 if not authorized", async () => {

        const transaction = { username: "u0", amount: 400, type: "grocery" };

        utils.verifyAuth = jest.fn(() => ({ flag: false }));

        const mockReq = {
            params: { username: "u0" },
            body: transaction,
            route: {
                path: "/users/:username/transactions"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" },
        };

        await controller.createTransaction(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(401);
    });

    test("Should return 400 if user is not valid", async () => {

        const transaction = { username: "u0", amount: 400, type: "grocery" };

        utils.verifyAuth = jest.fn(() => ({ flag: true }));

        User.findOne = jest.fn(() => (null));

        const mockReq = {
            params: { username: "u0" },
            body: transaction,
            route: {
                path: "/users/:username/transactions"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" },
        };

        await controller.createTransaction(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "Username invalid",
            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
        });

    });

    test("Should return 400 if category is not valid", async () => {

        const transaction = { username: "u0", amount: 400, type: "grocery" };

        utils.verifyAuth = jest.fn(() => ({ flag: true }));

        User.findOne = jest.fn(() => ({ username: "u0" }));

        categories.findOne = jest.fn(() => (null));

        const mockReq = {
            params: { username: "u0" },
            body: transaction,
            route: {
                path: "/users/:username/transactions"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" },
        };

        await controller.createTransaction(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "Category type invalid",
            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
        });

    });

    test("Should return 500 if error", async () => {

        const transaction = { username: "u0", amount: 400, type: "grocery" };

        utils.verifyAuth = jest.fn(() => { throw err("") });

        const mockReq = {
            params: { username: "u0" },
            body: transaction,
            route: {
                path: "/users/:username/transactions"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" },
        };

        await controller.createTransaction(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(500);
    });

    test("Should return 200 if everything works fine", async () => {

        const transaction = { username: "u0", amount: 400, type: "grocery" };

        utils.verifyAuth = jest.fn(() => ({ flag: true }));

        User.findOne = jest.fn(() => ({ username: "u0" }));

        categories.findOne = jest.fn(() => ({ "type": "groceries" }));

        transactions.constructor = jest.fn(() => ({ save: (() => (null)) }))

        const mockReq = {
            params: { username: "u0" },
            body: transaction,
            route: {
                path: "/users/:username/transactions"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" },
        };

        await controller.createTransaction(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(200);
    });

})

describe("getAllTransactions", () => {
    test('TEST 1: should return 401, Unauthorized', async () => {
        const mockReq = {
            body: {}
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" }
        }

        utils.verifyAuth = jest.fn().mockReturnValue({ flag: false, cause: "Unauthorized" });
        await controller.getAllTransactions(mockReq, mockRes);

        expect(mockRes.json).toHaveBeenCalledWith({ error: "Unauthorized" })
        expect(mockRes.status).toHaveBeenCalledWith(401);
    });
    test('TEST 2: should return 200, success', async () => {
        const mockReq = {
            body: {}
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" }
        }

        utils.verifyAuth = jest.fn().mockReturnValue({ flag: true, cause: "authorized" });
        const transactions_list = [{ _id: "id", username: "user", type: "spesa", amount: 5, color: "#ffffff", date: "2023-05-27" }]
        jest.spyOn(transactions, "aggregate").mockResolvedValue(transactions_list);

        await controller.getAllTransactions(mockReq, mockRes);

        expect(mockRes.json).toHaveBeenCalledWith({
            data: transactions_list,
            refreshedTokenMessage: "token"
        })
        expect(mockRes.status).toHaveBeenCalledWith(200);
    });
    test('TEST 3: should return 500, catch test', async () => {
        const mockReq = {
            body: {}
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" }
        }

        utils.verifyAuth = jest.fn(() => { throw err("") });

        await controller.getAllTransactions(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(500);
    });
})

describe("getTransactionsByUser", () => {
    /*  ------------------------------ Tests for ADMIN ------------------------------ */
    test("should return transactions with call made by Admin and status 200", async () => {
        const mockReq = {
            url: "/transactions/users/Mario",
            params: { username: "Mario" }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "refreshedTokenMessage" }
        };
        jest.spyOn(utils, "verifyAuth").mockReturnValue({ flag: true });
        jest.spyOn(User, "findOne").mockReturnValue({ username: "Mario" });
        jest.spyOn(transactions, "aggregate").mockReturnValue([
            { username: "Mario", type: "investment", amount: 10, date: Date("2023-05-21"), color: "ffff" },
            { username: "Mario", type: "depo", amount: 15, date: Date("2023-05-04"), color: "ffff" }
        ]);
        await controller.getTransactionsByUser(mockReq, mockRes);
        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(User.findOne).toHaveBeenCalled();
        expect(transactions.aggregate).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({
            data: [
                { username: "Mario", type: "investment", amount: 10, date: Date("2023-05-21"), color: "ffff" },
                { username: "Mario", type: "depo", amount: 15, date: Date("2023-05-04"), color: "ffff" }
            ],
            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
        });
    });

    test("should return empty array if user don't have transactions with call made by Admin and status 200", async () => {
        const mockReq = {
            url: "/transactions/users/Mario",
            params: { username: "Mario" }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "refreshedTokenMessage" }
        };
        jest.spyOn(utils, "verifyAuth").mockReturnValue({ flag: true });
        jest.spyOn(User, "findOne").mockReturnValue({ username: "Mario" });
        jest.spyOn(transactions, "aggregate").mockReturnValue([]);
        await controller.getTransactionsByUser(mockReq, mockRes);
        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(User.findOne).toHaveBeenCalled();
        expect(transactions.aggregate).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({
            data: [],
            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
        });
    });

    test("should return error 401 if authorization fails while Admin", async () => {
        const mockReq = {
            url: "/transactions/users/Mario",
            params: { username: "Mario" }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "refreshedTokenMessage" }
        };
        jest.spyOn(utils, "verifyAuth").mockReturnValue({ flag: false, cause: "Unauthorized" });
        await controller.getTransactionsByUser(mockReq, mockRes);
        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "Unauthorized"
        });
    });

    test("should return error 400 if user don't exist while performing as Admin", async () => {
        const mockReq = {
            url: "/transactions/users/Mario",
            params: { username: "Mario" }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "refreshedTokenMessage" }
        };
        jest.spyOn(utils, "verifyAuth").mockReturnValue({ flag: true });
        jest.spyOn(User, "findOne").mockReturnValue(null);
        await controller.getTransactionsByUser(mockReq, mockRes);
        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(User.findOne).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "User doesn't exist",
            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
        });
    });

    test("should return error 500 if the aggregate doesn't work properly", async () => {
        const mockReq = {
            url: "/transactions/users/Mario",
            params: { username: "Mario" }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "refreshedTokenMessage" }
        };
        jest.spyOn(utils, "verifyAuth").mockReturnValue({ flag: true });
        jest.spyOn(User, "findOne").mockReturnValue({ username: "Mario" });
        jest.spyOn(transactions, "aggregate").mockRejectedValue(new Error("error"));
        await controller.getTransactionsByUser(mockReq, mockRes);
        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(User.findOne).toHaveBeenCalled();
        expect(transactions.aggregate).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "error",
            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
        });
    });

    /*  ------------------------------ Tests for USERS ------------------------------ */
    test("should return transactions with call made by User and status 200", async () => {
        const mockReq = {
            url: "/users/Luigi/transactions",
            params: { username: "Luigi" },
            query: { date: null, from: null, upTo: null, minAmount: null, maxAmount: null }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "refreshedTokenMessage" }
        };
        jest.spyOn(utils, "verifyAuth").mockReturnValue({ flag: true });
        jest.spyOn(User, "findOne").mockReturnValue({ username: "Luigi" });
        jest.spyOn(transactions, "aggregate").mockReturnValue([
            { username: "Luigi", type: "investment", amount: 10, date: Date("2023-05-21"), color: "ffff" },
            { username: "Luigi", type: "depo", amount: 15, date: Date("2023-05-04"), color: "ffff" }
        ]);
        await controller.getTransactionsByUser(mockReq, mockRes);
        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(User.findOne).toHaveBeenCalled();
        expect(transactions.aggregate).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({
            data: [
                { username: "Luigi", type: "investment", amount: 10, date: Date("2023-05-21"), color: "ffff" },
                { username: "Luigi", type: "depo", amount: 15, date: Date("2023-05-04"), color: "ffff" }
            ],
            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
        });
    });

    test("should return empty array if no transactions are present while User and status 200", async () => {
        const mockReq = {
            url: "/users/Luigi/transactions",
            params: { username: "Luigi" },
            query: { date: null, from: null, upTo: null, minAmount: null, maxAmount: null }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "refreshedTokenMessage" }
        };
        jest.spyOn(utils, "verifyAuth").mockReturnValue({ flag: true });
        jest.spyOn(User, "findOne").mockReturnValue({ username: "Luigi" });
        jest.spyOn(transactions, "aggregate").mockReturnValue([]);
        await controller.getTransactionsByUser(mockReq, mockRes);
        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(User.findOne).toHaveBeenCalled();
        expect(transactions.aggregate).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({
            data: [],
            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
        });
    });

    test("should return error 401 if authorization fails while User", async () => {
        const mockReq = {
            url: "/users/Luigi/transactions",
            params: { username: "Luigi" }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "refreshedTokenMessage" }
        };
        jest.spyOn(utils, "verifyAuth").mockReturnValue({ flag: false, cause: "Unauthorized" });
        await controller.getTransactionsByUser(mockReq, mockRes);
        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "Unauthorized"
        });
    });

    test("should return error 400 if user don't exist while performing as User", async () => {
        const mockReq = {
            url: "/users/Luigi/transactions",
            params: { username: "Luigi" }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "refreshedTokenMessage" }
        };
        jest.spyOn(utils, "verifyAuth").mockReturnValue({ flag: true });
        jest.spyOn(User, "findOne").mockReturnValue(null);
        await controller.getTransactionsByUser(mockReq, mockRes);
        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(User.findOne).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "User doesn't exist",
            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
        });
    });

    test("should return error 500 if the aggregate doesn't work properly", async () => {
        const mockReq = {
            url: "/users/Luigi/transactions",
            params: { username: "Luigi" },
            query: { date: null, from: null, upTo: null, minAmount: null, maxAmount: null }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "refreshedTokenMessage" }
        };
        jest.spyOn(utils, "verifyAuth").mockReturnValue({ flag: true });
        jest.spyOn(User, "findOne").mockReturnValue({ username: "Luigi" });
        jest.spyOn(transactions, "aggregate").mockRejectedValue(new Error("error"));
        await controller.getTransactionsByUser(mockReq, mockRes);
        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(User.findOne).toHaveBeenCalled();
        expect(transactions.aggregate).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "error",
            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
        });
    });
})

describe("getTransactionsByUserByCategory", () => {

    /*  ------------------------------ Tests for ADMIN ------------------------------ */
    test("should return transactions filtered by user and by category with call made by Admin and status 200", async () => {
        const mockReq = {
            url: "/transactions/users/Mario/category/investment",
            params: { username: "Mario", category: "investment" }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "refreshedTokenMessage" }
        };
        jest.spyOn(utils, "verifyAuth").mockReturnValue({ flag: true });
        jest.spyOn(User, "findOne").mockReturnValue({ username: "Mario" });
        jest.spyOn(categories, "findOne").mockReturnValue({ type: "investment" });
        jest.spyOn(transactions, "aggregate").mockReturnValue([
            { username: "Mario", type: "investment", amount: 10, date: Date("2023-05-21"), color: "ffff" },
            { username: "Mario", type: "investment", amount: 15, date: Date("2023-05-04"), color: "ffff" }
        ]);
        await controller.getTransactionsByUserByCategory(mockReq, mockRes);
        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(User.findOne).toHaveBeenCalled();
        expect(categories.findOne).toHaveBeenCalled();
        expect(transactions.aggregate).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({
            data: [
                { username: "Mario", type: "investment", amount: 10, date: Date("2023-05-21"), color: "ffff" },
                { username: "Mario", type: "investment", amount: 15, date: Date("2023-05-04"), color: "ffff" }
            ],
            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
        });
    });

    test("should return empty array if user don't have transactions with call made by Admin and status 200", async () => {
        const mockReq = {
            url: "/transactions/users/Mario/category/investment",
            params: { username: "Mario", category: "investment" }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "refreshedTokenMessage" }
        };
        jest.spyOn(utils, "verifyAuth").mockReturnValue({ flag: true });
        jest.spyOn(User, "findOne").mockReturnValue({ username: "Mario" });
        jest.spyOn(categories, "findOne").mockReturnValue({ type: "investment" });
        jest.spyOn(transactions, "aggregate").mockReturnValue([]);
        await controller.getTransactionsByUserByCategory(mockReq, mockRes);
        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(User.findOne).toHaveBeenCalled();
        expect(categories.findOne).toHaveBeenCalled();
        expect(transactions.aggregate).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({
            data: [],
            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
        });
    });

    test("should return error 401 if authorization fails while Admin", async () => {
        const mockReq = {
            url: "/transactions/users/Mario/category/investment",
            params: { username: "Mario", category: "investment" }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "refreshedTokenMessage" }
        };
        jest.spyOn(utils, "verifyAuth").mockReturnValue({ flag: false, cause: "Unauthorized" });
        await controller.getTransactionsByUserByCategory(mockReq, mockRes);
        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "Unauthorized"
        });
    });

    test("should return error 400 if user don't exist while performing as Admin", async () => {
        const mockReq = {
            url: "/transactions/users/Mario/category/investment",
            params: { username: "Mario", category: "investment" }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "refreshedTokenMessage" }
        };
        jest.spyOn(utils, "verifyAuth").mockReturnValue({ flag: true });
        jest.spyOn(User, "findOne").mockReturnValue(null);
        await controller.getTransactionsByUserByCategory(mockReq, mockRes);
        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(User.findOne).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "User doesn't exist",
            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
        });
    });

    test("should return error 400 if category don't exist while performing as Admin", async () => {
        const mockReq = {
            url: "/transactions/users/Mario/category/investment",
            params: { username: "Mario", category: "investment" }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "refreshedTokenMessage" }
        };
        jest.spyOn(utils, "verifyAuth").mockReturnValue({ flag: true });
        jest.spyOn(User, "findOne").mockReturnValue({ username: "Mario" });
        jest.spyOn(categories, "findOne").mockReturnValue(null);
        await controller.getTransactionsByUserByCategory(mockReq, mockRes);
        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(User.findOne).toHaveBeenCalled();
        expect(categories.findOne).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "Category doesn't exist",
            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
        });
    });

    test("should return error 500 if the aggregate doesn't work properly", async () => {
        const mockReq = {
            url: "/transactions/users/Mario/category/investment",
            params: { username: "Mario", category: "investment" }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "refreshedTokenMessage" }
        };
        jest.spyOn(utils, "verifyAuth").mockReturnValue({ flag: true });
        jest.spyOn(User, "findOne").mockReturnValue({ username: "Mario" });
        jest.spyOn(categories, "findOne").mockReturnValue({ type: "investment" });
        jest.spyOn(transactions, "aggregate").mockRejectedValue(new Error("error"));
        await controller.getTransactionsByUserByCategory(mockReq, mockRes);
        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(User.findOne).toHaveBeenCalled();
        expect(categories.findOne).toHaveBeenCalled();
        expect(transactions.aggregate).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "error",
            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
        });
    });

    /*  ------------------------------ Tests for USERS ------------------------------ */
    test("should return transactions filter by user and by category with call made by User and status 200", async () => {
        const mockReq = {
            url: "/users/Luigi/transactions/category/investment",
            params: { username: "Luigi", category: "investment" }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "refreshedTokenMessage" }
        };
        jest.spyOn(utils, "verifyAuth").mockReturnValue({ flag: true });
        jest.spyOn(User, "findOne").mockReturnValue({ username: "Luigi" });
        jest.spyOn(categories, "findOne").mockReturnValue({ type: "investment" });
        jest.spyOn(transactions, "aggregate").mockReturnValue([
            { username: "Luigi", type: "investment", amount: 10, date: Date("2023-05-21"), color: "ffff" },
            { username: "Luigi", type: "investment", amount: 15, date: Date("2023-05-04"), color: "ffff" }
        ]);
        await controller.getTransactionsByUserByCategory(mockReq, mockRes);
        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(User.findOne).toHaveBeenCalled();
        expect(categories.findOne).toHaveBeenCalled();
        expect(transactions.aggregate).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({
            data: [
                { username: "Luigi", type: "investment", amount: 10, date: Date("2023-05-21"), color: "ffff" },
                { username: "Luigi", type: "investment", amount: 15, date: Date("2023-05-04"), color: "ffff" }
            ],
            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
        });
    });

    test("should return empty array if user don't have transactions with call made by User and status 200", async () => {
        const mockReq = {
            url: "/users/Luigi/transactions/category/investment",
            params: { username: "Luigi", category: "investment" }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "refreshedTokenMessage" }
        };
        jest.spyOn(utils, "verifyAuth").mockReturnValue({ flag: true });
        jest.spyOn(User, "findOne").mockReturnValue({ username: "Luigi" });
        jest.spyOn(categories, "findOne").mockReturnValue({ type: "investment" });
        jest.spyOn(transactions, "aggregate").mockReturnValue([]);
        await controller.getTransactionsByUserByCategory(mockReq, mockRes);
        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(categories.findOne).toHaveBeenCalled();
        expect(User.findOne).toHaveBeenCalled();
        expect(transactions.aggregate).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({
            data: [],
            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
        });
    });

    test("should return error 401 if authorization fails while User", async () => {
        const mockReq = {
            url: "/users/Luigi/transactions/category/investment",
            params: { username: "Luigi", category: "investment" }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "refreshedTokenMessage" }
        };
        jest.spyOn(utils, "verifyAuth").mockReturnValue({ flag: false, cause: "Unauthorized" });
        await controller.getTransactionsByUserByCategory(mockReq, mockRes);
        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "Unauthorized"
        });
    });

    test("should return error 400 if user don't exist while performing as Admin", async () => {
        const mockReq = {
            url: "/users/Luigi/transactions/category/investment",
            params: { username: "Luigi", category: "investment" }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "refreshedTokenMessage" }
        };
        jest.spyOn(utils, "verifyAuth").mockReturnValue({ flag: true });
        jest.spyOn(User, "findOne").mockReturnValue(null);
        await controller.getTransactionsByUserByCategory(mockReq, mockRes);
        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(User.findOne).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "User doesn't exist",
            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
        });
    });

    test("should return error 400 if category don't exist while performing as User", async () => {
        const mockReq = {
            url: "/users/Luigi/transactions/category/investment",
            params: { username: "Luigi", category: "investment" }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "refreshedTokenMessage" }
        };
        jest.spyOn(utils, "verifyAuth").mockReturnValue({ flag: true });
        jest.spyOn(User, "findOne").mockReturnValue({ username: "Luigi" });
        jest.spyOn(categories, "findOne").mockReturnValue(null);
        await controller.getTransactionsByUserByCategory(mockReq, mockRes);
        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(User.findOne).toHaveBeenCalled();
        expect(categories.findOne).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "Category doesn't exist",
            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
        });
    });

    test("should return error 500 if the aggregate doesn't work properly", async () => {
        const mockReq = {
            url: "/users/Luigi/transactions/category/investment",
            params: { username: "Luigi", category: "investment" }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "refreshedTokenMessage" }
        };
        jest.spyOn(utils, "verifyAuth").mockReturnValue({ flag: true });
        jest.spyOn(User, "findOne").mockReturnValue({ username: "Luigi" });
        jest.spyOn(categories, "findOne").mockReturnValue({ type: "investment" });
        jest.spyOn(transactions, "aggregate").mockRejectedValue(new Error("error"));
        await controller.getTransactionsByUserByCategory(mockReq, mockRes);
        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(categories.findOne).toHaveBeenCalled();
        expect(User.findOne).toHaveBeenCalled();
        expect(transactions.aggregate).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "error",
            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
        });
    });
})

describe("getTransactionsByGroup", () => {
    test('TEST 1 : return 400, group does not exist', async () => {
        const mockReq = {
            body: {},
            params: { name: "g1" },
            route: { path: "test_path" }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" }
        }

        jest.spyOn(Group, "findOne").mockResolvedValueOnce(undefined);

        await controller.getTransactionsByGroup(mockReq, mockRes);

        expect(Group.findOne).toHaveBeenCalledTimes(1);
        expect(mockRes.json).toHaveBeenCalledWith({ error: "Group not found" });
        expect(mockRes.status).toHaveBeenCalledWith(400);
    });
    test('TEST 2 : return 401, Unauthorized Group ', async () => {
        const mockReq = {
            body: {},
            params: { name: "g1" },
            route: { path: "/groups/:name/transactions" }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" }
        }

        utils.verifyAuth = jest.fn().mockReturnValue({ flag: false, cause: "Unauthorized" });
        jest.spyOn(Group, "findOne").mockResolvedValueOnce({ name: "g1", members: [{ email: "user1@example.com" }, { email: "user2@example.com" }] });

        await controller.getTransactionsByGroup(mockReq, mockRes);

        expect(Group.findOne).toHaveBeenCalledTimes(1);
        expect(mockRes.json).toHaveBeenCalledWith({ error: "Unauthorized" });
        expect(mockRes.status).toHaveBeenCalledWith(401);
    });
    test('TEST 3 : return 401, Unauthorized Admin', async () => {
        const mockReq = {
            body: {},
            params: { name: "g1" },
            route: { path: "/transactions/groups/:name" }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" }
        }

        utils.verifyAuth = jest.fn().mockReturnValue({ flag: false, cause: "Unauthorized" });
        jest.spyOn(Group, "findOne").mockResolvedValueOnce({ name: "g1", members: [{ email: "user1@example.com" }, { email: "user2@example.com" }] });

        await controller.getTransactionsByGroup(mockReq, mockRes);

        expect(Group.findOne).toHaveBeenCalledTimes(1);
        expect(mockRes.json).toHaveBeenCalledWith({ error: "Unauthorized" });
        expect(mockRes.status).toHaveBeenCalledWith(401);
    });
    test('TEST 4 : return 200 (Group)', async () => {
        const mockReq = {
            body: {},
            params: { name: "g1" },
            route: { path: "/groups/:name/transactions" }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" }
        }

        utils.verifyAuth = jest.fn().mockReturnValue({ flag: true, cause: "authorized" });
        const transactions_list = [
            { username: "user1", type: "type1", amount: 1, date: "2022-03-12", color: "#111111" },
            { username: "user1", type: "type2", amount: 2, date: "2022-03-13", color: "#222222" },
            { username: "user2", type: "type1", amount: 3, date: "2022-04-12", color: "#111111" },
            { username: "user2", type: "type2", amount: 4, date: "2022-04-14", color: "#222222" },
        ]
        jest.spyOn(Group, "findOne").mockResolvedValueOnce({ name: "g1", members: [{ email: "user1@example.com" }, { email: "user2@example.com" }] });
        jest.spyOn(User, "find").mockResolvedValueOnce([{ username: "user1" }, { username: "user2" }]);
        jest.spyOn(transactions, "aggregate").mockResolvedValueOnce(transactions_list);
        await controller.getTransactionsByGroup(mockReq, mockRes);

        expect(Group.findOne).toHaveBeenCalledTimes(1);
        expect(mockRes.json).toHaveBeenCalledWith({
            data: transactions_list,
            refreshedTokenMessage: "token"
        });
        expect(mockRes.status).toHaveBeenCalledWith(200);
    });
    test('TEST 5 : return 200 (Admin)', async () => {
        const mockReq = {
            body: {},
            params: { name: "g1" },
            route: { path: "/transactions/groups/:name" }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" }
        }

        utils.verifyAuth = jest.fn().mockReturnValue({ flag: true, cause: "authorized" });
        const transactions_list = [
            { username: "user1", type: "type1", amount: 1, date: "2022-03-12", color: "#111111" },
            { username: "user1", type: "type2", amount: 2, date: "2022-03-13", color: "#222222" },
            { username: "user2", type: "type1", amount: 3, date: "2022-04-12", color: "#111111" },
            { username: "user2", type: "type2", amount: 4, date: "2022-04-14", color: "#222222" },
        ]
        jest.spyOn(Group, "findOne").mockResolvedValueOnce({ name: "g1", members: [{ email: "user1@example.com" }, { email: "user2@example.com" }] });
        jest.spyOn(User, "find").mockResolvedValueOnce([{ username: "user1" }, { username: "user2" }]);
        jest.spyOn(transactions, "aggregate").mockResolvedValueOnce(transactions_list);
        await controller.getTransactionsByGroup(mockReq, mockRes);

        expect(Group.findOne).toHaveBeenCalledTimes(1);
        expect(mockRes.json).toHaveBeenCalledWith({
            data: transactions_list,
            refreshedTokenMessage: "token"
        });
        expect(mockRes.status).toHaveBeenCalledWith(200);
    });
    test('TEST 6 : return 200 (Impossible path)', async () => {
        const mockReq = {
            body: {},
            params: { name: "g1" },
            route: { path: "/impossible" }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" }
        }

        utils.verifyAuth = jest.fn().mockReturnValue({ flag: true, cause: "authorized" });
        const transactions_list = [
            { username: "user1", type: "type1", amount: 1, date: "2022-03-12", color: "#111111" },
            { username: "user1", type: "type2", amount: 2, date: "2022-03-13", color: "#222222" },
            { username: "user2", type: "type1", amount: 3, date: "2022-04-12", color: "#111111" },
            { username: "user2", type: "type2", amount: 4, date: "2022-04-14", color: "#222222" },
        ]
        jest.spyOn(Group, "findOne").mockResolvedValueOnce({ name: "g1", members: [{ email: "user1@example.com" }, { email: "user2@example.com" }] });
        jest.spyOn(User, "find").mockResolvedValueOnce([{ username: "user1" }, { username: "user2" }]);
        jest.spyOn(transactions, "aggregate").mockResolvedValueOnce(transactions_list);
        await controller.getTransactionsByGroup(mockReq, mockRes);

        expect(Group.findOne).toHaveBeenCalledTimes(1);
        expect(mockRes.json).toHaveBeenCalledWith({
            data: transactions_list,
            refreshedTokenMessage: "token"
        });
        expect(mockRes.status).toHaveBeenCalledWith(200);
    });
    
    test('TEST 7 : return 500, catch', async () => {
        const mockReq = {
            body: {},
            params: { name: "g1" },
            route: { path: "/transactions/groups/:name" }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" }
        }

        jest.spyOn(Group, "findOne").mockImplementation(() => { throw err("") })

        await controller.getTransactionsByGroup(mockReq, mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(500);
    });
})

describe("getTransactionsByGroupByCategory", () => {
    test('TEST 1: return 400, group does not exist', async () => {
        const mockReq = {
            body: {},
            params: { name: "g1", category: "type1" },
            route: { path: "test_path" }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" }
        }

        jest.spyOn(Group, "findOne").mockResolvedValueOnce(undefined);

        await controller.getTransactionsByGroupByCategory(mockReq, mockRes);

        expect(Group.findOne).toHaveBeenCalledTimes(1);
        expect(mockRes.json).toHaveBeenCalledWith({ error: "Group not found" });
        expect(mockRes.status).toHaveBeenCalledWith(400);
    });
    test('TEST 2 : return 401, Unauthorized Group ', async () => {
        const mockReq = {
            body: {},
            params: { name: "g1", category: "type1" },
            route: { path: "/groups/:name/transactions/category/:category" }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" }
        }

        utils.verifyAuth = jest.fn().mockReturnValue({ flag: false, cause: "Unauthorized" });
        jest.spyOn(Group, "findOne").mockResolvedValueOnce({ name: "g1", members: [{ email: "user1@example.com" }, { email: "user2@example.com" }] });

        await controller.getTransactionsByGroupByCategory(mockReq, mockRes);

        expect(Group.findOne).toHaveBeenCalledTimes(1);
        expect(mockRes.json).toHaveBeenCalledWith({ error: "Unauthorized" });
        expect(mockRes.status).toHaveBeenCalledWith(401);
    });
    test('TEST 3 : return 401, Unauthorized Admin', async () => {
        const mockReq = {
            body: {},
            params: { name: "g1", category: "type1" },
            route: { path: "/transactions/groups/:name/category/:category" }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" }
        }

        utils.verifyAuth = jest.fn().mockReturnValue({ flag: false, cause: "Unauthorized" });
        jest.spyOn(Group, "findOne").mockResolvedValueOnce({ name: "g1", members: [{ email: "user1@example.com" }, { email: "user2@example.com" }] });

        await controller.getTransactionsByGroupByCategory(mockReq, mockRes);

        expect(Group.findOne).toHaveBeenCalledTimes(1);
        expect(mockRes.json).toHaveBeenCalledWith({ error: "Unauthorized" });
        expect(mockRes.status).toHaveBeenCalledWith(401);
    });
    test('TEST 4 : return 400, category not found', async () => {
        const mockReq = {
            body: {},
            params: { name: "g1", category: "bad_type" },
            route: { path: "/groups/:name/transactions/category/:category" }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" }
        }

        utils.verifyAuth = jest.fn().mockReturnValue({ flag: true, cause: "authorized" });
        jest.spyOn(Group, "findOne").mockResolvedValueOnce({ name: "g1", members: [{ email: "user1@example.com" }, { email: "user2@example.com" }] });
        jest.spyOn(categories, "findOne").mockResolvedValueOnce(undefined);

        await controller.getTransactionsByGroupByCategory(mockReq, mockRes);

        expect(Group.findOne).toHaveBeenCalledTimes(1);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "Category not found",
            refreshedTokenMessage: "token"
        });
        expect(mockRes.status).toHaveBeenCalledWith(400);
    });
    test('TEST 5 : return 200 (Group)', async () => {
        const mockReq = {
            body: {},
            params: { name: "g1", category: "type1" },
            route: { path: "/groups/:name/transactions/category/:category" }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" }
        }

        utils.verifyAuth = jest.fn().mockReturnValue({ flag: true, cause: "authorized" });
        const transactions_list = [
            { username: "user1", type: "type1", amount: 1, date: "2022-03-12", color: "#111111" },
            { username: "user2", type: "type1", amount: 3, date: "2022-04-12", color: "#111111" },
        ]
        jest.spyOn(Group, "findOne").mockResolvedValueOnce({ name: "g1", members: [{ email: "user1@example.com" }, { email: "user2@example.com" }] });
        jest.spyOn(categories, "findOne").mockResolvedValueOnce({type : "type1", color: "#111111"});
        jest.spyOn(User, "find").mockResolvedValueOnce([{ username: "user1" }, { username: "user2" }]);
        jest.spyOn(transactions, "aggregate").mockResolvedValueOnce(transactions_list);

        await controller.getTransactionsByGroupByCategory(mockReq, mockRes);

        expect(mockRes.json).toHaveBeenCalledWith({
            data: transactions_list,
            refreshedTokenMessage: "token"
        });
        expect(mockRes.status).toHaveBeenCalledWith(200);
    });
    test('TEST 6 : return 200 (Admin)', async () => {
        const mockReq = {
            body: {},
            params: { name: "g1", category: "type1" },
            route: { path: "/transactions/groups/:name/category/:category" }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" }
        }

        utils.verifyAuth = jest.fn().mockReturnValue({ flag: true, cause: "authorized" });
        const transactions_list = [
            { username: "user1", type: "type1", amount: 1, date: "2022-03-12", color: "#111111" },
            { username: "user2", type: "type1", amount: 3, date: "2022-04-12", color: "#111111" },
        ]
        jest.spyOn(Group, "findOne").mockResolvedValueOnce({ name: "g1", members: [{ email: "user1@example.com" }, { email: "user2@example.com" }] });
        jest.spyOn(categories, "findOne").mockResolvedValueOnce({type : "type1", color: "#111111"});
        jest.spyOn(User, "find").mockResolvedValueOnce([{ username: "user1" }, { username: "user2" }]);
        jest.spyOn(transactions, "aggregate").mockResolvedValueOnce(transactions_list);

        await controller.getTransactionsByGroupByCategory(mockReq, mockRes);

        expect(mockRes.json).toHaveBeenCalledWith({
            data: transactions_list,
            refreshedTokenMessage: "token"
        });
        expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    test('TEST 7 : return 200 (Impossible path)', async () => {
        const mockReq = {
            body: {},
            params: { name: "g1", category: "type1" },
            route: { path: "/impossible" }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" }
        }

        utils.verifyAuth = jest.fn().mockReturnValue({ flag: true, cause: "authorized" });
        const transactions_list = [
            { username: "user1", type: "type1", amount: 1, date: "2022-03-12", color: "#111111" },
            { username: "user2", type: "type1", amount: 3, date: "2022-04-12", color: "#111111" },
        ]
        jest.spyOn(Group, "findOne").mockResolvedValueOnce({ name: "g1", members: [{ email: "user1@example.com" }, { email: "user2@example.com" }] });
        jest.spyOn(categories, "findOne").mockResolvedValueOnce({type : "type1", color: "#111111"});
        jest.spyOn(User, "find").mockResolvedValueOnce([{ username: "user1" }, { username: "user2" }]);
        jest.spyOn(transactions, "aggregate").mockResolvedValueOnce(transactions_list);

        await controller.getTransactionsByGroupByCategory(mockReq, mockRes);

        expect(mockRes.json).toHaveBeenCalledWith({
            data: transactions_list,
            refreshedTokenMessage: "token"
        });
        expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    test('TEST 8 : return 500, catch', async () => {
        const mockReq = {
            body: {},
            params: { name: "g1" },
            route: { path: "/transactions/groups/:name" }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" }
        }

        jest.spyOn(Group, "findOne").mockImplementation(() => { throw err("")})

        await controller.getTransactionsByGroupByCategory(mockReq, mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(500);
    });
})

describe("deleteTransaction", () => {
    test('should delete the transaction and return a success response', async () => {
        const mockReq = {
            body: { _id: "id" },
            params: { username: "user1" }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "refreshedTokenMessage" }
        };

        jest.spyOn(utils, "verifyAuth").mockReturnValue({ flag: true });
        jest.spyOn(User, "findOne").mockReturnValue({ username: "user1" });
        jest.spyOn(transactions, "findOne").mockReturnValue({ _id: "id", username: "user1", amount: "10", type: "investment", date: "2023-05-21" });
        jest.spyOn(transactions, "deleteOne").mockReturnValue({});
        await controller.deleteTransaction(mockReq, mockRes);
        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(User.findOne).toHaveBeenCalled();
        expect(transactions.findOne).toHaveBeenCalled();
        expect(transactions.deleteOne).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({
            data: { message: 'Transaction has been deleted' },
            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
        });


    });

    test('should return error 401 if authorization fails while performing as User', async () => {
        const mockReq = {
            body: { _id: "id" },
            params: { username: "user1" }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "refreshedTokenMessage" }
        };

        jest.spyOn(utils, "verifyAuth").mockReturnValue({ flag: false, cause: "cause" });
        await controller.deleteTransaction(mockReq, mockRes);
        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "cause"
        });
    });

    test('should return error 400 if the transaction does not exist', async () => {
        const mockReq = {
            body: { _id: "id" },
            params: { username: "user1" }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "refreshedTokenMessage" }
        };

        jest.spyOn(utils, "verifyAuth").mockReturnValue({ flag: true });
        jest.spyOn(User, "findOne").mockReturnValue({ username: "user1" });
        jest.spyOn(transactions, "findOne").mockReturnValue(null);
        await controller.deleteTransaction(mockReq, mockRes);
        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(User.findOne).toHaveBeenCalled();
        expect(transactions.findOne).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "id does not correspond to any transaction",
            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
        });
    });

    test('should return 400 if the user does not exist', async () => {
        const mockReq = {
            body: { _id: "id" },
            params: { username: "user1" }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "refreshedTokenMessage" }
        };

        jest.spyOn(utils, "verifyAuth").mockReturnValue({ flag: true });
        jest.spyOn(User, "findOne").mockReturnValue(null);
        await controller.deleteTransaction(mockReq, mockRes);
        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(User.findOne).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "User of the transaction does not exist",
            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
        });
    });

    test('should return 500 if the transaction cannot be deleted', async () => {
        const mockReq = {
            body: { _id: "id" },
            params: { username: "user1" }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "refreshedTokenMessage" }
        };

        jest.spyOn(utils, "verifyAuth").mockReturnValue({ flag: true });
        jest.spyOn(User, "findOne").mockReturnValue({ username: "user1" });
        jest.spyOn(transactions, "findOne").mockReturnValue({ _id: "id", username: "user1", amount: "10", type: "investment", date: "2023-05-21" });
        jest.spyOn(transactions, "deleteOne").mockRejectedValue(new Error("error"));
        await controller.deleteTransaction(mockReq, mockRes);
        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(User.findOne).toHaveBeenCalled();
        expect(transactions.findOne).toHaveBeenCalled();
        expect(transactions.deleteOne).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "error",
            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
        });
    });

    test('shoul return error 401 if authorization fails while performing as Admin', async () => {
        const mockReq = {
            body: { _id: "id" },
            params: { username: "user1" }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "refreshedTokenMessage" }
        };

        jest.spyOn(utils, "verifyAuth").mockReturnValue({ flag: false, cause: "cause" });
        await controller.deleteTransaction(mockReq, mockRes);
        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "cause"
        });
    });

    test("should if transactionId is not defined", async () => {
        const mockReq = {
            body: {},
            params: { username: "user1" }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "refreshedTokenMessage" }
        }
        jest.spyOn(utils, "verifyAuth").mockReturnValue({ flag: true });
        await controller.deleteTransaction(mockReq, mockRes);
        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "Request body does not contain all the necessary attributes",
            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
        });
    });

    test("should return 400 id the transactionId is an empty string", async () => {
        const mockReq = {
            body: { _id: "" },
            params: { username: "user1" }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "refreshedTokenMessage" }
        };
        jest.spyOn(utils, "verifyAuth").mockReturnValue({ flag: true });
        await controller.deleteTransaction(mockReq, mockRes);
        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "Transaction ID is an empty string",
            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
        });
    });

})

describe("deleteTransactions", () => {
    test('TEST 1: return 401, authentication failed ', async () => {
        const mockReq = {
            body: {
                _ids: ["6hjkohgfc8nvu786"]
            }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" }
        }

        utils.verifyAuth = jest.fn().mockReturnValue({ flag: false, cause: "Unauthorized" });
        await controller.deleteTransactions(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({ error: "Unauthorized" })
    });

    test("TEST 2: should return 400, Body error: missing field ", async () => {
        const mockReq = {
            body: {
                //_ids: ["6hjkohgfc8nvu786"]
            }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" }
        }

        utils.verifyAuth = jest.fn().mockReturnValue({ flag: true, cause: "authorized" });
        await controller.deleteTransactions(mockReq, mockRes);

        expect(mockRes.json).toHaveBeenCalledWith({
            error: "Input is not valid",
            refreshedTokenMessage: "token"
        })
        expect(mockRes.status).toHaveBeenCalledWith(400);

    })
    test("TEST 3: should return 400, Body error: bad field ", async () => {
        const mockReq = {
            body: {
                _ids: []
            }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" }
        }

        utils.verifyAuth = jest.fn().mockReturnValue({ flag: true, cause: "authorized" });
        await controller.deleteTransactions(mockReq, mockRes);

        expect(mockRes.json).toHaveBeenCalledWith({
            error: "Input is not valid",
            refreshedTokenMessage: "token"
        })
        expect(mockRes.status).toHaveBeenCalledWith(400);
    })

    test("TEST 4: should return 400, Empty string recived ", async () => {
        const mockReq = {
            body: {
                _ids: [""]
            }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" }
        }

        utils.verifyAuth = jest.fn().mockReturnValue({ flag: true, cause: "authorized" });
        await controller.deleteTransactions(mockReq, mockRes);

        expect(mockRes.json).toHaveBeenCalledWith({
            error: `empty string passed`,
            refreshedTokenMessage: "token"
        })
        expect(mockRes.status).toHaveBeenCalledWith(400);
    })
    test("TEST 5: should return 400, Body error: missing field ", async () => {
        const mockReq = {
            body: {
                _ids: ["6hjkohgfc8nvu786"]
            }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" }
        }

        utils.verifyAuth = jest.fn().mockReturnValue({ flag: true, cause: "authorized" });
        jest.spyOn(transactions, "findById").mockReturnValueOnce(undefined);
        await controller.deleteTransactions(mockReq, mockRes);



        expect(mockRes.json).toHaveBeenCalledWith({
            error: `6hjkohgfc8nvu786 does not correspond to any transaction`,
            refreshedTokenMessage: "token"
        })
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(transactions.findById).toHaveBeenCalledTimes(1);
    })

    test("TEST 6: should return 200, success", async () => {
        const mockReq = {
            body: {
                _ids: ["6hjkohgfc8nvu786"]
            }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" }
        }

        utils.verifyAuth = jest.fn().mockReturnValue({ flag: true, cause: "authorized" });
        jest.spyOn(transactions, "findById").mockReturnValue({ username: "a_test_transaction" });
        jest.spyOn(transactions, "deleteOne");
        await controller.deleteTransactions(mockReq, mockRes);



        expect(mockRes.json).toHaveBeenCalledWith({
            data: { message: "Transcations Deleted" },
            refreshedTokenMessage: "token"
        })
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(transactions.findById).toHaveBeenCalledTimes(1);
        expect(transactions.deleteOne).toHaveBeenCalledTimes(1);
    })

    test("TEST 7: should return status 500, catch test", async () => {
        const mockReq = {
            body: {
                _ids: ["6hjkohgfc8nvu786"]
            }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "token" }
        }

        utils.verifyAuth = jest.fn(() => { throw err("") });
        await controller.deleteTransactions(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(500);
    });
})
