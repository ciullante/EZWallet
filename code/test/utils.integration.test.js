import { handleDateFilterParams, verifyAuth, handleAmountFilterParams } from '../controllers/utils';
const jwt = require("jsonwebtoken");
import dotenv from "dotenv";

dotenv.config();
let mockReq, mockRes, params, user, admin;

let accessToken, refreshToken;
beforeAll(async () => {
  user = {
    email: "user1@gmail.com",
    username: "user1",
    role: "Regular",
    password: "password"
  };

  admin = {
    email: "admin@gmail.com",
    username: "admin",
    role: "Admin",
    password: "password"
  }

  mockReq = {
    cookies: {
      accessToken: "",
      refreshToken: "",
    },
  };

  mockRes = {
    cookie: jest.fn(),
    locals: {},
  };

});

describe("handleDateFilterParams", () => { 
    //handleDateFilterParams is a supportive methods so it is not being exposed with routes and the integration tests are like unit tests.
})

describe("verifyAuth", () => { 
    test("should return false if accessToken and/or refreshToken are missing", () => {
        params = {
            authType: "Simple",
          };
      
          const response = verifyAuth(mockReq, mockRes, params);
      
          expect(response).toEqual({ flag: false, cause: "Unauthorized" });
    });

    test("should return false if at least one of the elemets of the accessToken is missing", () => {
        accessToken = jwt.sign(
            {
              email: user.email,
              username: user.username,
            },
            process.env.ACCESS_KEY,
            { expiresIn: "1h" }
          );
      
          refreshToken = jwt.sign(
            user,
            process.env.ACCESS_KEY,
            { expiresIn: "7d" }
          );
      
          mockReq.cookies.accessToken = accessToken;
          mockReq.cookies.refreshToken = refreshToken;
      
          params = {
            authType: "Simple",
          };
      
          const response = verifyAuth(mockReq, mockRes, params);
      
          expect(response).toEqual({ flag: false, cause: "Token is missing information" });
    });

    test("should return false if at least one of the elements of the refreshToken is missing", () => {
        accessToken = jwt.sign(
            user,
            process.env.ACCESS_KEY,
            { expiresIn: "1h" }
          );
      
          refreshToken = jwt.sign(
            {
              email: user.email,
              username: user.username,
            },
            process.env.ACCESS_KEY,
            { expiresIn: "7d" }
          );
      
          mockReq.cookies.accessToken = accessToken;
          mockReq.cookies.refreshToken = refreshToken;
      
          params = {
            authType: "Simple",
          };
      
          const response = verifyAuth(mockReq, mockRes, params);
      
          expect(response).toEqual({ flag: false, cause: "Token is missing information" });
    });

    test("should return false if the elements of the accessToken and refreshToken are not consistent", () => {
        accessToken = jwt.sign(
            user,
            process.env.ACCESS_KEY,
            { expiresIn: "1h" }
          );
      
          refreshToken = jwt.sign(
            admin,
            process.env.ACCESS_KEY,
            { expiresIn: "7d" }
          );
      
          mockReq.cookies.accessToken = accessToken;
          mockReq.cookies.refreshToken = refreshToken;
      
          params = {
            authType: "Simple",
          };
      
          const response = verifyAuth(mockReq, mockRes, params);
      
          expect(response).toEqual({ flag: false, cause: "Mismatched users" });
    });
    
    test("should return true if the authorization is of type simple", async () => {
        accessToken = jwt.sign(
          user,
          process.env.ACCESS_KEY,
          { expiresIn: "1h" }
        );
    
        refreshToken = jwt.sign(
          user,
          process.env.ACCESS_KEY,
          { expiresIn: "7d" }
        );
    
        mockReq.cookies.accessToken = accessToken;
        mockReq.cookies.refreshToken = refreshToken;
    
        params = {
          authType: "Simple",
        };
    
        const response = verifyAuth(mockReq, mockRes, params);
    
        expect(response).toEqual({ flag: true, cause: "authorized" });
      });

      test("should return true if the authorization is of type user and accessToken is valid", async () => {
        accessToken = jwt.sign(
          user,
          process.env.ACCESS_KEY,
          { expiresIn: "1h" }
        );
    
        refreshToken = jwt.sign(
          user,
          process.env.ACCESS_KEY,
          { expiresIn: "7d" }
        );
    
        mockReq.cookies.accessToken = accessToken;
        mockReq.cookies.refreshToken = refreshToken;
    
        params = {
          authType: "User",
          username: "user1"
        };
    
        const response = verifyAuth(mockReq, mockRes, params);
    
        expect(response).toEqual({ flag: true, cause: "authorized" });
      });

        test("should return false if the authorization is of type user and accessToken is not valid", async () => {
            accessToken = jwt.sign(
                user,
                process.env.ACCESS_KEY,
                { expiresIn: "1h" }
              );
          
              refreshToken = jwt.sign(
                user,
                process.env.ACCESS_KEY,
                { expiresIn: "7d" }
              );
          
              mockReq.cookies.accessToken = accessToken;
              mockReq.cookies.refreshToken = refreshToken;
          
              params = {
                authType: "User",
                username: "user2"
              };
          
              const response = verifyAuth(mockReq, mockRes, params);
          
              expect(response).toEqual({ flag: false, cause: "Not authorized for action on this user." });

        });

      test("should return true if the authentication is of type admin and accessToken is valid", async () => {
        accessToken = jwt.sign(
          admin,
          process.env.ACCESS_KEY,
          { expiresIn: "1h" }
        );
    
        refreshToken = jwt.sign(
          admin,
          process.env.ACCESS_KEY,
          { expiresIn: "7d" }
        );
    
        mockReq.cookies.accessToken = accessToken;
        mockReq.cookies.refreshToken = refreshToken;
    
        params = {
          authType: "Admin"
        };
    
        const response = verifyAuth(mockReq, mockRes, params);
    
        expect(response).toEqual({ flag: true, cause: "authorized" });
      });

      test("should return true if the authentication is of type admin and accessToken is not valid", async () => {
        accessToken = jwt.sign(
          user,
          process.env.ACCESS_KEY,
          { expiresIn: "1h" }
        );
    
        refreshToken = jwt.sign(
          user,
          process.env.ACCESS_KEY,
          { expiresIn: "7d" }
        );
    
        mockReq.cookies.accessToken = accessToken;
        mockReq.cookies.refreshToken = refreshToken;
    
        params = {
          authType: "Admin"
        };
    
        const response = verifyAuth(mockReq, mockRes, params);
    
        expect(response).toEqual({ flag: false, cause: "Not authorized for this action" });
      });

      test("should return true if the authentication is of type Group and accessToken is valid", async () => {
        accessToken = jwt.sign(
          user,
          process.env.ACCESS_KEY,
          { expiresIn: "1h" }
        );
    
        refreshToken = jwt.sign(
          user,
          process.env.ACCESS_KEY,
          { expiresIn: "7d" }
        );
    
        mockReq.cookies.accessToken = accessToken;
        mockReq.cookies.refreshToken = refreshToken;
    
        params = {
          authType: "Group",
          emails: [user.email, "user2@gmail.com"],
        };
    
        const response = verifyAuth(mockReq, mockRes, params);
    
        expect(response).toEqual({ flag: true, cause: "authorized" });
      });

      test("should return true if the authentication is of type Group and accessToken is not valid", async () => {
        accessToken = jwt.sign(
          user,
          process.env.ACCESS_KEY,
          { expiresIn: "1h" }
        );
    
        refreshToken = jwt.sign(
          user,
          process.env.ACCESS_KEY,
          { expiresIn: "7d" }
        );
    
        mockReq.cookies.accessToken = accessToken;
        mockReq.cookies.refreshToken = refreshToken;
    
        params = {
          authType: "Group",
          emails: ["user2@gmail.com", "user3@gmail.com"],
        };
    
        const response = verifyAuth(mockReq, mockRes, params);
    
        expect(response).toEqual({ flag: false, cause: "Not authorized for this action" });
      });

      test("should return false if the authorization is of type which is not supported", () => {
        accessToken = jwt.sign(
          user,
          process.env.ACCESS_KEY,
          { expiresIn: "1h" }
        );
    
        refreshToken = jwt.sign(
          user,
          process.env.ACCESS_KEY,
          { expiresIn: "7d" }
        );
    
        mockReq.cookies.accessToken = accessToken;
        mockReq.cookies.refreshToken = refreshToken;
    
        params = {
          authType: "Unsupported",
        };
    
        const response = verifyAuth(mockReq, mockRes, params);
    
        expect(response).toEqual({ flag: false, cause: "Not authorized for this action" });
      });

      test("should return true if the authentication is of type simple but the accessToken has been refreshed", async () => {
        accessToken = jwt.sign(
          user,
          process.env.ACCESS_KEY,
          { expiresIn: "0s" }
        );
    
        refreshToken = jwt.sign(
          user,
          process.env.ACCESS_KEY,
          { expiresIn: "7d" }
        );
    
        mockReq.cookies.accessToken = accessToken;
        mockReq.cookies.refreshToken = refreshToken;
    
        params = {
          authType: "Simple",
        };
    
        const response = verifyAuth(mockReq, mockRes, params);
    
        expect(response).toEqual({ flag: true, cause: "authenticated" });
    
        expect(mockRes.locals).toEqual({
          refreshedTokenMessage: "Access token has been refreshed. Remember to copy the new one in the headers of subsequent calls"
        });
      });

      test("should return true if the authentication is of type user but the accessToken has been refreshed", () => {
        accessToken = jwt.sign(
          user,
          process.env.ACCESS_KEY,
          { expiresIn: "0s" }
        );
    
        refreshToken = jwt.sign(
          user,
          process.env.ACCESS_KEY,
          { expiresIn: "7d" }
        );
    
        mockReq.cookies.accessToken = accessToken;
        mockReq.cookies.refreshToken = refreshToken;
    
        params = {
          authType: "User",
          username: user.username
        };
    
        const response = verifyAuth(mockReq, mockRes, params);
    
        expect(response).toEqual({ flag: true, cause: "authenticated" });
    
        expect(mockRes.locals).toEqual({
          refreshedTokenMessage: "Access token has been refreshed. Remember to copy the new one in the headers of subsequent calls"
        });
      });

      test("should return false if the authentication is of type user but the accessToken has been refreshed and not valid", () => {
        accessToken = jwt.sign(
          user,
          process.env.ACCESS_KEY,
          { expiresIn: "0s" }
        );
    
        refreshToken = jwt.sign(
          user,
          process.env.ACCESS_KEY,
          { expiresIn: "7d" }
        );
    
        mockReq.cookies.accessToken = accessToken;
        mockReq.cookies.refreshToken = refreshToken;
    
        params = {
          authType: "User",
          username: "user2"
        };
    
        const response = verifyAuth(mockReq, mockRes, params);
    
        expect(response).toEqual({ flag: false, cause: "Not valid token for the request user" });
      });

    test("should return true if the authentication is of type admin but the accessToken has been refreshed", () => {
        accessToken = jwt.sign(
          admin,
          process.env.ACCESS_KEY,
          { expiresIn: "0s" }
        );
    
        refreshToken = jwt.sign(
          admin,
          process.env.ACCESS_KEY,
          { expiresIn: "7d" }
        );
    
        mockReq.cookies.accessToken = accessToken;
        mockReq.cookies.refreshToken = refreshToken;
    
        params = {
          authType: "Admin"
        };
    
        const response = verifyAuth(mockReq, mockRes, params);
    
        expect(response).toEqual({ flag: true, cause: "authenticated" });
    
        expect(mockRes.locals).toEqual({
          refreshedTokenMessage: "Access token has been refreshed. Remember to copy the new one in the headers of subsequent calls"
        });
    });

    test("should return false if the authentication is of type admin but the accessToken has been refreshed and not valid", () => {
        accessToken = jwt.sign(
          user,
          process.env.ACCESS_KEY,
          { expiresIn: "0s" }
        );
    
        refreshToken = jwt.sign(
          user,
          process.env.ACCESS_KEY,
          { expiresIn: "7d" }
        );
    
        mockReq.cookies.accessToken = accessToken;
        mockReq.cookies.refreshToken = refreshToken;
    
        params = {
          authType: "Admin"
        };
    
        const response = verifyAuth(mockReq, mockRes, params);
    
        expect(response).toEqual({ flag: false, cause: "Not valid token for the request role" });
    });

    test("should return true if the authentication is of type group but the accessToken has been refreshed", () => {
        accessToken = jwt.sign(
          user,
          process.env.ACCESS_KEY,
          { expiresIn: "0s" }
        );
    
        refreshToken = jwt.sign(
          user,
          process.env.ACCESS_KEY,
          { expiresIn: "7d" }
        );
    
        mockReq.cookies.accessToken = accessToken;
        mockReq.cookies.refreshToken = refreshToken;
    
        params = {
          authType: "Group",
          emails: [user.email, "user2@gmail.com"]
        };

        const response = verifyAuth(mockReq, mockRes, params);

        expect(response).toEqual({ flag: true, cause: "authenticated" });

        expect(mockRes.locals).toEqual({
            refreshedTokenMessage: "Access token has been refreshed. Remember to copy the new one in the headers of subsequent calls"
        });
    });

    test("should return false if the authentication is of type group but the accessToken has been refreshed and not valid", () => {
        accessToken = jwt.sign(
          user,
          process.env.ACCESS_KEY,
          { expiresIn: "0s" }
        );
    
        refreshToken = jwt.sign(
          user,
          process.env.ACCESS_KEY,
          { expiresIn: "7d" }
        );
    
        mockReq.cookies.accessToken = accessToken;
        mockReq.cookies.refreshToken = refreshToken;
    
        params = {
          authType: "Group",
          emails: ["user2@gmail.com", "user3@gmail.com"]
        };

        const response = verifyAuth(mockReq, mockRes, params);

        expect(response).toEqual({ flag: false, cause: "Not valid token for the request role" });

    });

    test("should return false if the authorization is of type which is not supported and the accessToken has been refreshed", async () => {
        accessToken = jwt.sign(
          user,
          process.env.ACCESS_KEY,
          { expiresIn: "0s" }
        );
    
        refreshToken = jwt.sign(
          user,
          process.env.ACCESS_KEY,
          { expiresIn: "7d" }
        );
    
        mockReq.cookies.accessToken = accessToken;
        mockReq.cookies.refreshToken = refreshToken;
    
        params = {
          authType: "Regular"
        };
    
        const response = verifyAuth(mockReq, mockRes, params);
    
        expect(response).toEqual({ flag: false, cause: "Not valid token for the request role" });
    });

    test("should return false if the accessToken has expired", async () => {
        accessToken = jwt.sign(
            user,
            process.env.ACCESS_KEY,
            { expiresIn: "0s" }
          );
      
        refreshToken = jwt.sign(
        user,
        process.env.ACCESS_KEY,
        { expiresIn: "0s" }
        );
    
        mockReq.cookies.accessToken = accessToken;
        mockReq.cookies.refreshToken = refreshToken;
    
        params = {
        authType: "Simple",
        };
    
        const response = verifyAuth(mockReq, mockRes, params);
    
        expect(response).toEqual({ flag: false, cause: "Token expired, log-in again" });
    });

})

describe("handleAmountFilterParams", () => { 
    //handleAmountFilterParams is a supportive methods so it is not being exposed with routes and the integration tests are like unit tests.
})
