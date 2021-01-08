import { bus } from '../bus';

export const ActionType = 'DROP_COLUMN';
type ActionType = typeof ActionType;

export type Action = {
  type: ActionType;
  tableName: string;
  columnName: string;
};

export const reducer = (schema: bus.Schema, action: Action): bus.Schema => {
  const { tableName, columnName } = action;
  bus.utils.assert.tableExists(schema, tableName);
  bus.utils.assert.columnExists(schema, tableName, columnName);

  const table = bus.utils.getTable(schema, tableName);

  const modTables = [...schema.tables];
  modTables[modTables.indexOf(table)] = {
    ...table,
    columns: table.columns.filter(c => c.name !== columnName),
  };
  return {
    ...schema,
    tables: modTables,
  };
};
