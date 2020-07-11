import { bus } from '../bus';

// rules
// - only one db connection: no pools;
// - implement all methods
// - escape all identifiers: should be case-sensitive
// -

export abstract class Migrator {
  abstract addTable: (action: bus.ducks.addTable.Action) => Promise<boolean>;
  abstract dropTable: (action: bus.ducks.dropTable.Action) => Promise<boolean>;
  abstract renameTable: (action: bus.ducks.renameTable.Action) => Promise<boolean>;
  abstract addColumn: (action: bus.ducks.addColumn.Action) => Promise<boolean>;
  abstract dropColumn: (action: bus.ducks.dropColumn.Action) => Promise<boolean>;
  abstract renameColumn: (action: bus.ducks.renameColumn.Action) => Promise<boolean>;
  abstract setDefault: (action: bus.ducks.setDefault.Action) => Promise<boolean>;
  abstract dropDefault: (action: bus.ducks.dropDefault.Action) => Promise<boolean>;
  abstract oneToOne: (action: bus.ducks.oneToOne.Action, schema: bus.Schema) => Promise<boolean>;
  abstract oneToMany: (action: bus.ducks.oneToMany.Action, schema: bus.Schema) => Promise<boolean>;
  abstract manyToMany: (action: bus.ducks.manyToMany.Action, schema: bus.Schema) => Promise<boolean>;
  abstract commit: (action: bus.ducks.commit.Action) => Promise<boolean>;
  abstract initialize: () => Promise<boolean>;
  abstract toDefault: (defaultValue: any) => string;
  abstract toLiteral: (defaultValue: any) => string;
  abstract toId: (defaultValue: any) => string;
  abstract getCommits: () => Promise<{ name: string; created_at: Date }[]>;
  abstract beginTransaction: () => Promise<void>;
  abstract commitTransaction: () => Promise<void>;
  abstract rollbackTransaction: () => Promise<void>;
}
