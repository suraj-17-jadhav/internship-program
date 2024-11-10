const request = require('supertest');
const app = require('../../index');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Post = require('../../models/Post'); 
const Comment = require('../../models/Comment');
const User = require('../../models/User'); 

describe('Posts Routes', () => {
    let token;
    let user;
    let postId;
    let commentId;

    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        user = await User.create({ email: 'testuser@example.com', password: 'password123' });
        token = jwt.sign({ id: user._id }, 'surajjadhav');
    });
    afterAll(async () => {
        await User.deleteMany();
        await Post.deleteMany();
        await Comment.deleteMany();
        await mongoose.connection.close();
    });

    describe('GET /posts', () => {
        it('should list all posts', async () => {
            const response = await request(app).get('/posts');
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('posts');
            expect(Array.isArray(response.body.posts)).toBe(true);
        });
    });

    describe('POST /posts', () => {
        it('should create a new post when authenticated', async () => {
            const newPost = { title: 'Test Post', content: 'This is a test post' };
            const response = await request(app)
                .post('/posts')
                .set('Authorization', `Bearer ${token}`)
                .send(newPost);
            
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('post');
            postId = response.body.post._id; 
            expect(response.body.post).toMatchObject(newPost);
        });

        it('should return 401 if user is not authenticated', async () => {
            const response = await request(app).post('/posts').send({ title: 'Unauthorized Post' });
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error', 'Unauthorized');
        });
    });

    describe('GET /posts/:id', () => {
        it('should retrieve a single post by ID', async () => {
            const response = await request(app).get(`/posts/${postId}`);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('post');
            expect(response.body.post._id).toBe(postId);
        });
    });

    describe('PUT /posts/:id', () => {
        it('should update a post when authenticated', async () => {
            const updatedPost = { title: 'Updated Test Post', content: 'Updated content' };
            const response = await request(app)
                .put(`/posts/${postId}`)
                .set('Authorization', `Bearer ${token}`)
                .send(updatedPost);

            expect(response.status).toBe(200);
            expect(response.body.post).toMatchObject(updatedPost);
        });

        it('should return 401 if user is not authenticated', async () => {
            const response = await request(app).put(`/posts/${postId}`).send({ title: 'Unauthorized Update' });
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error', 'Unauthorized');
        });
    });

    describe('DELETE /posts/:id', () => {
        it('should delete a post when authenticated', async () => {
            const response = await request(app)
                .delete(`/posts/${postId}`)
                .set('Authorization', `Bearer ${token}`);
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'Post deleted successfully');
        });

        it('should return 401 if user is not authenticated', async () => {
            const response = await request(app).delete(`/posts/${postId}`);
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error', 'Unauthorized');
        });
    });

    describe('POST /posts/:post_id/comments', () => {
        beforeAll(async () => {
            const post = await Post.create({ title: 'Comment Post', content: 'Content for comments', user: user._id });
            postId = post._id;
        });

        it('should add a comment to a post when authenticated', async () => {
            const newComment = { content: 'This is a test comment' };
            const response = await request(app)
                .post(`/posts/${postId}/comments`)
                .set('Authorization', `Bearer ${token}`)
                .send(newComment);

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('comment');
            expect(response.body.comment).toMatchObject(newComment);
            commentId = response.body.comment._id; 
        });

        it('should return 401 if user is not authenticated', async () => {
            const response = await request(app).post(`/posts/${postId}/comments`).send({ content: 'Unauthorized Comment' });
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error', 'Unauthorized');
        });
    });

    describe('GET /posts/:post_id/comments', () => {
        it('should list all comments for a post', async () => {
            const response = await request(app).get(`/posts/${postId}/comments`);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('comments');
            expect(Array.isArray(response.body.comments)).toBe(true);
        });
    });
});