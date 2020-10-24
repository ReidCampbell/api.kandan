import DataLoader from 'dataloader';
import { KandanColumn } from '../entities/KandanColumn';

export const createKandanColumnLoader = () =>
  new DataLoader<number, KandanColumn>(async kandanColumnIds => {
    const kandanColumns = await KandanColumn.findByIds(
      kandanColumnIds as number[]
    );
    const kandanColumnIdToKandanColumn: Record<number, KandanColumn> = {};

    kandanColumns.forEach(u => {
      kandanColumnIdToKandanColumn[u.id] = u;
    });

    return kandanColumnIds.map(
      kandanColumnId => kandanColumnIdToKandanColumn[kandanColumnId]
    );
  });
