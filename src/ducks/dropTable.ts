import { bus } from '../bus';

export const ActionType = 'DROP_TABLE';
type ActionType = typeof ActionType;

export type Action = { type: ActionType; name: string };

export const reducer = (schema: bus.Schema, action: Action): bus.Schema => {
  bus.utils.assert.tableExists(schema, action.name);
  for (const e of schema.edges) {
    if (e.start === action.name)
      throw new Error(
        `Table "${action.name}" is referenced by relation "${e.name}". Can't drop table until all relations have been removed.`,
      );
    if (e.end === action.name)
      throw new Error(
        `Table "${action.name}" is referenced by relation "${e.name}". Can't drop table until all relations have been removed.`,
      );
  }

  return {
    ...schema,
    tables: schema.tables.filter((t) => t.name !== action.name),
  };
};
