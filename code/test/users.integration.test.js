import request from 'supertest';
import { app } from '../app';
import { User, Group } from '../models/User.js';
import { transactions, categories } from '../models/model';
import mongoose, { Model } from 'mongoose';
import dotenv from 'dotenv';

/**
 * Necessary setup in order to create a new database for testing purposes before starting the execution of test cases.
 * Each test suite has its own database in order to avoid different tests accessing the same database at the same time and expecting different data.
 */
dotenv.config();
beforeAll(async () => {
  const dbName = "testingDatabaseUsers";
  const url = `${process.env.MONGO_URI}/${dbName}`;

  await mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

});

// giacomo.sansone@aol.com
// pcineverdies

const validAccessTokenRegular = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE2ODUyODk2MzMsImV4cCI6MTcxNjgyNTkzMCwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsImVtYWlsIjoiZ2lhY29tby5zYW5zb25lQGFvbC5jb20iLCJpZCI6IjMiLCJ1c2VybmFtZSI6InBjaW5ldmVyZGllcyIsInJvbGUiOiJSZWd1bGFyIn0.3NOo014Ro8Bov9Q2nevMdmow2MzuA1FCCo-AUZXPio4";
const validRefreshTokenRegular = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE2ODUyODk2MzMsImV4cCI6MTcxNjgyNTkzMCwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsImVtYWlsIjoiZ2lhY29tby5zYW5zb25lQGFvbC5jb20iLCJpZCI6IjMiLCJ1c2VybmFtZSI6InBjaW5ldmVyZGllcyIsInJvbGUiOiJSZWd1bGFyIn0.3NOo014Ro8Bov9Q2nevMdmow2MzuA1FCCo-AUZXPio4";

// giacomo.sansone@aol.com
// pcineverdies

const validAccessTokenAdmin = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE2ODUyODk2MzMsImV4cCI6MTcxNjgyNjAwNCwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsImVtYWlsIjoiZ2lhY29tby5zYW5zb25lQGFvbC5jb20iLCJpZCI6IjMiLCJ1c2VybmFtZSI6InBjaW5ldmVyZGllcyIsInJvbGUiOiJBZG1pbiJ9.SRXR9ESOEEenSaQeVTtklnt65FtaO2T1rJfksrjDKqQ";
const validRefreshTokenAdmin = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE2ODUyODk2MzMsImV4cCI6MTcxNjgyNjAwNCwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsImVtYWlsIjoiZ2lhY29tby5zYW5zb25lQGFvbC5jb20iLCJpZCI6IjMiLCJ1c2VybmFtZSI6InBjaW5ldmVyZGllcyIsInJvbGUiOiJBZG1pbiJ9.SRXR9ESOEEenSaQeVTtklnt65FtaO2T1rJfksrjDKqQ";

/**
 * After all test cases have been executed the database is deleted.
 * This is done so that subsequent executions of the test suite start with an empty database.
 */
afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});

describe("getUsers",() => {
  /**
   * Database is cleared before each test case, in order to allow insertion of data tailored for each specific test case.
   */
  beforeEach(async () => {
    await User.deleteMany({});
    await transactions.deleteMany({});
    await categories.deleteMany({});
  });

  test("should return 401 if not authorized", async () => {

    const response = await request(app)
        .get("/api/users")
        .set("Cookie", `accessToken=sss;refreshToken=sss`);

    expect(response.status).toBe(401);

  });

  test("should return 200 if no errors occur", async () => {

    const user1 = {
        username : "pcineverdies",
        email : "giacomo.sansone@aol.com",
        password: "p1",
        role: "User"
    }

    const user2 = {
        username: "wangy",
        email: "lichen.wang@polito.it",
        password: "p2",
        role: "User"
    }

    await User.create(user1);
    await User.create(user2);

    const response = await request(app)
        .get("/api/users")
        .set("Cookie", `accessToken=${validAccessTokenAdmin};refreshToken=${validRefreshTokenAdmin}`);

    expect(response.status).toBe(200);

  });

})

describe("getUser", () => {

  beforeEach(async () => {
    await User.deleteMany({})
  });

  test("should return 404 if not params", async () => {

    const response = await request(app)
        .get("/api/users/:username")

    expect(response.status).toBe(404);

  });

  test("should return 401 if not authorized", async () => {

    const response = await request(app)
        .get("/api/users/pcineverdies")
        .set("Cookie", `accessToken=sss;refreshToken=sss`)

    expect(response.status).toBe(401);

  });
  test("should return 401 if authorized as user for different user", async () => {

    const response = await request(app)
        .get("/api/users/user")
        .set("Cookie", `accessToken=${validAccessTokenRegular};refreshToken=${validRefreshTokenRegular}`)

    expect(response.status).toBe(401);

  });
  test("should return 400 if user does not exist", async () => {

    const response = await request(app)
        .get("/api/users/pcineverdies")
        .set("Cookie", `accessToken=${validAccessTokenAdmin};refreshToken=${validRefreshTokenAdmin}`)

    expect(response.status).toBe(400);


  });
  test("should return 200 if user exists", async () => {
    const user1 = {
        username : "pcineverdies",
        email : "giacomo.sansone@aol.com",
        password : "pass"
    };

    await User.create(user1);

    const response = await request(app)
        .get("/api/users/pcineverdies")
        .set("Cookie", `accessToken=${validAccessTokenAdmin};refreshToken=${validRefreshTokenAdmin}`)

    expect(response.status).toBe(200);
    expect(response.body).toStrictEqual({
        data : {
            username : user1.username,
            email : user1.email,
            role : "Regular"
        }
    })

  });

})

describe("createGroup", () => { 
    beforeAll(async () =>{
        await User.deleteMany();
        const u1 = new User({username: "pcineverdies", email: "giacomo.sansone@aol.com", password: "hashed1",
         refreshToken : `${validRefreshTokenRegular}`});
        await u1.save();
        const u2 = new User({username: "user2", email: "user2@example.com", password: "hashed2"});
        await u2.save();
    })
    
    beforeEach(async () => {
        await Group.deleteMany();
    })
    test("TEST 1: return 401, Unauthorized", async () => {
        const response = await request(app)
        .post("/api/groups")
        .send({})
        .set("Cookie", `accessToken=bad_access_token;refreshToken=bad_refresh_token`)

        expect(response.status).toBe(401)
    })

    test("TEST 2: return 400, You're already in a group", async () => {
        const u1 = await User.findOne({username : "pcineverdies"});
        await Group.create({name : "test_group", members : [{email : u1.email, user: u1._id}]});

        const response = await request(app)
        .post("/api/groups")
        .set("Cookie", `accessToken=${validAccessTokenRegular};refreshToken=${validRefreshTokenRegular}`)

        expect(response.body).toStrictEqual({error : "You are already in a group"})
        expect(response.status).toBe(400)
    })

    test("TEST 3: return 400, Input not valid", async () => {
        const response = await request(app)
        .post("/api/groups")
        .send({name : "test_group", memberEmails : []})
        .set("Cookie", `accessToken=${validAccessTokenRegular};refreshToken=${validRefreshTokenRegular}`)

        expect(response.body).toStrictEqual({error : "Input not valid"})
        expect(response.status).toBe(400)
    })

    test("TEST 4: return 400, Group already exists", async () => {
        await Group.create({name : "test_group", members : []});
        const response = await request(app)
        .post("/api/groups")
        .send({name : "test_group", memberEmails : ["user2@example.com"]})
        .set("Cookie", `accessToken=${validAccessTokenRegular};refreshToken=${validRefreshTokenRegular}`)

        expect(response.body).toStrictEqual({error : "Group with name test_group already exists!"})
        expect(response.status).toBe(400)
    })

    test("TEST 5: return 400, Group already exists", async () => {

        const response = await request(app)
        .post("/api/groups")
        .send({name : "test_group", memberEmails : ["user2#example.com"]})
        .set("Cookie", `accessToken=${validAccessTokenRegular};refreshToken=${validRefreshTokenRegular}`)

        expect(response.body).toStrictEqual({error : "Format of email is not valid"})
        expect(response.status).toBe(400)
    })

    test("TEST 6: return 400, Group already exists", async () => {
        const u2 = await User.findOne({username : "user2"});
        await Group.create({name : "another_group", members : [{email :"user2@example.com", user: u2._id}]});
        const response = await request(app)
        .post("/api/groups")
        .send({name : "test_group", memberEmails : ["user2@example.com", "unfound@example.com"]})
        .set("Cookie", `accessToken=${validAccessTokenRegular};refreshToken=${validRefreshTokenRegular}`)

        expect(response.body).toStrictEqual({error : "Members of the group are not valid"})
        expect(response.status).toBe(400)
    })

    test("TEST 7: return 200, success", async () => {

        const response = await request(app)
        .post("/api/groups")
        .send({name : "test_group", memberEmails : ["user2@example.com", "unfound@example.com"]})
        .set("Cookie", `accessToken=${validAccessTokenRegular};refreshToken=${validRefreshTokenRegular}`)

        expect(response.body).toStrictEqual({data : {
            membersNotFound: [{email : "unfound@example.com"}],
            alreadyInGroup : [],
            group : {
                name : "test_group",
                members : [{email: "user2@example.com"}, {email: "giacomo.sansone@aol.com"}]
            }
        }})
        expect(response.status).toBe(200)
    })


})

describe("getGroups",  () => {

  beforeEach(async () => {
    await User.deleteMany({});
    await Group.deleteMany({});
  });

  test("Should return empty list if there is no group", async () => {

    try{
        const group1 = {
            name : "g1",
            members : [
                {email : "a@aol.com", id : "1"}, {email : "b@aol.com", id :"2"}
            ]
        };
        const group2 = {
            name : "g2",
            members : [
                {email : "c@aol.com", id : "3"}, {email : "d@aol.com", id :"4"}
            ]
        }

        await Group.create(group1);
        await Group.create(group2);

        const response = await request(app)
            .get("/api/groups")
            .set("Cookie", `accessToken=${validAccessTokenAdmin};refreshToken=${validRefreshTokenAdmin}`)

        expect(response.status).toBe(200);
        expect(response.body).toStrictEqual({
            data : [
                {name : group1.name, members : group1.members.map((e) => ({email : e.email}))},
                {name : group2.name, members : group2.members.map((e) => ({email : e.email}))}
            ],
        });
    }
    catch(err){
        throw err
    }

  });

  test("Should return empty list if there is no group", async () => {
    try{

        const response = await request(app)
            .get("/api/groups")
            .set("Cookie", `accessToken=${validAccessTokenAdmin};refreshToken=${validRefreshTokenAdmin}`)

        expect(response.status).toBe(200);
        expect(response.body).toStrictEqual({
            data : []
        });
    }
    catch(err){
        throw err
    }

  });

  test("Should return error 401 if not authorized", async () => {

        const response = await request(app)
            .get("/api/groups")
            .set("Cookie", `accessToken=${validAccessTokenRegular};refreshToken=${validRefreshTokenRegular}`)

        expect(response.status).toBe(401);
  });

});

describe("getGroup", () => {

  beforeEach(async () => {
    await User.deleteMany({});
    await Group.deleteMany({});
  });

  test("Should return 404 if param not valid", async () => {
        const response = await request(app)
            .get("/api/groups/:name")
            .set("Cookie", `accessToken=${validAccessTokenRegular};refreshToken=${validRefreshTokenRegular}`)

        expect(response.status).toBe(404);
  });

  test("Should return 400 if the group does not exist", async () => {

        const response = await request(app)
            .get("/api/groups/g1")
            .set("Cookie", `accessToken=${validAccessTokenRegular};refreshToken=${validRefreshTokenRegular}`)

        expect(response.status).toBe(400);

  });

  test("Should return 401 if not authorized", async () => {

        const group1 = {
            name : "g1",
            members : [
                {email : "a@aol.com", id : "1"}, {email : "b@aol.com", id :"2"}
            ]
        };
        const group2 = {
            name : "g2",
            members : [
                {email : "c@aol.com", id : "3"}, {email : "d@aol.com", id :"4"}
            ]
        }

        await Group.create(group1);
        await Group.create(group2);

        const response = await request(app)
            .get("/api/groups/g1")
            .set("Cookie",``)

        expect(response.status).toBe(401);

  });

  test("Should return 200 if group exists and authorized", async () => {

        const group1 = {
            name : "g1",
            members : [
                {email : "giacomo.sansone@aol.com", id : "1"}, {email : "b@aol.com", id :"2"}
            ]
        };
        const group2 = {
            name : "g2",
            members : [
                {email : "c@aol.com", id : "3"}, {email : "d@aol.com", id :"4"}
            ]
        }

        await Group.create(group1);
        await Group.create(group2);

        const response = await request(app)
            .get("/api/groups/g1")
            .set("Cookie", `accessToken=${validAccessTokenRegular};refreshToken=${validRefreshTokenRegular}`)

        expect(response.status).toBe(200);
        expect(response.body).toStrictEqual({
            data : {
                group : {
                    name : group1.name, members : group1.members.map((e) => ({email : e.email}))},
                }
        });
  });

})

describe("addToGroup", () => {

  beforeEach(async () => {
    await User.deleteMany({});
    await Group.deleteMany({});
  });

  test("Should return 404 if not params.name", async () => {
        const response = await request(app)
            .patch("/api/groups/:name/add")
            .set("Cookie", `accessToken=${validAccessTokenRegular};refreshToken=${validRefreshTokenRegular}`)
        
        expect(response.status).toBe(404);

  });

  test("Should return 400 if not body.emails", async () => {
        const response = await request(app)
            .patch("/api/groups/g1/add")
            .send({})
            .set("Cookie", `accessToken=${validAccessTokenRegular};refreshToken=${validRefreshTokenRegular}`)
        
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
            error : "Body error"
        })

  });

  test("Should return 400 if body.emails has no emails", async () => {
        const response = await request(app)
            .patch("/api/groups/g1/add")
            .send({emails : "string"})
            .set("Cookie", `accessToken=${validAccessTokenRegular};refreshToken=${validRefreshTokenRegular}`)

        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
            error : "Emails doesn't contain an array"
        })

  });

  test("Should return 400 if body.emails has one invalid email", async () => {
        const response = await request(app)
            .patch("/api/groups/g1/add")
            .send({emails :["string"]})
            .set("Cookie", `accessToken=${validAccessTokenRegular};refreshToken=${validRefreshTokenRegular}`)

        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
            error : "Not valid email format"
        })

  });

  test("Should return 401 if not authorized as admin", async () => {

        const group1 = {
            name : "g1",
            members : [
                {email : "a@aol.com", id : "1"}, {email : "b@aol.com", id :"2"}
            ]
        };
        await Group.create(group1);


        const response = await request(app)
            .patch("/api/groups/g1/add")
            .send({emails :["email@email.com"]})
            .set("Cookie", `accessToken=${validAccessTokenRegular};refreshToken=${validRefreshTokenRegular}`)

        expect(response.status).toBe(401);

  });
  
  test("Should return 401 if user not in group", async () => {

        const group1 = {
            name : "g1",
            members : [
                {email : "a@aol.com", id : "1"}, {email : "b@aol.com", id :"2"}
            ]
        };
        await Group.create(group1);

        const response = await request(app)
            .patch("/api/groups/g1/add")
            .send({emails :["email@email.com"]})
            .set("Cookie", `accessToken=${validRefreshTokenAdmin};refreshToken=${validRefreshTokenAdmin}`)

        expect(response.status).toBe(401);
  });

  test("Should return 400 if group does not exist", async () => {

        const response = await request(app)
            .patch("/api/groups/g1/insert")
            .send({emails :["email@email.com"]})
            .set("Cookie", `accessToken=${validAccessTokenAdmin};refreshToken=${validRefreshTokenAdmin}`)

        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
            error : "Group does not exist"
        })

  });

  test("Should return 400 if all the members are already in a group", async () => {
        const group1 = {
            name : "g1",
            members : [
                {email : "giacomo.sansone@aol.com", id : "1"}, {email : "b@aol.com", id :"2"}
            ]
        };
        const group2 = {
            name : "g2",
            members : [
                {email : "c@aol.com", id : "3"}, {email : "d@aol.com", id :"4"}
            ]
        }

        const user1 = {
            username : "c",
            email : "c@aol.com",
            password : "pass"
        };
        const user2 = {
            username : "d",
            email : "d@aol.com",
            password : "pass"
        }

        await User.create(user1);
        await User.create(user2);
        await Group.create(group1);
        await Group.create(group2);

        const response = await request(app)
            .patch("/api/groups/g1/add")
            .send({emails : ["c@aol.com", "d@aol.com", "e@aol.com"]})
            .set("Cookie", `accessToken=${validAccessTokenRegular};refreshToken=${validRefreshTokenRegular}`)
        
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
            error : "no new member available"
        })

  });

  test("Should return 200 if we can add at least once", async () => {

        const group1 = {
            name : "g1",
            members : [
                {email : "giacomo.sansone@aol.com", id : "1"}, {email : "b@aol.com", id :"2"}
            ]
        };
        const group2 = {
            name : "g2",
            members : [
                {email : "d@aol.com", id :"4"}
            ]
        }

        const user1 = {
            username : "c",
            email : "c@aol.com",
            password : "pass"
        };
        const user2 = {
            username : "d",
            email : "d@aol.com",
            password : "pass"
        }

        await User.create(user1);
        await User.create(user2);
        await Group.create(group1);
        await Group.create(group2);

        const response = await request(app)
            .patch("/api/groups/g1/add")
            .send({emails : ["c@aol.com", "d@aol.com", "e@aol.com"]})
            .set("Cookie", `accessToken=${validAccessTokenRegular};refreshToken=${validRefreshTokenRegular}`)
        
        expect(response.status).toBe(200);
        expect(response.body).toStrictEqual({
            data : {
                group: {
                    name : "g1",
                    members : [ {email : "giacomo.sansone@aol.com"},{email : "b@aol.com"}, {email : "c@aol.com"}],
                },
                alreadyInGroup : [{email : "d@aol.com"}],
                membersNotFound : [{email : "e@aol.com"}]
            }
        });

  });
});

describe("removeFromGroup", () => {

  beforeEach(async () => {
    await User.deleteMany({});
    await Group.deleteMany({});
  });

  test("Should return 404 if not params.name", async () => {

        const response = await request(app)
            .patch("/api/groups/:name/remove")
            .set("Cookie", `accessToken=${validAccessTokenRegular};refreshToken=${validRefreshTokenRegular}`)
        
        expect(response.status).toBe(404);

  });
  test("Should return 400 if not valid body.emails", async () => {

        const response = await request(app)
            .patch("/api/groups/g1/remove")
            .send({})
            .set("Cookie", `accessToken=${validAccessTokenRegular};refreshToken=${validRefreshTokenRegular}`)
        
        expect(response.status).toBe(400);
        

  });
  test("Should return 400 if body.emails not an array", async () => {

        const response = await request(app)
            .patch("/api/groups/g1/remove")
            .send({emails : "string"})
            .set("Cookie", `accessToken=${validAccessTokenRegular};refreshToken=${validRefreshTokenRegular}`)
        
        expect(response.status).toBe(400);

  });
  test("Should return 400 if at least one email is not valid", async () => {

        const response = await request(app)
            .patch("/api/groups/g1/remove")
            .send({emails : ["string"]})
            .set("Cookie", `accessToken=${validAccessTokenRegular};refreshToken=${validRefreshTokenRegular}`)
        
        expect(response.status).toBe(400);

  });
  test("Should return 400 if group does not exist", async () => {

        const response = await request(app)
            .patch("/api/groups/g1/remove")
            .send({emails : ["a@aol.com", "b@aol.com"]})
            .set("Cookie", `accessToken=${validAccessTokenRegular};refreshToken=${validRefreshTokenRegular}`)
        
        expect(response.status).toBe(400);

  });
  test("Should return 400 if there is only one member in the group", async () => {

        const group1 = {
            name : "g1",
            members : [
                {email : "a@aol.com", id : "1"}
            ]
        };
        await Group.create(group1);

        const response = await request(app)
            .patch("/api/groups/g1/remove")
            .send({emails : ["a@aol.com", "b@aol.com"]})
            .set("Cookie", `accessToken=${validAccessTokenRegular};refreshToken=${validRefreshTokenRegular}`)
        
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
            error: "There's only one member in the group: ERROR"
        })
    
  });
  test("Should return 401 if not authorized in group", async () => {

        const group1 = {
            name : "g1",
            members : [
                {email : "a@aol.com", id : "1"}, 
                {email : "b@aol.com", id : "1"}, 
            ]
        };
        await Group.create(group1);

        const response = await request(app)
            .patch("/api/groups/g1/remove")
            .send({emails : ["a@aol.com", "b@aol.com"]})
            .set("Cookie", `accessToken=${validAccessTokenRegular};refreshToken=${validRefreshTokenRegular}`)
        
        expect(response.status).toBe(401);

  });
  test("Should return 401 if not authorized as admin", async () => {

        const group1 = {
            name : "g1",
            members : [
                {email : "a@aol.com", id : "1"}, 
                {email : "b@aol.com", id : "1"}, 
            ]
        };
        await Group.create(group1);

        const response = await request(app)
            .patch("/api/groups/g1/pull")
            .send({emails : ["a@aol.com", "b@aol.com"]})
            .set("Cookie", `accessToken=${validAccessTokenRegular};refreshToken=${validRefreshTokenRegular}`)
        
        expect(response.status).toBe(401);
  });

  test("Should return 400 if all membersEmail either do not exist or not in group", async () => {

        const group1 = {
            name : "g1",
            members : [
                {email : "a@aol.com", id : "1"}, 
                {email : "b@aol.com", id : "1"}, 
            ]
        };

        const user1 = {
            username : "c",
            email : "c@aol.com",
            password : "pass"
        };

        await User.create(user1);
        await Group.create(group1);

        const response = await request(app)
            .patch("/api/groups/g1/pull")
            .send({emails : ["c@aol.com", "d@aol.com"]})
            .set("Cookie", `accessToken=${validAccessTokenAdmin};refreshToken=${validRefreshTokenAdmin}`)
        
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
            error: "emails are not valid",
        })

  });
  test("Should return 200 if it was possible to remove some members", async () => {

        const group1 = {
            name : "g1",
            members : [
                {email : "a@aol.com", id : "1"}, 
                {email : "b@aol.com", id : "1"}, 
            ]
        };

        const user1 = {
            username : "a",
            email : "a@aol.com",
            password : "pass"
        };
        const user2 = {
            username : "d",
            email : "d@aol.com",
            password : "pass"
        };
        const user3 = {
            username : "b",
            email : "b@aol.com",
            password : "pass"
        };

        await User.create(user1);
        await User.create(user2);
        await User.create(user3);
        await Group.create(group1);

        const response = await request(app)
            .patch("/api/groups/g1/pull")
            .send({emails : ["a@aol.com", "d@aol.com", "e@aol.com"]})
            .set("Cookie", `accessToken=${validAccessTokenAdmin};refreshToken=${validRefreshTokenAdmin}`)
        
        expect(response.status).toBe(200);
        expect(response.body).toStrictEqual({
            data : {
                group : {
                    name : "g1",
                    members : [{email : "b@aol.com"}]
                },
                membersNotFound : [{email : "e@aol.com"}],
                notInGroup : [{email : "d@aol.com"}]
            }
        })

  });
  test("Should return 200 if it was possible to remove all the members except the first one", async () => {
        const group1 = {
            name : "g1",
            members : [
                {email : "a@aol.com", id : "1"}, 
                {email : "b@aol.com", id : "1"}, 
            ]
        };

        const user1 = {
            username : "a",
            email : "a@aol.com",
            password : "pass"
        };
        const user2 = {
            username : "d",
            email : "d@aol.com",
            password : "pass"
        };
        const user3 = {
            username : "b",
            email : "b@aol.com",
            password : "pass"
        };

        await User.create(user1);
        await User.create(user2);
        await User.create(user3);
        await Group.create(group1);

        const response = await request(app)
            .patch("/api/groups/g1/pull")
            .send({emails : ["a@aol.com", "b@aol.com", "d@aol.com", "e@aol.com"]})
            .set("Cookie", `accessToken=${validAccessTokenAdmin};refreshToken=${validRefreshTokenAdmin}`)
        
        expect(response.status).toBe(200);
        expect(response.body).toStrictEqual({
            data : {
                group : {
                    name : "g1",
                    members : [{email : "a@aol.com"}]
                },
                membersNotFound : [{email : "e@aol.com"}],
                notInGroup : [{email : "d@aol.com"}]
            }
        })
  });

})

describe("deleteUser", () => { 
    beforeEach(async () => {
        await User.deleteMany({});
        await Group.deleteMany({});
        await transactions.deleteMany({});
        jest.restoreAllMocks();
    });

    test("should delete the user and return a success response", async () => {
        const user1 = {
            username : "GioGiunta",
            email : "s318082@studenti.polito.it",
            password : "SoftEng23"
        };
        await User.create(user1);

        const group1 = {
            name : "g1",
            members : [
                {email : "s318082@studenti.polito.it", id : "10"},
                {email : "user2@studenti.polito.it", id : "11"}
            ]};
        await Group.create(group1);

        const t1 = new transactions({username: "GioGiunta", type : "type1", amount : 100});
        await t1.save();

        const response = await request(app)
            .delete("/api/users")
            .set("Cookie", `accessToken=${validAccessTokenAdmin};refreshToken=${validRefreshTokenAdmin}`)
            .send({email : "s318082@studenti.polito.it"});
        expect(response.status).toBe(200);
        expect(response.body).toStrictEqual({
            data : {
                deletedFromGroup: true,
                deletedTransactions: 1
            }
        });
    });

    test("should return 401 if user is not authorized", async () => {
        const user1 = {
            username : "GioGiunta",
            email : "s318082@studenti.polito.it",
            password : "SoftEng23"
        };
        await User.create(user1);

        const response = await request(app)
            .delete("/api/users")
            .set("Cookie", `accessToken=bad_accessToken;refreshToken=bad_refreshToken`)
            .send({email : "s318082@studenti.polito.it"})

        expect(response.status).toBe(401);
        
    });

    test("should return 400 if user does not exist", async () => {
        const response = await request(app)
            .delete("/api/users")
            .set("Cookie", `accessToken=${validAccessTokenAdmin};refreshToken=${validRefreshTokenAdmin}`)
            .send({email : "s318082@studenti.polito.it"})

        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
            error: "User not found or doesn't exist"
        });
    });

    test("should return 400 if request does not contain email", async () => {
        const response = await request(app)
            .delete("/api/users")
            .set("Cookie", `accessToken=${validAccessTokenAdmin};refreshToken=${validRefreshTokenAdmin}`)
            .send({})

        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
            error: "Request does not contain the email"
        });
    });

    test("should return 400 if the email is empty", async () => {
        const response = await request(app)
            .delete("/api/users")
            .set("Cookie", `accessToken=${validAccessTokenAdmin};refreshToken=${validRefreshTokenAdmin}`)
            .send({email : ""})

        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
            error: "The email field is empty"
        });
    });

    test("should return 400 if the email is not valid", async () => {
        const response = await request(app)
            .delete("/api/users")
            .set("Cookie", `accessToken=${validAccessTokenAdmin};refreshToken=${validRefreshTokenAdmin}`)
            .send({email : "not_valid_email"})

        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
            error: "Email format is not correct"
        });
    });

    test("should return 500 if there is an error while deleting the user", async () => {
        jest.spyOn(User, 'findOne').mockImplementation(() => {
            throw new Error('Some error');
        });
        
        const user1 = {
            username : "GioGiunta",
            email : "s318082@studenti.polito.it",
            password : "SoftEng23"
        };
        await User.create(user1);

        const group1 = {
            name : "g1",
            members : [ 
                {email : "s318082@studenti.polito.it", id : "10"},
                {email : "user2@studenti.polito.it", id : "11"}
            ]
        };
        await Group.create(group1);

        const response = await request(app)
            .delete("/api/users")
            .set("Cookie", `accessToken=${validAccessTokenAdmin};refreshToken=${validRefreshTokenAdmin}`)
            .send({email : "s318082@studenti.polito.it"})

        expect(response.status).toBe(500);
        expect(response.body).toStrictEqual({
            error: "Some error"
        });
    });


    test("should return 200 if successful and the user is the last member of the group", async () => {
        const user1 = {
            username : "GioGiunta",
            email : "s318082@studenti.polito.it",
            password : "SoftEng23"
        };
        await User.create(user1);

        const group1 = {
            name : "g1",
            members : [
                {email : "s318082@studenti.polito.it", id : "10"}
            ]
        };
        await Group.create(group1);
 
        const response = await request(app)
            .delete("/api/users")
            .set("Cookie", `accessToken=${validAccessTokenAdmin};refreshToken=${validRefreshTokenAdmin}`)
            .send({email : "s318082@studenti.polito.it"})

        expect(response.status).toBe(200);
        expect(response.body).toStrictEqual({
            data : {
                deletedFromGroup: true,
                deletedTransactions: 0
            }
        });
    });

    test("should return 400 if you try to delete an admin", async () => {
        const user1 = {
            username : "GioGiunta",
            email : "s318082@studenti.polito.it",
            password : "SoftEng23",
            role : "Admin"
        };
        await User.create(user1);

        const response = await request(app)
            .delete("/api/users")
            .set("Cookie", `accessToken=${validAccessTokenAdmin};refreshToken=${validRefreshTokenAdmin}`)
            .send({email : "s318082@studenti.polito.it"})
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
            error: "Cannot delete an Admin"
        });
    });

    test("should return 200 if the user is deleted and he does not belong to any group", async () => {
        const user1 = {
            username : "GioGiunta",
            email : "s318082@studenti.polito.it",
            password : "SoftEng23"
        };
        await User.create(user1);

        const response = await request(app)
            .delete("/api/users")
            .set("Cookie", `accessToken=${validAccessTokenAdmin};refreshToken=${validRefreshTokenAdmin}`)
            .send({email : "s318082@studenti.polito.it"})

        expect(response.status).toBe(200);
        expect(response.body).toStrictEqual({
            data : {
                deletedFromGroup: false,
                deletedTransactions: 0
            }
        });
    });
})

describe("deleteGroup", () => { 
    beforeEach(async () => {
        await Group.deleteMany({});
    });
    test("should delete the group and return a success response", async () => {
        const group1 = {
            name : "g1",
            members : [
                {email : "s318082@studenti.polito.it", id : "10"},
                {email : "user2@gmail.com", id : "11"}
            ]
        };
        await Group.create(group1);

        const response = await request(app)
            .delete("/api/groups")
            .set("Cookie", `accessToken=${validAccessTokenAdmin};refreshToken=${validRefreshTokenAdmin}`)
            .send({name : "g1"})
        expect(response.status).toBe(200);
        expect(response.body).toStrictEqual({
            data : {
                message: "Group has been deleted" 
            }
        });
    });

    test("should return an error response if authentication fails", async () => {
        const group1 = {
            name : "g1",
            members : [
                {email : "user1@gmail.com", id : "10"},
                {email : "user2@gmail.com", id : "11"}
            ]
        };
        await Group.create(group1);

        const response = await request(app)
            .delete("/api/groups")
            .set("Cookie", `accessToken=bad_AccessToken;refreshToken=bad_RefreshToken`)
            .send({name : "g1"})
        expect(response.status).toBe(401);
    });

    test("should return an error response if the group does not exist", async () => {
        const group1 = {
            name : "g1",
            members : [
                {email : "user1@example.com", id : "10"},
                {email : "user2@example.com", id : "11"}
            ]
        };
        await Group.create(group1);

        const response = await request(app)
            .delete("/api/groups")
            .set("Cookie", `accessToken=${validAccessTokenAdmin};refreshToken=${validRefreshTokenAdmin}`)
            .send({name : "g2"})
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
            error: "Group does not exist"
        });
    });

    test("should return an error response if there is an error while deleting the group", async () => {
        jest.spyOn(Group, 'deleteOne').mockImplementation(() => {
            throw new Error('Some error');
        });
        
        const group1 = {
            name : "g1",
            members : [
                {email : "user1@gmail.com", id : "10"},
                {email : "user2@gmail.com", id : "11"}
            ]
        };
        await Group.create(group1);

        const response = await request(app)
            .delete("/api/groups")
            .set("Cookie", `accessToken=${validAccessTokenAdmin};refreshToken=${validRefreshTokenAdmin}`)
            .send({name : "g1"})
        expect(response.status).toBe(500);
        expect(response.body).toStrictEqual({
            error: "Some error"
        });
    });

    test("should return an error response if the name is not valid", async () => {
        const group1 = {
            name : "g1",
            members : [
                {email : "user1@example.com", id : "10"},
                {email : "user2@example.com", id : "11"}
            ]
        };
        await Group.create(group1);

        const response = await request(app)
            .delete("/api/groups")
            .set("Cookie", `accessToken=${validAccessTokenAdmin};refreshToken=${validRefreshTokenAdmin}`)
            .send({name : ""})
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
            error: "name not valid or missing"
        });
    });

    test("should return an error response if the name is not provided", async () => {
        const group1 = {
            name : "g1",
            members : [
                {email : "user1@example.com", id : "10"},
                {email : "user2@example.com", id : "11"}
            ]
        };
        await Group.create(group1);

        const response = await request(app)
            .delete("/api/groups")
            .set("Cookie", `accessToken=${validAccessTokenAdmin};refreshToken=${validRefreshTokenAdmin}`)
            
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
            error: "name not valid or missing"
        });
    });
})
