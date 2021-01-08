import { bus } from '../bus';
import { utils } from '../internal';

export const ActionType = 'DROP_INDEX';
type ActionType = typeof ActionType;

export type Action = {
  type: ActionType;
  tableName: string;
  columnNames: string[];
};

export const reducer = (schema: bus.Schema, action: Action): bus.Schema => {
  const idxName = utils.generateName({
    kind: 'index',
    table: action.tableName,
    columns: action.columnNames,
  });
  return bus.utils.dropIndex(schema, action.tableName, idxName);
};
