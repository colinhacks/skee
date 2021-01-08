import { bus } from '../bus';

export const idColumnToColumnType = (col: bus.Column) => {
  if (col.type === bus.COLUMN.uuid) return bus.COLUMN.text;
  if (col.type === bus.COLUMN.serial) return bus.COLUMN.integer;
  throw new Error('Id column must be either serial or UUID.');
};

export const tableToFKType = (table: bus.Table) => {
  if (table.idType === bus.COLUMN.uuid) return bus.COLUMN.text;
  if (table.idType === bus.COLUMN.serial) return bus.COLUMN.integer;
  throw new Error('Id column must be either serial or UUID.');
};
