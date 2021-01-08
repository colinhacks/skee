import { bus } from '../bus';

export const ActionType = 'SET_UNIQUE';
type ActionType = typeof ActionType;

export type Action = {
  type: ActionType;
  tableName: string;
  columnNames: string[];
};

export const reducer = (schema: bus.Schema, action: Action): bus.Schema => {
  return bus.utils.addConstraint(
    schema,
    'unique',
    action.tableName,
    action.columnNames,
  );
};
