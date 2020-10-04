import DataLoader from 'dataloader';
import { Comment } from '../entities/Comment';

export const createCommentLoader = () =>
  new DataLoader<number, Comment>(async commentIds => {
    const comments = await Comment.findByIds(commentIds as number[]);
    const commentIdToComment: Record<number, Comment> = {};

    comments.forEach(p => {
      commentIdToComment[p.id] = p;
    });

    return commentIds.map(commentId => commentIdToComment[commentId]);
  });
