const { listAllPosts } = require('../controllers/post.controller');
const Post = require('../models/Post');
const requireLogin = require('../middlewares/requireLogin');
const jwt = require('jsonwebtoken');

jest.mock('../models/Post');
jest.mock('../middlewares/requireLogin');

const mockUserId = 'user123';
const mockToken = jwt.sign({ id: mockUserId }, 'surajjadhav'); 

describe('listAllPosts', () => {
    beforeEach(() => {
        requireLogin.mockImplementation((req, res, next) => {
            const token = req.headers.authorization.split(" ")[1];
            try {
                const decoded = jwt.verify(token, 'surajjadhav');
                req.user = { id: decoded.id };
                next();
            } catch (error) {
                res.status(401).send({ message: 'Unauthorized' });
            }
        });
    });

    it('should return all posts for an authenticated user with status 200', async () => {
        const mockPosts = [
            { title: "First Post", content: "Content of first post", user: mockUserId },
            { title: "Second Post", content: "Content of second post", user: mockUserId }
        ];
        Post.find.mockResolvedValue(mockPosts);
        const request = {
            headers: { authorization: `Bearer ${mockToken}` }
        };
        const response = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        };
        await listAllPosts(request, response);
        expect(response.status).toHaveBeenCalledWith(200);
        expect(response.send).toHaveBeenCalledWith(mockPosts);
        expect(Post.find).toHaveBeenCalledWith({ user: mockUserId });
    }, 10000);

    it('should return status 500 for server errors', async () => {
        Post.findOne.mockRejectedValue(new Error("Database error"));
        const request = {
            headers: { authorization: `Bearer ${mockToken}` }
        };
        const response = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        };
        await listAllPosts(request, response);
        expect(response.status).toHaveBeenCalledWith(500);
        expect(response.send).toHaveBeenCalledWith({ error: 'Internal Server Error' });
    }, 10000);
});
