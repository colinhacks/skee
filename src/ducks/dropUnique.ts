import { bus } from '../bus';
import { utils } from '../internal';

export const ActionType = 'DROP_UNIQUE';
type ActionType = typeof ActionType;

export type Action = {
  type: ActionType;
  tableName: string;
  columnNames: string[];
};

export const reducer = (schema: bus.Schema, action: Action): bus.Schema => {
  const cxName = utils.generateName({
    kind: 'unique',
    table: action.tableName,
    columns: action.columnNames,
  });
  return bus.utils.dropConstraint(schema, action.tableName, cxName);
};
