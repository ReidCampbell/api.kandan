import { Comment } from '../entities/Comment';
import DataLoader from 'dataloader';

export const createCommentLoader = () =>
  new DataLoader<
    { postId?: number; commentId?: number; userId: number },
    Comment | null
  >(async keys => {
    const comments = await Comment.findByIds(keys as any);
    const commentIdsToComment: Record<string, Comment> = {};
    comments.forEach(comment => {
      commentIdsToComment[`${comment.creatorId}|${comment.postId}`] = comment;
    });

    return keys.map(
      key => commentIdsToComment[`${key.userId}|${key.postId}|${key.commentId}`]
    );
  });
