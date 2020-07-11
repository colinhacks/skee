import { bus } from '../bus';

export const ActionType = 'DROP_DEFAULT';
type ActionType = typeof ActionType;

export type Action = {
  type: ActionType;
  tableName: string;
  columnName: string;
};

export const reducer = (schema: bus.Schema, action: Action): bus.Schema => {
  return bus.utils.updateColumn(schema, action.tableName, action.columnName, { default: null });
};
