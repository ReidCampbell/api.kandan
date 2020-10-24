import DataLoader from 'dataloader';
import { Board } from '../entities/Board';

export const createBoardLoader = () =>
  new DataLoader<number, Board>(async boardIds => {
    const boards = await Board.findByIds(boardIds as number[]);
    const boardIdToBoard: Record<number, Board> = {};

    boards.forEach(u => {
      boardIdToBoard[u.id] = u;
    });

    return boardIds.map(boardId => boardIdToBoard[boardId]);
  });
