import DataLoader from 'dataloader';
import { Reply } from '../entities/Reply';

export const createReplyLoader = () =>
  new DataLoader<number, Reply>(async replyIds => {
    const replys = await Reply.findByIds(replyIds as number[]);
    const replyIdToReply: Record<number, Reply> = {};

    replys.forEach(p => {
      replyIdToReply[p.id] = p;
    });

    return replyIds.map(replyId => replyIdToReply[replyId]);
  });
