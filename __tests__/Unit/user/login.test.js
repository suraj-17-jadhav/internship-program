
const { signIn } = require('../../../controllers/user.controller');
const bcrypt = require('bcrypt');
jest.mock('bcrypt');
jest.mock('../../../models/User');
const User = require('../../../models/User');
describe('signIn', () => {
    it('should sign in a user and return status 200 for valid credentials', async () => {
        User.findOne.mockResolvedValue({
            email: "fake_email@gmail.com",
            password: "hashed_password"
        });
        bcrypt.compare.mockResolvedValue(true);
        const request = {
            body: {
                email: "fake_email@gmail.com",
                password: "fake_password"
            }
        };
        const response = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        };
        await signIn(request, response);
        expect(response.status).toHaveBeenCalledWith(200);
        expect(response.send).toHaveBeenCalledTimes(1);
    }, 10000);

    it('should return status 422 for invalid email and password (missing fields)', async () => {
        const request = {
            body: {
                email: "",
                password: ""
            }
        };
        const response = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        };
        await signIn(request, response);
        expect(response.status).toHaveBeenCalledWith(422);
        expect(response.send).toHaveBeenCalledTimes(1);
    }, 10000);

    it('should return status 404 if user is not found', async () => {
        User.findOne.mockResolvedValue(null);
        const request = {
            body: {
                email: "non_existent@gmail.com",
                password: "password123"
            }
        };
        const response = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        };
        await signIn(request, response);
        expect(response.status).toHaveBeenCalledWith(404);
        expect(response.send).toHaveBeenCalledTimes(1);
    }, 10000);

    it('should return status 401 for invalid password', async () => {
        User.findOne.mockResolvedValue({
            email: "fake_email@gmail.com",
            password: "hashed_password"
        });
        bcrypt.compare.mockResolvedValue(false);
        const request = {
            body: {
                email: "fake_email@gmail.com",
                password: "wrong_password"
            }
        };
        const response = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        };
        await signIn(request, response);
        expect(response.status).toHaveBeenCalledWith(401);
        expect(response.send).toHaveBeenCalledTimes(1);
    }, 10000);

    it('should return status 500 for Internal server error', async () => {
        User.findOne.mockRejectedValue(new Error("Database error"));
        const request = {
            body: {
                email: "error_user@gmail.com",
                password: "password123"
            }
        };
        const response = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        };
        await signIn(request, response);
        expect(response.status).toHaveBeenCalledWith(500);
        expect(response.send).toHaveBeenCalledTimes(1);
    }, 10000);
});
