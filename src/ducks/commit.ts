import { bus } from '../bus';

export const ActionType = 'ADD_COMMIT';
type ActionType = typeof ActionType;

export type Action = { type: ActionType; name: string };

export const reducer = (schema: bus.Schema, action: Action): bus.Schema => {
  const { name } = action;
  if (schema.commits.map((c) => c.name).includes(name)) {
    throw new Error(`There's already a commit named "${name}". Commit names must be unique.`);
  }
  return {
    ...schema,
    commits: [...schema.commits, { name: name }],
  };
};
