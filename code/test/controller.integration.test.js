import request from 'supertest';
import { app } from '../app';
import { categories, transactions } from '../models/model';
import {Group, User } from '../models/User'
import mongoose, { Model } from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// giacomo.sansone@aol.com
// pcineverdies

const validAccessTokenRegular = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE2ODUyODk2MzMsImV4cCI6MTcxNjgyNTkzMCwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsImVtYWlsIjoiZ2lhY29tby5zYW5zb25lQGFvbC5jb20iLCJpZCI6IjMiLCJ1c2VybmFtZSI6InBjaW5ldmVyZGllcyIsInJvbGUiOiJSZWd1bGFyIn0.3NOo014Ro8Bov9Q2nevMdmow2MzuA1FCCo-AUZXPio4";
const validRefreshTokenRegular = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE2ODUyODk2MzMsImV4cCI6MTcxNjgyNTkzMCwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsImVtYWlsIjoiZ2lhY29tby5zYW5zb25lQGFvbC5jb20iLCJpZCI6IjMiLCJ1c2VybmFtZSI6InBjaW5ldmVyZGllcyIsInJvbGUiOiJSZWd1bGFyIn0.3NOo014Ro8Bov9Q2nevMdmow2MzuA1FCCo-AUZXPio4";

// giacomo.sansone@aol.com
// pcineverdies

const validAccessTokenAdmin = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE2ODUyODk2MzMsImV4cCI6MTcxNjgyNjAwNCwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsImVtYWlsIjoiZ2lhY29tby5zYW5zb25lQGFvbC5jb20iLCJpZCI6IjMiLCJ1c2VybmFtZSI6InBjaW5ldmVyZGllcyIsInJvbGUiOiJBZG1pbiJ9.SRXR9ESOEEenSaQeVTtklnt65FtaO2T1rJfksrjDKqQ";
const validRefreshTokenAdmin = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE2ODUyODk2MzMsImV4cCI6MTcxNjgyNjAwNCwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsImVtYWlsIjoiZ2lhY29tby5zYW5zb25lQGFvbC5jb20iLCJpZCI6IjMiLCJ1c2VybmFtZSI6InBjaW5ldmVyZGllcyIsInJvbGUiOiJBZG1pbiJ9.SRXR9ESOEEenSaQeVTtklnt65FtaO2T1rJfksrjDKqQ";

// lichen.wang@polito.it
// Wangy

const validAccessTokenUser = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE2ODU0NzE3MDIsImV4cCI6MTcxNzAwNzcwMiwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsInVzZXJuYW1lIjoiV2FuZ3kiLCJlbWFpbCI6ImxpY2hlbi53YW5nQHBvbGl0by5pdCIsInJvbGUiOiJVc2VyIiwicGFzc3dvcmQiOiJwYXNzd29yZCJ9.2ELKzc7TQjAmJtfsrXh7EDbsLxlkiDtzTnlRyMSkwv0";
const validRefreshTokenUser = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE2ODU0NzE3MDIsImV4cCI6MTcxNzAwNzcwMiwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsInVzZXJuYW1lIjoiV2FuZ3kiLCJlbWFpbCI6ImxpY2hlbi53YW5nQHBvbGl0by5pdCIsInJvbGUiOiJVc2VyIiwicGFzc3dvcmQiOiJwYXNzd29yZCJ9.2ELKzc7TQjAmJtfsrXh7EDbsLxlkiDtzTnlRyMSkwv0";

//s318082@studenti.polito.it
//GioGiunta

const validAccessTokenUser2 = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE2ODU4NjA3MzEsImV4cCI6MTcxNzQwMzkwOCwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsImVtYWlsIjoiczMxODA4MkBzdHVkZW50aS5wb2xpdG8uaXQiLCJpZCI6IjQiLCJ1c2VybmFtZSI6Ikdpb0dpdW50YSIsInJvbGUiOiJSZWd1bGFyIn0.Nl3Q2BhhTk_4B2VTrmKObSj8izHww5RKVFNiS0ARCo0";
const validRefreshTokenUser2 = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE2ODU4NjA3MzEsImV4cCI6MTcxNzQwMzkwOCwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsImVtYWlsIjoiczMxODA4MkBzdHVkZW50aS5wb2xpdG8uaXQiLCJpZCI6IjQiLCJ1c2VybmFtZSI6Ikdpb0dpdW50YSIsInJvbGUiOiJSZWd1bGFyIn0.Nl3Q2BhhTk_4B2VTrmKObSj8izHww5RKVFNiS0ARCo0";
beforeAll(async () => {
  const dbName = "testingDatabaseController";
  const url = `${process.env.MONGO_URI}/${dbName}`;

  await mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});

describe("createCategory", () => { 

    beforeEach(async () => {
        await User.deleteMany({});
        await transactions.deleteMany({});
        await categories.deleteMany({});
    });

    test("should return 400 if error in body", async () => {
        const response = await request(app)
            .post("/api/categories")
            .send({})
            .set("Cookie", `accessToken=${validAccessTokenAdmin};refreshToken=${validRefreshTokenAdmin}`);
        expect(response.status).toBe(400);
    });

    test("should return 400 if parameter is void string", async () => {
        const response = await request(app)
            .post("/api/categories")
            .send({type: "", color: "ffff"})
            .set("Cookie", `accessToken=${validAccessTokenAdmin};refreshToken=${validRefreshTokenAdmin}`);
        expect(response.status).toBe(400);
    });

    test("should return 401 if not authorized", async () => {
        const category = {type: "investment", color: "ffff"};

        const response = await request(app)
            .post("/api/categories")
            .send(category)
            .set("Cookie", `accessToken=sss;refreshToken=sss`);

        expect(response.status).toBe(401);
    });

    test("should return 400 if category already exist", async () => {
        const category = {type: "investment", color: "ffff"};
        await categories.create(category);

        const response = await request(app)
            .post("/api/categories")
            .send(category)
            .set("Cookie", `accessToken=${validAccessTokenAdmin};refreshToken=${validRefreshTokenAdmin}`);
        expect(response.status).toBe(400);
    });

    test("should return 200 if I created the category without errors", async () => {
        const category = {type: "investment", color: "ffff"};
        //await categories.create(category);

        const response = await request(app)
            .post("/api/categories")
            .send(category)
            .set("Cookie", `accessToken=${validAccessTokenAdmin};refreshToken=${validRefreshTokenAdmin}`);
        expect(response.status).toBe(200);
    });
})

describe("updateCategory", () => { 

    beforeEach(async () => {
        await User.deleteMany({});
        await transactions.deleteMany({});
        await categories.deleteMany({});
    });

    test('Should retunr 401 if not authorized', async() => {
        const response = await request(app)
            .patch("/api/categories/investment")
            .send({})
            .set("Cookie", `accessToken=sss;refreshToken=sss`);

        expect(response.status).toBe(401);
    });

    test('Should return 400 if category is not found', async() => {
        const category = {type: "investment", color: "ffff"};

        const response = await request(app)
            .patch("/api/categories/crypto")
            .send(category)
            .set("Cookie", `accessToken=${validAccessTokenAdmin};refreshToken=${validRefreshTokenAdmin}`);

        expect(response.status).toBe(400);
    });

    test('should return 400 if category (body type) already exists', async() => {
        const category = {type: "investment", color: "ffff"};
        const catParams = {type: "crypto", color: "aaaa"};
        await categories.create(category);
        await categories.create(catParams);
        const catToSend = {type: "investment", color: "cccc"};

        const response = await request(app)
            .patch("/api/categories/crypto")
            .send(catToSend)
            .set("Cookie", `accessToken=${validAccessTokenAdmin};refreshToken=${validRefreshTokenAdmin}`);

        expect(response.status).toBe(400);
    });

    test('"should return 400 if a parameter is invalid (missing or empty string)', async() => {
        //const category = {type: "investment", color: "ffff"};
        const catParams = {type: "crypto", color: "aaaa"};
        //await categories.create(category);
        await categories.create(catParams);
        const catToSend = {type: ""};

        const response = await request(app)
            .patch("/api/categories/crypto")
            .send(catToSend)
            .set("Cookie", `accessToken=${validAccessTokenAdmin};refreshToken=${validRefreshTokenAdmin}`);

        expect(response.status).toBe(400);
    });

    test('should return 200 if the update is successfull', async() => {
        const catParams = {type: "crypto", color: "aaaa"};
        const transaction = {username: "Wangy", type: "crypto", amount: 50};
        await categories.create(catParams);
        await transactions.create(transaction);
        const catToSend = {type: "investment", color: "cccc"};

        const response = await request(app)
            .patch("/api/categories/crypto")
            .send(catToSend)
            .set("Cookie", `accessToken=${validAccessTokenAdmin};refreshToken=${validRefreshTokenAdmin}`);

        expect(response.status).toBe(200);
    });
})

describe("deleteCategory", () => { 

    beforeEach(async () => {
        await User.deleteMany({});
        await transactions.deleteMany({});
        await categories.deleteMany({});
    });

    test('Should retunr 401 if not authorized', async() => {
        const response = await request(app)
            .delete("/api/categories")
            .send({})
            .set("Cookie", `accessToken=sss;refreshToken=sss`);

        expect(response.status).toBe(401);
    });

    test('Should return 400 if request body does not contain the necessary attributes', async() => {
        const category = {types: []};

        const response = await request(app)
            .delete("/api/categories")
            .send(category)
            .set("Cookie", `accessToken=${validAccessTokenAdmin};refreshToken=${validRefreshTokenAdmin}`);

        expect(response.status).toBe(400);
    });

    test('Should return 400 if parameters contain an empty string', async() => {
        const category = {types: ["", "investment"]};
        const cat1 = {type: "rental", color: "xxxx"};
        const cat2 = {type: "bank", color: "dddd"};
        const cat3 = {type: "benefit", color: "cccc"};
        await categories.create(cat1);
        await categories.create(cat2);
        await categories.create(cat3);

        const response = await request(app)
            .delete("/api/categories")
            .send(category)
            .set("Cookie", `accessToken=${validAccessTokenAdmin};refreshToken=${validRefreshTokenAdmin}`);

        expect(response.status).toBe(400);
    });

    test('Should return 400 if a category (from req body) does not exist', async() => {
        const category = {types: ["investment"]};
        const cat1 = {type: "rental", color: "xxxx"};
        const cat2 = {type: "bank", color: "dddd"};
        const cat3 = {type: "benefit", color: "cccc"};
        await categories.create(cat1);
        await categories.create(cat2);
        await categories.create(cat3);

        const response = await request(app)
            .delete("/api/categories")
            .send(category)
            .set("Cookie", `accessToken=${validAccessTokenAdmin};refreshToken=${validRefreshTokenAdmin}`);

        expect(response.status).toBe(400);
    });

    test('Should return 400 if there is only one category in the db (cannot cancel every category)', async() => {
        const category = {types: ["investment", "depo"]};
        const cat1 = {type: "rental", color: "xxxx"};
        await categories.create(cat1);

        const response = await request(app)
            .delete("/api/categories")
            .send(category)
            .set("Cookie", `accessToken=${validAccessTokenAdmin};refreshToken=${validRefreshTokenAdmin}`);

        expect(response.status).toBe(400);
    });

    test('Should return 200 if everything work fine', async() => {
        const category = {types: ["investment"]};
        const cat1 = {type: "rental", color: "xxxx"};
        const cat2 = {type: "bank", color: "dddd"};
        const cat3 = {type: "investment", color: "cccc"};
        await categories.create(cat1);
        await categories.create(cat2);
        await categories.create(cat3);

        const response = await request(app)
            .delete("/api/categories")
            .send(category)
            .set("Cookie", `accessToken=${validAccessTokenAdmin};refreshToken=${validRefreshTokenAdmin}`);

        expect(response.status).toBe(200);
    });
})

describe("getCategories", () => {
    beforeEach(async  () => {
        await categories.deleteMany();
    })
    test('TEST 1: return 400, Unauthorized', async () => {
        // `accessToken=${validAccessTokenAdmin};refreshToken=${validRefreshTokenAdmin}`
        const response = await request(app)
            .get("/api/categories")
            .set("Cookie", `accessToken=bad_access_token;refreshToken=bad_refresh_token`);
        expect(response.status).toBe(401);
    });

    test('TEST 2: return 200, success', async () => {
        await categories.create({type : "type1", color : "#111111"})
        await categories.create({type : "type2", color : "#222222"})

        const response = await request(app)
            .get("/api/categories")
            .set("Cookie", `accessToken=${validAccessTokenRegular};refreshToken=${validRefreshTokenRegular}`);
        expect(response.body).toStrictEqual({data : [{type : "type1", color : "#111111"}, {type : "type2", color : "#222222"}]})
        expect(response.status).toBe(200);
    });
})

describe("createTransaction", () => { 

    beforeEach(async () => {
        await User.deleteMany({});
        await transactions.deleteMany({});
        await categories.deleteMany({});
    });


    test("Should return 404 if not params.username", async () => {

        const response = await request(app)
            .post("/api/users/:username/transactions")
    
        expect(response.status).toBe(404);

    });

    test("Should return 400 if error in body", async () => {

        const response = await request(app)
            .post("/api/users/pcineverdies/transactions")
            .send({})
    
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
            error : "Body error"
        })

    });

    test("Should return 400 if parameter is void string", async () => {

        const transaction = {username : "", amount : 400, type : "grocery"}

        const response = await request(app)
            .post("/api/users/pcineverdies/transactions")
            .send(transaction)
    
        expect(response.status).toBe(400);

    });

    test("Should return 400 not valid float", async () => {

        const transaction = {username : "pcineverdies", amount : "string", type : "grocery"}

        const response = await request(app)
            .post("/api/users/pcineverdies/transactions")
            .send(transaction)
    
        expect(response.status).toBe(400);

    });
    test("Should return 400 if body and req names are not equal", async () => {

        const transaction = {username : "pcineverdies", amount : 400, type : "grocery"}

        const response = await request(app)
            .post("/api/users/user/transactions")
            .send(transaction)
    
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
            error : "Usernames not equal"
        })

    });
    test("Should return 401 if not authorized", async () => {

        const transaction = {username : "pcineverdies", amount : 400, type : "grocery"}

        const response = await request(app)
            .post("/api/users/pcineverdies/transactions")
            .send(transaction)
    
        expect(response.status).toBe(401);

    });
    test("Should return 400 if user is not valid", async () => {

        const transaction = {username : "pcineverdies", amount : 400, type : "grocery"}

        const response = await request(app)
            .post("/api/users/pcineverdies/transactions")
            .send(transaction)
            .set("Cookie", `accessToken=${validAccessTokenAdmin};refreshToken=${validRefreshTokenAdmin}`)
    
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
            error :  "Username invalid"
        })

    });
    test("Should return 400 if category is not valid", async () => {

        const user = {
            username : "pcineverdies",
            email : "giacomo.sansone@aol.com",
            password : "password"
        }

        await User.create(user)

        const transaction = {username : "pcineverdies", amount : 400, type : "grocery"}

        const response = await request(app)
            .post("/api/users/pcineverdies/transactions")
            .send(transaction)
            .set("Cookie", `accessToken=${validAccessTokenAdmin};refreshToken=${validRefreshTokenAdmin}`)
    
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
            error :  "Category type invalid"
        })

    });
    test("Should return 200 if everything works fine", async () => {

        const category = {
            type : "grocery",
            color : "red"
        }

        const user = {
            username : "pcineverdies",
            email : "giacomo.sansone@aol.com",
            password : "password"
        }

        await User.create(user)
        await categories.create(category)

        const transaction = {username : "pcineverdies", amount : 400, type : "grocery"}

        const response = await request(app)
            .post("/api/users/pcineverdies/transactions")
            .send(transaction)
            .set("Cookie", `accessToken=${validAccessTokenAdmin};refreshToken=${validRefreshTokenAdmin}`)
    
        expect(response.status).toBe(200);

    });
})

describe("getAllTransactions", () => { 
    beforeEach( async () => {
        await transactions.deleteMany();
        await categories.deleteMany();
    })
// `accessToken=${validAccessTokenAdmin};refreshToken=${validRefreshTokenAdmin}`
    test('TEST 1, should return 400', async () => {
        const response = await request(app)
        .get("/api/transactions")
        .set("Cookie", `accessToken=bad_access_token;refreshToken=bad_refresh_token`)

        expect(response.status).toBe(401)
    });

    test('TEST 2, should return 200', async () => {
        const c1 = new categories({type : "type1", color : "#111111"})
        await c1.save();
        const c2 = new categories({type : "type2", color : "#222222"})
        await c2.save();
        const t1 = new transactions({username: "user1", type : "type1", amount : 7});
        await t1.save();

        const response = await request(app)
        .get("/api/transactions")
        .set("Cookie", `accessToken=${validAccessTokenAdmin};refreshToken=${validRefreshTokenAdmin}`)

        expect(response.body).toEqual({data : [{username: t1.username, type: t1.type, amount: t1.amount, date: t1.date.toISOString(), color : c1.color}]})
        expect(response.status).toBe(200)
    });
})

describe("getTransactionsByUser", () => { 
    beforeEach(async () => {
        await User.deleteMany({});
        await transactions.deleteMany({});
        await categories.deleteMany({});
    });

    /*  ------------------------------ Tests for ADMIN ------------------------------ */
    test('should return transactions with call made by Admin and status 200', async() => {
        const user = {username: "Wangy", email: "lichen.wang@polito.it", password: "password"};
        const trs1 = {username: "Wangy", type: "investment", amount: 20};
        const trs2 = {username: "Wangy", type: "depo", amount: 40};
        await User.create(user);
        await transactions.create(trs1);
        await transactions.create(trs2);

        const response = await request(app)
            .get("/api/transactions/users/Wangy")
            .set("Cookie", `accessToken=${validAccessTokenAdmin};refreshToken=${validRefreshTokenAdmin}`);

        expect(response.status).toBe(200);
    });

    test('should return void list transactions if no transactions with call made by Admin and status 200', async() => {
        const user = {username: "Wangy", email: "lichen.wang@polito.it", password: "password"};
        await User.create(user);

        const response = await request(app)
            .get("/api/transactions/users/Wangy")
            .set("Cookie", `accessToken=${validAccessTokenAdmin};refreshToken=${validRefreshTokenAdmin}`);

        expect(response.status).toBe(200);
    });

    test('Should return 401 if not authorized', async() => {
        const user = {username: "Wangy", email: "lichen.wang@polito.it", password: "password"};
        await User.create(user);

        const response = await request(app)
            .get("/api/transactions/users/Wangy")
            .set("Cookie", `accessToken=sss;refreshToken=sss`);

        expect(response.status).toBe(401);
    });

    test('Should return 400 if the user does not exist', async() => {

        const response = await request(app)
            .get("/api/transactions/users/Wangy")
            .set("Cookie", `accessToken=${validAccessTokenAdmin};refreshToken=${validRefreshTokenAdmin}`);

        expect(response.status).toBe(400);
    });

    /*  ------------------------------ Tests for USERS ------------------------------ */
    test('should return transactions with call made by User and status 200', async() => {
        const user = {username: "Wangy", email: "lichen.wang@polito.it", password: "password"};
        const trs1 = {username: "Wangy", type: "investment", amount: 20};
        const trs2 = {username: "Wangy", type: "depo", amount: 40};
        const trs3 = {username: "Alessandro", type: "investment", amount: "25"};
        await User.create(user);
        await transactions.create(trs1);
        await transactions.create(trs2);
        await transactions.create(trs3);

        const response = await request(app)
            .get("/api/users/Wangy/transactions")
            .set("Cookie", `accessToken=${validAccessTokenUser};refreshToken=${validRefreshTokenUser}`);

        expect(response.status).toBe(200);
    });

    test('should return empty array if no transactions are present while User and status 200', async() => {
        const user = {username: "Wangy", email: "lichen.wang@polito.it", password: "password"};
        await User.create(user);

        const response = await request(app)
            .get("/api/users/Wangy/transactions")
            .set("Cookie", `accessToken=${validAccessTokenUser};refreshToken=${validRefreshTokenUser}`);

        expect(response.status).toBe(200);
    });

    test('should return error 401 if authorization fails while User', async() => {
        const response = await request(app)
            .get("/api/users/Wangy/transactions")
            .set("Cookie", `accessToken=sss;refreshToken=sss`);

        expect(response.status).toBe(401);
    });

    test('should return error 400 if the user does not exist', async() => {
        const response = await request(app)
            .get("/api/users/Wangy/transactions")
            .set("Cookie", `accessToken=${validAccessTokenUser};refreshToken=${validRefreshTokenUser}`);

        expect(response.status).toBe(400);
    });

})

describe("getTransactionsByUserByCategory", () => { 
    beforeEach(async () => {
        await User.deleteMany({});
        await transactions.deleteMany({});
        await categories.deleteMany({});
    });

    /*  ------------------------------ Tests for ADMIN ------------------------------ */
    test('should return transactions filtered by user and by category with call made by Admin and status 200', async() => {
        const user = {username: "Wangy", email: "lichen.wang@polito.it", password: "password"};
        const trs1 = {username: "Wangy", type: "investment", amount: 20};
        const trs2 = {username: "Wangy", type: "depo", amount: 40};
        const cat1 = {type: "investment", color: "ffff"};
        const cat2 = {type: "depo", color: "ffff"};
        await User.create(user);
        await transactions.create(trs1);
        await transactions.create(trs2);
        await categories.create(cat1);
        await categories.create(cat2);

        const response = await request(app)
            .get("/api/transactions/users/Wangy/category/investment")
            .set("Cookie", `accessToken=${validAccessTokenAdmin};refreshToken=${validRefreshTokenAdmin}`);

        expect(response.status).toBe(200);
    
    });

    test("should return empty array if user don't have transactions with call made by Admin and status 200", async() => {
        const user = {username: "Wangy", email: "lichen.wang@polito.it", password: "password"};
        const cat1 = {type: "investment", color: "ffff"};
        const cat2 = {type: "depo", color: "ffff"};
        await User.create(user);
        await categories.create(cat1);
        await categories.create(cat2);

        const response = await request(app)
            .get("/api/transactions/users/Wangy/category/investment")
            .set("Cookie", `accessToken=${validAccessTokenAdmin};refreshToken=${validRefreshTokenAdmin}`);

        expect(response.status).toBe(200);
    });

    test('should return error 401 if authorization fails while Admin', async() => {
        const user = {username: "Wangy", email: "lichen.wang@polito.it", password: "password"};
        await User.create(user);
        const response = await request(app)
            .get("/api/transactions/users/Wangy/category/investment")
            .set("Cookie", `accessToken=sss;refreshToken=sss`);

        expect(response.status).toBe(401);
    });

    test("should return error 400 if user don't exist while performing as Admin", async() => {

        const response = await request(app)
            .get("/api/transactions/users/Wangy/category/investment")
            .set("Cookie", `accessToken=${validAccessTokenAdmin};refreshToken=${validRefreshTokenAdmin}`);

        expect(response.status).toBe(400);
    });

    test("should return error 400 if category don't exist while performing as Admin", async() => {
        const user = {username: "Wangy", email: "lichen.wang@polito.it", password: "password"};
        await User.create(user);

        const response = await request(app)
            .get("/api/transactions/users/Wangy/category/investment")
            .set("Cookie", `accessToken=${validAccessTokenAdmin};refreshToken=${validRefreshTokenAdmin}`);

        expect(response.status).toBe(400);
    });

    /*  ------------------------------ Tests for USERS ------------------------------ */
    test('should return transactions filter by user and by category with call made by User and status 200', async() => {
        const user = {username: "Wangy", email: "lichen.wang@polito.it", password: "password"};
        const trs1 = {username: "Wangy", type: "investment", amount: 20};
        const trs2 = {username: "Wangy", type: "depo", amount: 40};
        const cat1 = {type: "investment", color: "ffff"};
        const cat2 = {type: "depo", color: "ffff"};
        await User.create(user);
        await transactions.create(trs1);
        await transactions.create(trs2);
        await categories.create(cat1);
        await categories.create(cat2);

        const response = await request(app)
            .get("/api/users/Wangy/transactions/category/investment")
            .set("Cookie", `accessToken=${validAccessTokenUser};refreshToken=${validRefreshTokenUser}`);

        expect(response.status).toBe(200);
    
    });

    test("should return empty array if user don't have transactions with call made by User and status 200", async() => {
        const user = {username: "Wangy", email: "lichen.wang@polito.it", password: "password"};
        const cat1 = {type: "investment", color: "ffff"};
        const cat2 = {type: "depo", color: "ffff"};
        await User.create(user);
        await categories.create(cat1);
        await categories.create(cat2);

        const response = await request(app)
            .get("/api/users/Wangy/transactions/category/investment")
            .set("Cookie", `accessToken=${validAccessTokenUser};refreshToken=${validRefreshTokenUser}`);

        expect(response.status).toBe(200);
    
    });

    test('should return error 401 if authorization fails while User', async() => {
        const user = {username: "Wangy", email: "lichen.wang@polito.it", password: "password"};
        await User.create(user);

        const response = await request(app)
            .get("/api/users/Wangy/transactions/category/investment")
            .set("Cookie", `accessToken=sss;refreshToken=sss`);

        expect(response.status).toBe(401);
    
    });

    test("should return error 400 if category don't exist while performing as User", async() => {
        const user = {username: "Wangy", email: "lichen.wang@polito.it", password: "password"};
        await User.create(user);

        const response = await request(app)
            .get("/api/users/Wangy/transactions/category/investment")
            .set("Cookie", `accessToken=${validAccessTokenUser};refreshToken=${validRefreshTokenUser}`);

        expect(response.status).toBe(400);
    });

    test("should return error 400 if user don't exist while performing as User", async() => {

        const response = await request(app)
            .get("/api/users/Wangy/transactions/category/investment")
            .set("Cookie", `accessToken=${validAccessTokenUser};refreshToken=${validRefreshTokenUser}`);

        expect(response.status).toBe(400);
    });
})

describe("getTransactionsByGroup", () => { 
    beforeAll(async () =>{
        await Group.deleteMany();
        await User.deleteMany();
        await categories.deleteMany();
        const u1 = new User({username: "pcineverdies", email: "giacomo.sansone@aol.com", password: "hashed1"});
        await u1.save();
        const u2 = new User({username: "user2", email: "user2@example.com", password: "hashed2"});
        await u2.save();
        await Group.create({name : "test_group", members : [{email : u1.email, user: u1._id}, {email : u2.email, user: u2._id}]});

        const c1 = new categories({type : "type1", color : "#111111"})
        await c1.save();
        const c2 = new categories({type : "type2", color : "#222222"})
        await c2.save();
        
    })
    beforeEach(async () => {
        await transactions.deleteMany();
    })
    test('TEST 1: return 400, Group does not exist ', async () => {
       const response = await request(app)
       .get("/api/groups/bad_test_group/transactions")
       .set("Cookie", `accessToken=bad_access_token;refreshToken=bad_refresh_token`);

       expect(response.body).toStrictEqual({error : "Group not found"});
       expect(response.status).toBe(400);
    });

    test('TEST 2:  return 401, failed auth user', async () => {
        const response = await request(app)
        .get("/api/groups/test_group/transactions")
        .set("Cookie", `accessToken=bad_access_token;refreshToken=bad_refresh_token`);
   
        expect(response.status).toBe(401);
     });
     test('TEST 3: return 401, failed auth admin', async () => {
        
        const response = await request(app)
        .get("/api/transactions/groups/test_group")
        .set("Cookie", `accessToken=bad_access_token;refreshToken=bad_refresh_token`);
   
        expect(response.status).toBe(401);
     });

     test('TEST 4: return 200 (User)', async () => {
        const t1 = new transactions({username: "pcineverdies", type : "type1", amount : 1});
        await t1.save();
        const t2 = new transactions({username: "user2", type : "type2", amount : 2});
        await t2.save();
        await transactions.create({username: "user3", type : "type1", amount : 3});
 
        const response = await request(app)
        .get("/api/groups/test_group/transactions")
        .set("Cookie", `accessToken=${validAccessTokenRegular};refreshToken=${validAccessTokenRegular}`);
   
        expect(response.body).toStrictEqual({data : [
            {username: t1.username, type: t1.type, amount: t1.amount, date: t1.date.toISOString(), color: "#111111"},
            {username: t2.username, type: t2.type, amount: t2.amount, date: t2.date.toISOString(), color: "#222222"},
        ]})
        expect(response.status).toBe(200);
     });

     test('TEST 5: return 200 (admin)', async () => {
        const t1 = new transactions({username: "pcineverdies", type : "type1", amount : 1});
        await t1.save();
        const t2 = new transactions({username: "user2", type : "type2", amount : 2});
        await t2.save();
        await transactions.create({username: "user3", type : "type1", amount : 3});
 
        const response = await request(app)
        .get("/api/transactions/groups/test_group")
        .set("Cookie", `accessToken=${validAccessTokenAdmin};refreshToken=${validAccessTokenAdmin}`);
   
        expect(response.body).toStrictEqual({data : [
            {username: t1.username, type: t1.type, amount: t1.amount, date: t1.date.toISOString(), color: "#111111"},
            {username: t2.username, type: t2.type, amount: t2.amount, date: t2.date.toISOString(), color: "#222222"},
        ]})
        expect(response.status).toBe(200);
     });
})

describe("getTransactionsByGroupByCategory", () => { 
    beforeAll(async () =>{
        await Group.deleteMany();
        await User.deleteMany();
        await categories.deleteMany();
        const u1 = new User({username: "pcineverdies", email: "giacomo.sansone@aol.com", password: "hashed1"});
        await u1.save();
        const u2 = new User({username: "user2", email: "user2@example.com", password: "hashed2"});
        await u2.save();
        await Group.create({name : "test_group", members : [{email : u1.email, user: u1._id}, {email : u2.email, user: u2._id}]});

        const c1 = new categories({type : "type1", color : "#111111"})
        await c1.save();
        const c2 = new categories({type : "type2", color : "#222222"})
        await c2.save();
        
    })
    beforeEach(async () => {
        await transactions.deleteMany();
    })
    test('TEST 1: return 400, Group does not exist ', async () => {
        const response = await request(app)
        .get("/api/groups/bad_test_group/transactions/category/type3")
        .set("Cookie", `accessToken=bad_access_token;refreshToken=bad_refresh_token`);
 
        expect(response.body).toStrictEqual({error : "Group not found"});
        expect(response.status).toBe(400);
     });
 
     test('TEST 2:  return 401, failed auth user', async () => {
         const response = await request(app)
         .get("/api/groups/test_group/transactions/category/type3")
         .set("Cookie", `accessToken=bad_access_token;refreshToken=bad_refresh_token`);
    
         expect(response.status).toBe(401);
      });
      test('TEST 3: return 401, failed auth admin', async () => {
         
         const response = await request(app)
         .get("/api/transactions/groups/test_group/category/type3")
         .set("Cookie", `accessToken=bad_access_token;refreshToken=bad_refresh_token`);
    
         expect(response.status).toBe(401);
      });
      
      test('TEST 4: return 400. category not found', async () => {
        const response = await request(app)
        .get("/api/groups/test_group/transactions/category/type3")
        .set("Cookie", `accessToken=${validAccessTokenRegular};refreshToken=${validAccessTokenRegular}`);
   
        expect(response.body).toStrictEqual({error : "Category not found"})
        expect(response.status).toBe(400);
     });
      test('TEST 5: return 200 (User)', async () => {
         const t1 = new transactions({username: "pcineverdies", type : "type1", amount : 1});
         await t1.save();
         const t2 = new transactions({username: "user2", type : "type2", amount : 2});
         await t2.save();
         const t3 = new transactions({username: "user2", type : "type1", amount : 22});
         await t3.save();
         const response = await request(app)
         .get("/api/groups/test_group/transactions/category/type1")
         .set("Cookie", `accessToken=${validAccessTokenRegular};refreshToken=${validAccessTokenRegular}`);
    
         expect(response.body).toStrictEqual({data : [
             {username: t1.username, type: t1.type, amount: t1.amount, date: t1.date.toISOString(), color: "#111111"},
             {username: t3.username, type: t3.type, amount: t3.amount, date: t3.date.toISOString(), color: "#111111"},
         ]})
         expect(response.status).toBe(200);
      });
 
      test('TEST 6: return 200 (admin)', async () => {
        const t1 = new transactions({username: "pcineverdies", type : "type1", amount : 1});
        await t1.save();
        const t2 = new transactions({username: "user2", type : "type2", amount : 2});
        await t2.save();
        const t3 = new transactions({username: "user2", type : "type1", amount : 22});
        await t3.save();
  
         const response = await request(app)
         .get("/api/transactions/groups/test_group/category/type1")
         .set("Cookie", `accessToken=${validAccessTokenAdmin};refreshToken=${validAccessTokenAdmin}`);
    
         expect(response.body).toStrictEqual({data : [
            {username: t1.username, type: t1.type, amount: t1.amount, date: t1.date.toISOString(), color: "#111111"},
            {username: t3.username, type: t3.type, amount: t3.amount, date: t3.date.toISOString(), color: "#111111"},
        ]})
         expect(response.status).toBe(200);
      });
})

describe("deleteTransaction", () => { 
    beforeEach(async () => {
        await transactions.deleteMany();
        await User.deleteMany();
    });

    test('should delete the transaction and return a success response', async () => {
        const t1 = new transactions({username: "pcineverdies", type : "type1", amount : 100});
        await t1.save();

        const user1 = {
            username : "pcineverdies",
            email : "s318082@studenti.polito.it",
            password : "SoftEng23",
            role : "Regular"
        };
        await User.create(user1);

        const response = await request(app)
            .delete(`/api/users/${t1.username}/transactions`)
            .set("Cookie", `accessToken=${validAccessTokenRegular};refreshToken=${validAccessTokenRegular}`)
            .send({_id : t1._id})

        expect(response.status).toBe(200);
        expect(response.body).toStrictEqual({
            data : {message: "Transaction has been deleted"}
        });
    });

    test('should return error 401 if authorization fails while performing as User', async () => {
        const t1 = new transactions({username: "pcineverdies", type : "type1", amount : 100});
        await t1.save();

        const user1 = {
            username : "pcineverdies",
            email : "s318082@studenti.polito.it",
            password : "SoftEng23",
            role : "Regular"
        };
        await User.create(user1);

        const response = await request(app)
            .delete(`/api/users/${t1.username}/transactions`)
            .set("Cookie", `accessToken=bad_access_token;refreshToken=bad_refresh_token`)
            .send({_id : t1._id})

        expect(response.status).toBe(401);

    });

    test('should return error 400 if the transaction does not exist', async () => {
        const t1 = new transactions({username: "pcineverdies", type : "type1", amount : 100});
        await t1.save();
        const tmp = new transactions({username: "tmp", type : "tmp", amount : 0});

        const user1 = {
            username : "pcineverdies",
            email : "s318082@studenti.polito.it",
            password : "SoftEng23",
            role : "Regular"
        };
        await User.create(user1);

        const response = await request(app)
            .delete(`/api/users/${t1.username}/transactions`)
            .set("Cookie", `accessToken=${validAccessTokenRegular};refreshToken=${validAccessTokenRegular}`)
            .send({_id : tmp._id})

        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
            error : `${tmp._id} does not correspond to any transaction`
        });
    });

    test('should return 400 if the user does not exist', async () => {
        const t1 = new transactions({username: "pcineverdies", type : "type1", amount : 100});
        await t1.save();

        const response = await request(app)
            .delete(`/api/users/${t1.username}/transactions`)
            .set("Cookie", `accessToken=${validAccessTokenRegular};refreshToken=${validAccessTokenRegular}`)
            .send({_id : t1._id})

        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
            error : "User of the transaction does not exist"
        });
    });

    test('should return 500 if the transaction cannot be deleted', async () => {
        jest.spyOn(User, 'findOne').mockImplementation(() => {
            throw new Error('Some error');
        });
        
        const t1 = new transactions({username: "pcineverdies", type : "type1", amount : 100});
        await t1.save();

        const user1 = {
            username : "pcineverdies",
            email : "s318082@studenti.polito.it",
            password : "SoftEng23",
            role : "Regular"
        };
        await User.create(user1);

        const response = await request(app)
            .delete(`/api/users/${t1.username}/transactions`)
            .set("Cookie", `accessToken=${validAccessTokenRegular};refreshToken=${validAccessTokenRegular}`)
            .send({_id : t1._id})

        expect(response.status).toBe(500);
        expect(response.body).toStrictEqual({
            error : "Some error"
        });
    });

    test('shoul return error 401 if authorization fails while performing as Admin', async () => {
        const t1 = new transactions({username: "pcineverdies", type : "type1", amount : 100});
        await t1.save();

        const user1 = {
            username : "pcineverdies",
            email : "s318082@studenti.polito.it",
            password : "SoftEng23",
            role : "Admin"
        };
        await User.create(user1);

        const response = await request(app)
            .delete(`/api/users/${t1.username}/transactions`)
            .set("Cookie", `accessToken=bad_access_token;refreshToken=bad_refresh_token`)
            .send({_id : t1._id})

        expect(response.status).toBe(401);
    });

    test("should if transactionId is not defined", async () => {
        const response = await request(app)
        .delete(`/api/users/pcineverdies/transactions`)
        .set("Cookie", `accessToken=${validAccessTokenRegular};refreshToken=${validAccessTokenRegular}`)
        .send({})

        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
            error : "Request body does not contain all the necessary attributes"
        });
    });

    test("should return 400 id the transactionId is an empty string", async () => {
        const response = await request(app)
        .delete(`/api/users/pcineverdies/transactions`)
        .set("Cookie", `accessToken=${validAccessTokenRegular};refreshToken=${validAccessTokenRegular}`)
        .send({_id : ""})

        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
            error : "Transaction ID is an empty string"
        });
    });

})

describe("deleteTransactions", () => { 
    beforeEach(() => {
        transactions.deleteMany();
    })
    test('TEST 1: should return 401, Unauthorized', async () => {
        const response = await request(app)
        .delete("/api/transactions")
        .send({_ids : []})
        .set("Cookie", `accessToken=bad_access_token;refreshToken=bad_refresh_token`)

        expect(response.status).toBe(401);
    });

    test('TEST 2: should return 400, Body errors', async () => {
        const response = await request(app)
        .delete("/api/transactions")
        .send({_ids : []})
        .set("Cookie", `accessToken=${validAccessTokenAdmin};refreshToken=${validRefreshTokenAdmin}`)

        expect(response.body).toStrictEqual({error : "Input is not valid"})
        expect(response.status).toBe(400);
    });

    test('TEST 3: should return 400, id is a void string', async () => {
        const response = await request(app)
        .delete("/api/transactions")
        .send({_ids : ["", ""]})
        .set("Cookie", `accessToken=${validAccessTokenAdmin};refreshToken=${validRefreshTokenAdmin}`)

        expect(response.body).toStrictEqual({error : "empty string passed"})
        expect(response.status).toBe(400);
    });

    test('TEST 4: should return 400, ids not in the DB', async () => {
        const t1 = new transactions({username: "user1", type : "type1", amount : 7});
        await t1.save();

        const tmp = new transactions({username: "tmp", type : "tmp", amount : 0});
        const response = await request(app)
        .delete("/api/transactions")
        .send({ "_ids" : [tmp._id]})
        .set("Cookie", `accessToken=${validAccessTokenAdmin};refreshToken=${validRefreshTokenAdmin}`)

        expect(response.body).toStrictEqual({error : `${tmp._id} does not correspond to any transaction`})
        expect(response.status).toBe(400);
    });

    test('TEST 5: should return 200, ids not in the DB', async () => {
        const t1 = new transactions({username: "user1", type : "type1", amount : 7});
        await t1.save();

        const response = await request(app)
        .delete("/api/transactions")
        .send({ "_ids" : [t1._id]})
        .set("Cookie", `accessToken=${validAccessTokenAdmin};refreshToken=${validRefreshTokenAdmin}`)

        expect(response.body).toStrictEqual({data: { message: "Transcations Deleted" }})
        expect(response.status).toBe(200);
    });


})
