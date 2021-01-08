import { bus } from '../bus';

export const ActionType = 'RENAME_COLUMN';
type ActionType = typeof ActionType;

export type Action = {
  type: ActionType;
  tableName: string;
  columnName: string;
  newColumnName: string;
};

export const reducer = (schema: bus.Schema, action: Action): bus.Schema => {
  // const { tableName, columnName, newColumnName } = action;
  bus.utils.assert.tableExists(schema, action.tableName);
  bus.utils.assert.columnExists(schema, action.tableName, action.columnName);
  const modTables = schema.tables.map((t) => {
    if (t.name !== action.tableName) return t;
    return {
      ...t,
      columns: t.columns.map((c) => ({
        ...c,
        name: c.name === action.columnName ? action.newColumnName : c.name,
      })),
    };
  });
  return {
    ...schema,
    tables: modTables,
  };
};
