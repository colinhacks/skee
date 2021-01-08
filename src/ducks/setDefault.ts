import { bus } from '../bus';

export const ActionType = 'SET_DEFAULT';
type ActionType = typeof ActionType;

export type Action = {
  type: ActionType;
  tableName: string;
  columnName: string;
  value: string;
};

export const reducer = (schema: bus.Schema, action: Action): bus.Schema => {
  return bus.utils.updateColumn(schema, action.tableName, action.columnName, { default: action.value });
};
