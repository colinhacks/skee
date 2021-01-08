import { bus } from '../bus';

export const ActionType = 'CREATE_INDEX';
type ActionType = typeof ActionType;

export type Action = {
  type: ActionType;
  tableName: string;
  columnNames: string[];
};

export const reducer = (schema: bus.Schema, action: Action): bus.Schema => {
  return bus.utils.addIndex(
    schema,
    'index',
    action.tableName,
    action.columnNames,
  );
};
