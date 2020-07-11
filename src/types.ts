import { bus } from './bus';
import { helperUtil } from './helperUtil';

export type Column = {
  type: bus.COLUMN;
  name: string;
  unique: boolean;
  notNull: boolean;
  default: any;
  // references: [string | number | symbol, string];
  isList: boolean;
};

export type ColumnInput = Partial<Omit<Column, 'name' | 'type'>>; // & Pick<Column, 'type'>;

type BaseEdge = {
  name: string;
  start: string;
  startKey: string;
  end: string;
  endKey: string;
};

export type OneToOneEdge = BaseEdge & {
  kind: 'oneToOne';
  columnName: string;
  required: boolean;
};

export type OneToManyEdge = BaseEdge & {
  kind: 'oneToMany';
  columnName: string;
  required: boolean;
};

export type ManyToManyEdge = BaseEdge & {
  kind: 'manyToMany';
  startColumn: string;
  endColumn: string;
};

export type Edge = OneToOneEdge | OneToManyEdge | ManyToManyEdge;

type EdgeInputOmitKeys = 'start' | 'end' | 'kind' | 'tableName' | 'name';

export type OneToOneEdgeInput = helperUtil.makeOptional<Omit<OneToOneEdge, EdgeInputOmitKeys>, 'required'>;
export type OneToManyEdgeInput = helperUtil.makeOptional<Omit<OneToManyEdge, EdgeInputOmitKeys>, 'required'>;
export type ManyToManyEdgeInput = Omit<ManyToManyEdge, EdgeInputOmitKeys>;

export type EdgeInput =
  | Omit<OneToOneEdge, EdgeInputOmitKeys>
  | Omit<OneToManyEdge, EdgeInputOmitKeys>
  | Omit<ManyToManyEdge, EdgeInputOmitKeys>;

export type Table = {
  name: string;
  idKey: string;
  idType: bus.ID;
  columns: Column[];
  // constraints: Constraint[];
};

// export type Action = object;
export type Constraint = {
  table: string;
  columns: string[];
  kind: 'unique' | 'notnull';
};

export type Commits = { name: string }[];

export type Schema = {
  commits: Commits;
  // actions: bus.Action[];
  tables: bus.Table[];
  edges: bus.Edge[];
};

// export type Schema = {
//   versions: {[k:string]:};
//   tables: Table[];
//   edges: Edge[];
// };

// export type AddTable<S extends Schema, Name extends string> = helperUtil.format<{
//   tables: S['tables'] & { [k in Name]: {} };
//   relations: S['relations'];
// }>;

// export type AddColumn<
//   S extends Schema,
//   TableName extends keyof S['tables'],
//   ColumnName extends string,
//   ColumnData extends Column
// > = tb.Object.P.Update<S, ['tables', TableName, 'columns', ColumnName], ColumnData>;

// references: [string | number | symbol, string];

export type RelationalColumn = Column & { references?: [string, string]; primary: boolean };
export type RelationalTable = Omit<Table, 'columns' | 'idKey' | 'idType'> & {
  columns: RelationalColumn[];
  isJoinTable: boolean;
};
export type RelationalSchema = { tables: RelationalTable[] };

export type OOPField = {
  key: string;
  type: bus.COLUMN;
  isList: boolean;
  notNull: boolean;
};

export type OOPRelation = {
  key: string;
  related: string;
  edgeName: string;
  isList: boolean;
  notNull: boolean;
};

export type OOPModel = {
  name: string;
  fields: OOPField[];
  relations: OOPRelation[];
};
export type OOPSchema = { models: OOPModel[] };

export type DB = {
  db: string;
  url: string;
};

export const genDefault: { [k in bus.COLUMN]: () => any } = {
  bigint: () => BigInt(Math.round(100000000000 * Math.random())),
  boolean: () => Math.random() < 0.5,
  text: () => Math.random().toString(),
  integer: () => Math.round(10000000 * Math.random()),
  float: () => 10000000 * Math.random(),
  double: () => 10000000 * Math.random(),
  datetime: () => new Date(),
  serial: () => {
    throw new Error("Can't generate default for serial.");
  },
  uuid: () => {
    throw new Error("Can't generate default for uuid.");
  },
  updatedAt: () => new Date(),
};
