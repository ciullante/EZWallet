import request from 'supertest';
import { app } from '../app';
import { User } from '../models/User.js';
import jwt from 'jsonwebtoken';
const bcrypt = require("bcryptjs")
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

//s318082@studenti.polito.it
//GioGiunta

const validAccessTokenUser2 = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJFWldBTExFVCIsImlhdCI6MTY4NTcyMDY4MywiZXhwIjoxNzE3MjU2NjgzLCJhdWQiOiJtb25nb2RiOi8vMTI3LjAuMC4xOjI3MDE3Iiwic3ViIjoiR2lvR2l1bnRhIiwidXNlcm5hbWUiOiJHaW9HaXVudGEiLCJlbWFpbCI6InMzMTgwODJAc3R1ZGVudGkucG9saXRvLml0IiwicGFzc3dvcmQiOiJTb2Z0RW5nMjMiLCJyb2xlIjoiVXNlciJ9.w-TWG1B_ViNw3GEex9_QhBns9fRJ6pCc-IPz00tLObU";
const validRefreshTokenUser2 = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJFWldBTExFVCIsImlhdCI6MTY4NTcyMDY4MywiZXhwIjoxNzE3MjU2NjgzLCJhdWQiOiJtb25nb2RiOi8vMTI3LjAuMC4xOjI3MDE3Iiwic3ViIjoiR2lvR2l1bnRhIiwidXNlcm5hbWUiOiJHaW9HaXVudGEiLCJlbWFpbCI6InMzMTgwODJAc3R1ZGVudGkucG9saXRvLml0IiwicGFzc3dvcmQiOiJTb2Z0RW5nMjMiLCJyb2xlIjoiVXNlciJ9.w-TWG1B_ViNw3GEex9_QhBns9fRJ6pCc-IPz00tLObU";

beforeAll(async () => {
  const dbName = "testingDatabaseAuth";
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

describe('register', () => {
    beforeEach(async () => {
        await User.deleteMany({});
    });

    test('Should return 400 if the email has an incorrect form', async() => {
        const newUser = {username: "Wangy", email: "lichen.wang@#@§*£$", password: "password"};

        const response = await request(app)
            .post("/api/register")
            .send(newUser)

        expect(response.status).toBe(400);
    });

    test('Should return 400 if the user is already registered', async() => {
        const newUser = {username: "Wangy", email: "lichen.wang@polito.it", password: "password"};
        const existingUser = {username: "Wangy", email: "lichen.wang@polito.it", password: "password"};
        await User.create(existingUser);

        const response = await request(app)
            .post("/api/register")
            .send(newUser)

        expect(response.status).toBe(400);
    });

    test('Should return 400 if a parameter (body) is missing', async() => {
        const newUser = {username: "", email: "lichen.wang@polito.it"};

        const response = await request(app)
            .post("/api/register")
            .send(newUser)

        expect(response.status).toBe(400);
    });

    test('Should return 200 if everything work fine', async() => {
        const newUser = {username: "Wangy", email: "lichen.wang@polito.it", password: "password"};

        const response = await request(app)
            .post("/api/register")
            .send(newUser)

        expect(response.status).toBe(200);
    });

});

describe("registerAdmin", () => { 
    beforeEach( async () => {
        await User.deleteMany();
    })
    test('TEST 1: should return 400, ', async () => {
        
        const response = await request(app)
        .post("/api/admin")
        .send({username: "admin", email : "admin@example.com"})
    expect(response.body).toStrictEqual({error : "Body error"});
    expect(response.status).toBe(400);
    });

    test('TEST 2: should return 400, Invalid mail', async () => {
        
        const response = await request(app)
        .post("/api/admin")
        .send({username: "admin", email : "admin#example.com", password: "secure"})
    expect(response.body).toStrictEqual({error : "Format of email is not valid"});
    expect(response.status).toBe(400);
    });

    test('TEST 3: should return 400, username or mail already in DB', async () => {
        await User.create({username: "admin", email : "user@example.com", password : "secure"})

        const response = await request(app)
        .post("/api/admin")
        .send({username: "admin", email : "admin@example.com", password: "secure"})
    expect(response.body).toStrictEqual({error : "You are already registered"});
    expect(response.status).toBe(400);
    });

    test('TEST 4: should return 200, success', async () => {
        
        const response = await request(app)
        .post("/api/admin")
        .send({username: "admin", email : "admin@example.com", password: "secure"})
    expect(response.body).toStrictEqual({data: { message: "User registered successfully"}});
    expect(response.status).toBe(200);
    });
})

describe('login', () => { 

    beforeEach(async () => {
        await User.deleteMany({});
    });

    test("Should return 400 if user does not exist", async () => {

        const response = await request(app)
            .post("/api/login")
            .send({
                email : "giacomo.sansone@aol.com",
                password : "password"
            })
        
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
            error : "user not found, please register"
        });

    });
    test("Should return 401 if user already logged", async () => {

        const user1 = {
            username : "pcineverdies",
            email : "giacomo.sansone@aol.com",
            password: "$2a$12$hS5CkkS.dsWZjOja/e2ph.dY4AoK87HO9NiezQ5SiK9kBxGGWc8la"
        }

        await User.create(user1);

        const response = await request(app)
            .post("/api/login")
            .set("Cookie", `accessToken=${validAccessTokenAdmin};refreshToken=${validRefreshTokenAdmin}`)
            .send({
                email : "giacomo.sansone@aol.com",
                password : "password"
            })
        
        expect(response.status).toBe(401);

    });
    test("Should return 400 if body empty", async () => {

        const user1 = {
            username : "pcineverdies",
            email : "giacomo.sansone@aol.com",
            password: "$2a$12$hS5CkkS.dsWZjOja/e2ph.dY4AoK87HO9NiezQ5SiK9kBxGGWc8la"
        }

        await User.create(user1);

        const response = await request(app)
            .post("/api/login")
            .send({})
        
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
            error : "Body error"
        })


    });
    test("Should return 400 email is not valid", async () => {

        const user1 = {
            username : "pcineverdies",
            email : "giacomo.sansone@aol.com",
            password: "$2a$12$hS5CkkS.dsWZjOja/e2ph.dY4AoK87HO9NiezQ5SiK9kBxGGWc8la"
        }

        await User.create(user1);

        const response = await request(app)
            .post("/api/login")
            .set("Cookie", `accessToken=${validAccessTokenAdmin};refreshToken=${validRefreshTokenAdmin}`)
            .send({
                email : "email",
                password : "password"
            })
        
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
            error : "Not a valid formatted email"
        })

    });
    test("Should return 400 if password is not correct", async () => {

        const user1 = {
            username : "pcineverdies",
            email : "giacomo.sansone@aol.com",
            password: "$2a$12$hS5CkkS.dsWZjOja/e2ph.dY4AoK87HO9NiezQ5SiK9kBxGGWc8la"
        }

        await User.create(user1);

        const response = await request(app)
            .post("/api/login")
            .send({
                email : "giacomo.sansone@aol.com",
                password : "pass"
            })
        
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
            error : "wrong credentials"
        })
        
    });
    test("Should return 200 if login is correct", async () => {

        const user1 = {
            username : "pcineverdies",
            email : "giacomo.sansone@aol.com",
            password: "$2a$12$hS5CkkS.dsWZjOja/e2ph.dY4AoK87HO9NiezQ5SiK9kBxGGWc8la"
        }

        await User.create(user1);

        const response = await request(app)
            .post("/api/login")
            .send({
                email : "giacomo.sansone@aol.com",
                password : "password"
            })
        
        expect(response.status).toBe(200);

    });
});

describe('logout', () => { 
    beforeEach(async () => {
        await User.deleteMany({});
    });
    test("Should return 200 if user is logged out", async () => {
        const user = {
            username : "GioGiunta",
            email : "s318082@studenti.polito.it",
            password: "$2a$12$hS5CkkS.dsWZjOja/e2ph.dY4AoK87HO9NiezQ5SiK9kBxGGWc8la",
            refreshToken: `${validRefreshTokenUser2}`
        }

        await User.create(user);
        const response = await request(app)
            .get("/api/logout")
            .set("Cookie", `accessToken=${validAccessTokenUser2};refreshToken=${validRefreshTokenUser2}`)
        
        expect(response.status).toBe(200);
        expect(response.body).toStrictEqual({
            data : {
                message : "User logged out"
            }
        })
    
    });

    test("Should return 400 if refreshToken does not exist", async () => {
        const user = {
            username : "GioGiunta",
            email : "s318082@studenti.polito.it",
            password: "$2a$12$hS5CkkS.dsWZjOja/e2ph.dY4AoK87HO9NiezQ5SiK9kBxGGWc8la",
            refreshToken: `${validRefreshTokenUser2}`
        }

        await User.create(user);
        const response = await request(app)
            .get("/api/logout")
            .set("Cookie", `accessToken=${validAccessTokenUser2};`)

        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
            error : "RefreshToken does not exist"
        });
    });

    test("Should return 400 if user does not exist", async () => {
        const response = await request(app)
            .get("/api/logout")
            .set("Cookie", `accessToken=${validAccessTokenUser2};refreshToken=${validRefreshTokenUser2}`)

        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
            error : "User does not exist"
        });
    });

    test("Should return 500 if error", async () => {
        jest.spyOn(User, 'findOne').mockImplementation(() => {
            throw new Error('Some error');
        });
        
        const user = {
            username : "GioGiunta",
            email : "s318082@studenti.polito.it",
            password: "$2a$12$hS5CkkS.dsWZjOja/e2ph.dY4AoK87HO9NiezQ5SiK9kBxGGWc8la",
            refreshToken: `${validRefreshTokenUser2}`
        }

        await User.create(user);
        const response = await request(app)
            .get("/api/logout")
            .set("Cookie", `accessToken=${validAccessTokenUser2};refreshToken=${validRefreshTokenUser2}`)

        expect(response.status).toBe(500);
        expect(response.body).toStrictEqual({
            error : "Some error"
        });
    });
});
