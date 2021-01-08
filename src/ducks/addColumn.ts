import { bus } from '../bus';

export const ActionType = 'ADD_COLUMN';
type ActionType = typeof ActionType;

export type Action = {
  type: ActionType;
  tableName: string;
  columnName: string;
  dataType: Exclude<bus.COLUMN, 'uuid' | 'serial'>;
  data: bus.ColumnInput;
};

export const reducer = (schema: bus.Schema, action: Action): bus.Schema => {
  const { tableName, columnName, dataType, data } = action;
  if ((dataType as any) === 'uuid' || (dataType as any) === 'serial')
    throw new Error(`Cannot use addColumn for primary keys.`);

  // if (action.data.notNull === true && action.data.default === undefined) {
  //   throw new Error(`Must provide a default value for non-null column "${action.columnName}".`);
  // }
  bus.utils.assert.noColumn(schema, tableName, columnName);
  const table = bus.utils.getTable(schema, tableName);

  const modTables = [...schema.tables];
  modTables[modTables.indexOf(table)] = {
    ...table,
    columns: [...table.columns, bus.utils.setColumnDefaults({ ...data, name: columnName, type: dataType })],
  };
  return {
    ...schema,
    tables: modTables,
  };
};
