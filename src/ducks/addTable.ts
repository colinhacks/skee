import { bus } from '../bus';

export const ActionType = 'ADD_TABLE';
type ActionType = typeof ActionType;

export type Action = { type: ActionType; name: string; idType: bus.ID; idKey: string };

export const reducer = (schema: bus.Schema, action: Action): bus.Schema => {
  const { name, idType, idKey } = action;
  bus.utils.assert.noTableWithName(schema, name as any);
  return {
    ...schema,
    tables: [...schema.tables, { name, idKey: idKey, idType: idType, columns: [] }],
  };
};
