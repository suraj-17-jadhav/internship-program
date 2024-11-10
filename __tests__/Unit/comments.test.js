const { readSingleComment, updateComment, deleteComment } = require('../../controllers/comment.controller');
const Comment = require('../../models/Comment'); 

jest.mock('../../middleware/requireLogin', () => jest.fn((req, res, next) => {
    req.user = { id: 'user123' };
    next();
}));

describe('Comment Controller', () => {
    let req, res;
    beforeEach(() => {
        req = { params: { id: 'commentId123' }, user: { id: 'user123' }, body: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };
        jest.clearAllMocks();
    });

    describe('readSingleComment', () => {
        it('should return a single comment if found', async () => {
            const mockComment = { _id: 'commentId123', content: 'This is a test comment' };
            jest.spyOn(Comment, 'findById').mockResolvedValue(mockComment);

            await readSingleComment(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith(mockComment);
        });

        it('should return 404 if comment is not found', async () => {
            jest.spyOn(Comment, 'findById').mockResolvedValue(null);

            await readSingleComment(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.send).toHaveBeenCalledWith({ error: 'Comment not found' });
        });

        it('should return 500 for server errors', async () => {
            jest.spyOn(Comment, 'findById').mockRejectedValue(new Error('Database error'));

            await readSingleComment(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({ error: 'Server error' });
        });
    });

    describe('updateComment', () => {
        it('should update a comment for an authenticated user', async () => {
            req.body.content = 'Updated content';
            const mockComment = { _id: 'commentId123', content: 'This is a test comment', user: req.user.id };
            jest.spyOn(Comment, 'findById').mockResolvedValue(mockComment);
            jest.spyOn(mockComment, 'save').mockResolvedValue({
                ...mockComment,
                content: 'Updated content'
            });

            await updateComment(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({ message: 'Comment updated successfully', updatedComment: { ...mockComment, content: 'Updated content' } });
        });

        it('should return 401 if user is not the comment owner', async () => {
            const mockComment = { _id: 'commentId123', content: 'This is a test comment', user: 'anotherUserId' };
            jest.spyOn(Comment, 'findById').mockResolvedValue(mockComment);

            await updateComment(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.send).toHaveBeenCalledWith({ error: 'Unauthorized' });
        });

        it('should return 500 for server errors', async () => {
            jest.spyOn(Comment, 'findById').mockRejectedValue(new Error('Database error'));

            await updateComment(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({ error: 'Server error' });
        });
    });

    describe('deleteComment', () => {
        it('should delete a comment for an authenticated user', async () => {
            const mockComment = { _id: 'commentId123', content: 'This is a test comment', user: req.user.id };
            jest.spyOn(Comment, 'findById').mockResolvedValue(mockComment);
            jest.spyOn(Comment, 'deleteOne').mockResolvedValue({ deletedCount: 1 });

            await deleteComment(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({ message: 'Comment deleted successfully' });
        });

        it('should return 401 if user is not the comment owner', async () => {
            const mockComment = { _id: 'commentId123', content: 'This is a test comment', user: 'anotherUserId' };
            jest.spyOn(Comment, 'findById').mockResolvedValue(mockComment);

            await deleteComment(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.send).toHaveBeenCalledWith({ error: 'Unauthorized' });
        });

        it('should return 404 if comment is not found', async () => {
            jest.spyOn(Comment, 'findById').mockResolvedValue(null);

            await deleteComment(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.send).toHaveBeenCalledWith({ error: 'Comment not found' });
        });

        it('should return 500 for server errors', async () => {
            jest.spyOn(Comment, 'findById').mockRejectedValue(new Error('Database error'));

            await deleteComment(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({ error: 'Server error' });
        });
    });
});
