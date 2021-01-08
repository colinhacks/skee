import { bus } from '../bus';

export const ActionType = 'ADD_MANY_TO_MANY_EDGE';
type ActionType = typeof ActionType;

export type Action = {
  type: ActionType;
  start: string;
  end: string;
  name: string;
  params: bus.ManyToManyEdgeInput;
};

export const reducer = (schema: bus.Schema, action: Action): bus.Schema => {
  const { start, end, name, params } = action;
  bus.utils.assert.noEdge(schema, name);
  return bus.utils.addEdge(schema, {
    ...params,
    name,
    start,
    end,
    kind: bus.EDGE.manyToMany,
  });
};
