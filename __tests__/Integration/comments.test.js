const request = require('supertest');
const app = require('../../index');
const mongoose = require('mongoose');
const Comment = require('../../models/Comment'); 
const User = require('../../models/User');
const jwt = require('jsonwebtoken');

let token;
let commentId;

describe('Comment Routes', () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        const user = await User.create({ email: 'testuser@example.com', password: 'password123', username: 'testuser' });
        token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        const comment = await Comment.create({ content: 'This is a test comment', user: user._id });
        commentId = comment._id;
    });

    afterAll(async () => {
        await Comment.deleteMany();
        await User.deleteMany();
        await mongoose.connection.close();
    });

    describe('GET /comments/:id', () => {
        it('should return a single comment', async () => {
            const response = await request(app)
                .get(`/comments/${commentId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('content', 'This is a test comment');
        });

        it('should return 404 if comment is not found', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const response = await request(app)
                .get(`/comments/${fakeId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error', 'Comment not found');
        });
    });

    describe('PUT /comments/:id', () => {
        it('should update a comment for an authenticated user', async () => {
            const updatedContent = { content: 'Updated comment content' };
            const response = await request(app)
                .put(`/comments/${commentId}`)
                .set('Authorization', `Bearer ${token}`)
                .send(updatedContent);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'Comment updated successfully');
            expect(response.body.updatedComment).toHaveProperty('content', 'Updated comment content');
        });

        it('should return 401 if the user is not authenticated', async () => {
            const response = await request(app)
                .put(`/comments/${commentId}`)
                .send({ content: 'Unauthorized update attempt' });

            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error', 'Unauthorized');
        });
    });

    describe('DELETE /comments/:id', () => {
        it('should delete a comment for an authenticated user', async () => {
            const response = await request(app)
                .delete(`/comments/${commentId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'Comment deleted successfully');
        });

        it('should return 401 if the user is not authenticated', async () => {
            const response = await request(app)
                .delete(`/comments/${commentId}`);

            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error', 'Unauthorized');
        });

        it('should return 404 if comment is not found', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const response = await request(app)
                .delete(`/comments/${fakeId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error', 'Comment not found');
        });
    });
});
