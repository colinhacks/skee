import { bus } from '../bus';

export const ActionType = 'RENAME_TABLE';
type ActionType = typeof ActionType;

export type Action = { type: ActionType; oldTableName: string; newTableName: string };

export const reducer = (schema: bus.Schema, action: Action): bus.Schema => {
  const { oldTableName, newTableName } = action;
  bus.utils.assert.tableExists(schema, oldTableName);
  bus.utils.assert.noTableWithName(schema, newTableName as any);

  // update table name
  const newTables = [...schema.tables];
  const oldTable = newTables.find((t) => t.name === oldTableName)!;
  newTables[newTables.indexOf(oldTable)] = { ...oldTable, name: newTableName };

  // update table name in edges
  const newEdges = schema.edges.map((edge) => {
    // console.log(edge);
    return {
      ...edge,
      start: edge.start === oldTableName ? newTableName : edge.start,
      end: edge.end === oldTableName ? newTableName : edge.end,
    };
  });

  return {
    ...schema,
    tables: newTables,
    edges: newEdges,
  };
};
