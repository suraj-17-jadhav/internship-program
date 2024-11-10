const { signUp } = require('../../../controllers/user.controller');
const User = require("../../../models/User");
jest.mock('../../../models/User');
describe("signUp", () => {
  it("should return status 200 for user register successfully ", async () => {
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue({
      username: "fake Username",
      email: "fake_email@gmail.com",
      password: "fake_password",
    });

    const request = {
      body: {
        username: "fake Username",
        email: "fake_email@gmail.com",
        password: "fake_password",
      },
    };

    const response = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    await signUp(request, response);
    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.send).toHaveBeenCalledTimes(1);
  }, 10000);

  it("should return status 422 for user already exist", async () => {
    User.findOne.mockResolvedValue({
      username: "fake username",
      email: "fake_email@gmail.com",
      password: "hashed_password",
    });
    const request = {
      body: {
        username: "fake username",
        email: "fake_email@gmail.com",
        password: "hashed_password",
      },
    };
    const response = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    await signUp(request, response);
    expect(response.status).toHaveBeenCalledWith(422);
    expect(response.send).toHaveBeenCalledTimes(1);
  }, 10000);

  it("should return status 422 for missing input field", async () => {
    const request = {
      body: {},
    };
    const response = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    await signUp(request, response);
    expect(response.status).toHaveBeenCalledWith(422);
    expect(response.send).toHaveBeenCalledTimes(1);
  }, 10000);

  it("should return status 500 for Internal server error", async () => {
    User.findOne.mockRejectedValue(new Error("Database error"));
    const request = {
      body: {
        username: "fake username",
        email: "error_user@gmail.com",
        password: "password123",
      },
    };
    const response = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    await signUp(request, response);
    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.send).toHaveBeenCalledTimes(1);
  }, 10000);
});
