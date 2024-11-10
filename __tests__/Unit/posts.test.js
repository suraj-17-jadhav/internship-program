const { listAllPosts, createPost, readSinglePost, updatePost, deletePost } = require('../../controllers/post.controller');
const { addCommentToPost, readCommentsOfPost } = require('../../controllers/comment.controller');
const Post = require('../../models/Post');
const Comment = require('../../models/Comment');
const requireLogin = require('../../middlewares/requireLogin');
const jwt = require('jsonwebtoken');

jest.mock('../../models/Post');
jest.mock('../../models/Comment');
jest.mock('../../middlewares/requireLogin');

const mockUserId = 'user123';
const mockToken = jwt.sign({ id: mockUserId }, 'surajjadhav');

describe('Post Controller', () => {
    let req, res;

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

        req = {
            headers: { authorization: `Bearer ${mockToken}` },
            params: {},
            body: {}
        };

        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };

        jest.clearAllMocks();
    });

    describe('listAllPosts', () => {
        it('should return all posts for an authenticated user with status 200', async () => {
            const mockPosts = [
                { title: "First Post", content: "Content of first post", user: mockUserId },
                { title: "Second Post", content: "Content of second post", user: mockUserId }
            ];
            Post.find.mockResolvedValue(mockPosts);

            await listAllPosts(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith(mockPosts);
            expect(Post.find).toHaveBeenCalledWith({ user: mockUserId });
        });

        it('should return status 500 for server errors', async () => {
            Post.find.mockRejectedValue(new Error("Database error"));
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

    describe('createPost', () => {
        it('should create a new post for an authenticated user with status 201', async () => {
            req.body = { title: 'New Post', content: 'Post content' };
            const mockPost = { ...req.body, user: mockUserId };
            Post.create.mockResolvedValue(mockPost);

            await createPost(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.send).toHaveBeenCalledWith(mockPost);
        });

        it('should return 500 for server errors during post creation', async () => {
            Post.create.mockRejectedValue(new Error("Database error"));

            await createPost(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({ error: 'Internal Server Error' });
        });
    });

    describe('readSinglePost', () => {
        it('should return a single post by ID with status 200', async () => {
            req.params.id = 'postId123';
            const mockPost = { _id: req.params.id, title: 'Single Post', content: 'Content of post' };
            Post.findById.mockResolvedValue(mockPost);

            await readSinglePost(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith(mockPost);
        });

        it('should return 404 if post is not found', async () => {
            Post.findById.mockResolvedValue(null);

            await readSinglePost(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.send).toHaveBeenCalledWith({ error: 'Post not found' });
        });
    });

    describe('updatePost', () => {
        it('should update a post for an authenticated user', async () => {
            req.params.id = 'postId123';
            req.body = { title: 'Updated Title', content: 'Updated Content' };
            const mockPost = { _id: req.params.id, user: mockUserId, ...req.body };
            Post.findById.mockResolvedValue(mockPost);
            jest.spyOn(mockPost, 'save').mockResolvedValue(mockPost);

            await updatePost(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({ message: 'Post updated successfully', updatedPost: mockPost });
        });
    });

    describe('deletePost', () => {
        it('should delete a post for an authenticated user', async () => {
            req.params.id = 'postId123';
            const mockPost = { _id: req.params.id, user: mockUserId };
            Post.findById.mockResolvedValue(mockPost);
            Post.deleteOne.mockResolvedValue({ deletedCount: 1 });

            await deletePost(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({ message: 'Post deleted successfully' });
        });
    });
});

describe('Comment Controller', () => {
    describe('addCommentToPost', () => {
        it('should add a comment to a post for an authenticated user', async () => {
            req.params.post_id = 'postId123';
            req.body = { content: 'This is a comment' };
            const mockComment = { ...req.body, user: mockUserId, post: req.params.post_id };
            Comment.create.mockResolvedValue(mockComment);

            await addCommentToPost(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.send).toHaveBeenCalledWith(mockComment);
        });
    });

    describe('readCommentsOfPost', () => {
        it('should return all comments for a given post', async () => {
            req.params.post_id = 'postId123';
            const mockComments = [
                { content: 'Comment 1', user: mockUserId, post: req.params.post_id },
                { content: 'Comment 2', user: mockUserId, post: req.params.post_id }
            ];
            Comment.find.mockResolvedValue(mockComments);

            await readCommentsOfPost(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith(mockComments);
        });
    });
});
