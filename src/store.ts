import { bus } from './bus';

export type Action =
  | bus.ducks.addTable.Action
  | bus.ducks.dropTable.Action
  | bus.ducks.renameTable.Action
  | bus.ducks.addColumn.Action
  | bus.ducks.dropColumn.Action
  | bus.ducks.renameColumn.Action
  | bus.ducks.setDefault.Action
  | bus.ducks.dropDefault.Action
  | bus.ducks.setNotNull.Action
  | bus.ducks.dropNotNull.Action
  | bus.ducks.setUnique.Action
  | bus.ducks.dropUnique.Action
  | bus.ducks.createIndex.Action
  | bus.ducks.dropIndex.Action
  | bus.ducks.oneToOne.Action
  | bus.ducks.oneToMany.Action
  | bus.ducks.manyToMany.Action
  | bus.ducks.commit.Action;

// | bus.ducks.setDefault.Action
// | bus.ducks.dropDefault.Action
// | bus.ducks.setNotNull.Action
// | bus.ducks.dropNotNull.Action
// | bus.ducks.setUnique.Action
// | bus.ducks.dropUnique.Action
// | bus.ducks.createIndex.Action
// | bus.ducks.dropIndex.Action;

export const defaultState: bus.Schema = { tables: [], edges: [], commits: [] };

export const dispatch = (state: bus.Schema = defaultState, action: Action) => {
  // console.log(`action: ${action.type}`);
  switch (action.type) {
    case bus.ducks.addTable.ActionType:
      return bus.ducks.addTable.reducer(state, action);

    case bus.ducks.dropTable.ActionType:
      return bus.ducks.dropTable.reducer(state, action);

    case bus.ducks.renameTable.ActionType:
      return bus.ducks.renameTable.reducer(state, action);

    case bus.ducks.addColumn.ActionType:
      return bus.ducks.addColumn.reducer(state, action);

    case bus.ducks.dropColumn.ActionType:
      return bus.ducks.dropColumn.reducer(state, action);

    case bus.ducks.renameColumn.ActionType:
      return bus.ducks.renameColumn.reducer(state, action);

    case bus.ducks.oneToOne.ActionType:
      return bus.ducks.oneToOne.reducer(state, action);

    case bus.ducks.setDefault.ActionType:
      return bus.ducks.setDefault.reducer(state, action);

    case bus.ducks.dropDefault.ActionType:
      return bus.ducks.dropDefault.reducer(state, action);

    case bus.ducks.setNotNull.ActionType:
      return bus.ducks.setNotNull.reducer(state, action);
    case bus.ducks.dropNotNull.ActionType:
      return bus.ducks.dropNotNull.reducer(state, action);
    case bus.ducks.setUnique.ActionType:
      return bus.ducks.setUnique.reducer(state, action);
    case bus.ducks.dropUnique.ActionType:
      return bus.ducks.dropUnique.reducer(state, action);
    case bus.ducks.createIndex.ActionType:
      return bus.ducks.createIndex.reducer(state, action);
    case bus.ducks.dropIndex.ActionType:
      return bus.ducks.dropIndex.reducer(state, action);

    case bus.ducks.oneToMany.ActionType:
      return bus.ducks.oneToMany.reducer(state, action);

    case bus.ducks.manyToMany.ActionType:
      return bus.ducks.manyToMany.reducer(state, action);

    case bus.ducks.commit.ActionType:
      return bus.ducks.commit.reducer(state, action);

    default:
      // const t: typeof
      bus.utils.assertNever(action);
      return state;
  }
};

export const actionsToSchema = (actions: Action[]): bus.Schema => {
  return actions.reduce((a, b) => bus.store.dispatch(a, b), defaultState);
};
