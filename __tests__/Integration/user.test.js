
const request = require('supertest');
const app = require('../../index');
const mongoose = require('mongoose');
const User = require('../../models/User'); 

describe('User Routes', () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    });
    afterAll(async () => {
        await User.deleteMany();
        await mongoose.connection.close();
    });

    describe('POST /register', () => {
        it('should register a new user and return a success message', async () => {
            const newUser = {
                email: 'newuser@example.com',
                password: 'password123',
                username: 'newuser'
            };
            
            const response = await request(app)
                .post('/register')
                .send(newUser);
            
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('message', 'User registered successfully');
        });

        it('should return 400 if required fields are missing', async () => {
            const incompleteUser = {
                email: 'incompleteuser@example.com'
            };

            const response = await request(app)
                .post('/register')
                .send(incompleteUser);
            
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'Email, username, and password are required.');
        });

        it('should return 409 if email is already registered', async () => {
            const duplicateUser = {
                email: 'newuser@example.com',
                password: 'password123',
                username: 'duplicateuser'
            };

            const response = await request(app)
                .post('/register')
                .send(duplicateUser);
            
            expect(response.status).toBe(409);
            expect(response.body).toHaveProperty('error', 'Email already in use.');
        });
    });

    describe('POST /login', () => {
        beforeAll(async () => {
            await User.create({ email: 'loginuser@example.com', password: 'password123', username: 'loginuser' });
        });
        it('should login a user with correct credentials and return a token', async () => {
            const loginUser = {
                email: 'loginuser@example.com',
                password: 'password123'
            };

            const response = await request(app)
                .post('/login')
                .send(loginUser);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('token');
            expect(response.body).toHaveProperty('message', 'Login successful');
        });

        it('should return 400 if email or password is missing', async () => {
            const incompleteLogin = { email: 'loginuser@example.com' };

            const response = await request(app)
                .post('/login')
                .send(incompleteLogin);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'Email and password are required.');
        });

        it('should return 401 for incorrect password', async () => {
            const wrongPassword = {
                email: 'loginuser@example.com',
                password: 'wrongpassword'
            };

            const response = await request(app)
                .post('/login')
                .send(wrongPassword);

            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error', 'Invalid email or password.');
        });

        it('should return 404 if the email is not registered', async () => {
            const unregisteredUser = {
                email: 'unregistered@example.com',
                password: 'password123'
            };

            const response = await request(app)
                .post('/login')
                .send(unregisteredUser);

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error', 'User not found.');
        });
    });
});
