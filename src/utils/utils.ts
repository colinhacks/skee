import { bus } from '../bus';

export * from './columnConversion';
export * from '../mapping/toRelational';
export * from '../mapping/toOOP';

type CxData =
  | {
      kind: 'unique';
      table: string;
      columns: string[];
    }
  | {
      kind: 'foreign';
      referencing: string;
      referenced: string;
      fkColumn: string;
    }
  | {
      kind: 'index';
      table: string;
      columns: string[];
    };
export const generateName = (cx: CxData): string => {
  if (cx.kind === 'unique') {
    return `${cx.table}_${cx.columns.sort().join('_')}_unique_cx`;
  } else if (cx.kind === 'foreign') {
    return `${cx.referencing}_${cx.fkColumn}_references_${cx.referenced}_cx`;
  } else if (cx.kind === 'index') {
    return `${cx.table}_${cx.columns.sort().join('_')}_idx`;
  }
  return '';
};

export const assert = {
  tableExists: (schema: bus.Schema, table: string) => {
    if (!schema.tables.find(t => t.name === table)) {
      throw new Error(`Table "${table}" does not exist.`);
    }
  },
  columnExists: (schema: bus.Schema, table: string, column: string) => {
    const t = schema.tables.find(t => t.name === table);
    if (!t) throw new Error(`Table "${table}" does not exist.`);

    const c = t.columns.find(col => col.name === column);
    if (!c) throw new Error(`Column "${table}.${column}" does not exist.`);
  },
  noTableWithName: (schema: bus.Schema, table: string) => {
    if (schema.tables.find(t => t.name === table)) {
      throw new Error(`Table "${table}" already exists.`);
    }
  },
  noEdge: (schema: bus.Schema, edge: string) => {
    if (schema.edges.find(e => e.name === edge)) {
      throw new Error(`Edge "${edge}" already exists.`);
    }
  },
  noColumn: (schema: bus.Schema, tableName: string, columnName: string) => {
    const table = getTable(schema, tableName);
    if (table.columns.find(col => col.name === columnName))
      throw new Error(
        `Column "${columnName}" in table "${tableName}" already exists`,
      );
  },
};

export const getTable = (schema: bus.Schema, tableName: string): bus.Table => {
  assert.tableExists(schema, tableName);
  return schema.tables.find(t => t.name === tableName)!;
};

export const getColumn = (
  schema: bus.Schema,
  tableName: string,
  columnName: string,
): bus.Column => {
  assert.tableExists(schema, tableName);
  assert.columnExists(schema, tableName, columnName);
  return schema.tables
    .find(t => t.name === tableName)!
    .columns.find(c => c.name === columnName)!;
};

export const updateColumn = (
  schema: bus.Schema,
  tableName: string,
  columnName: string,
  updates: Partial<bus.Column>,
): bus.Schema => {
  assert.tableExists(schema, tableName);
  assert.columnExists(schema, tableName, columnName);

  return {
    ...schema,
    tables: schema.tables.map(t => {
      if (t.name !== tableName) return t;
      return {
        ...t,
        columns: t.columns.map(c => {
          if (c.name !== columnName) return c;
          return { ...c, ...updates };
        }),
      };
    }),
  };
};

export const addConstraint = (
  schema: bus.Schema,
  kind: 'unique',
  table: string,
  columns: string[],
): bus.Schema => {
  assert.tableExists(schema, table);
  for (const columnName of columns) {
    assert.columnExists(schema, table, columnName);
  }

  const cxName = generateName({ kind, table, columns });

  return {
    ...schema,
    tables: schema.tables.map(t => {
      if (t.name !== table) return t;
      return {
        ...t,
        constraints: [
          ...t.constraints,
          {
            name: cxName,
            columns,
            kind: kind,
          },
        ],
      };
    }),
  };
};

export const dropConstraint = (
  schema: bus.Schema,
  table: string,
  cxName: string,
): bus.Schema => {
  assert.tableExists(schema, table);

  return {
    ...schema,
    tables: schema.tables.map(t => {
      if (t.name !== table) return t;
      return {
        ...t,
        constraints: t.constraints.filter(cx => cx.name === cxName),
      };
    }),
  };
};

export const addIndex = (
  schema: bus.Schema,
  kind: 'index',
  table: string,
  columns: string[],
): bus.Schema => {
  assert.tableExists(schema, table);
  for (const columnName of columns) {
    assert.columnExists(schema, table, columnName);
  }

  const idxName = generateName({ kind, table, columns });

  return {
    ...schema,
    tables: schema.tables.map(t => {
      if (t.name !== table) return t;
      return {
        ...t,
        indexes: [
          ...t.indexes,
          {
            name: idxName,
            columns,
            kind: kind,
          },
        ],
      };
    }),
  };
};

export const dropIndex = (
  schema: bus.Schema,
  table: string,
  idxName: string,
): bus.Schema => {
  assert.tableExists(schema, table);

  return {
    ...schema,
    tables: schema.tables.map(t => {
      if (t.name !== table) return t;
      return {
        ...t,
        indexes: t.indexes.filter(idx => idx.name === idxName),
      };
    }),
  };
};

export const getEdge = (schema: bus.Schema, edgeName: string): bus.Edge => {
  const edge = schema.edges.find(e => e.name === edgeName) || null;
  if (!edge) throw new Error(`Table "${edgeName}" doesn't exist.`);
  return edge;
};

export const getIdType = (schema: bus.Schema, table: string) => {
  const keyTypeMap = {
    uuid: 'UUID',
    serial: 'INTEGER',
  };
  const t = schema.tables.find(x => x.name === table);
  if (!t) throw new Error(`No table "${table}" found.`);
  const keyType = keyTypeMap[t.idType];
  if (!keyType) throw new Error(`Unknown ID column type "${t.idType}"`);
  return keyType;
};

// export const getCommit = (schema: bus.Schema, name: string): bus.Schema => {
//   // schema.
//   const commitIndex =
//   if (!schema.commits.map((c) => c.name).includes(name)) throw new Error(`Commit "${name}" does not exist.`);
//   // compute schema
//   return schema.commits[name as any] as any;
// };

export const addEdge = (schema: bus.Schema, edge: bus.Edge): bus.Schema => {
  bus.utils.assert.noEdge(schema, edge.name);
  return {
    ...schema,
    edges: [...schema.edges, edge],
  };
};

export const setColumnDefaults = (data: Partial<bus.Column>) => {
  if (!data.name) throw new Error();
  if (!data.type) throw new Error();
  return {
    name: data.name,
    type: data.type,
    default: data.default !== undefined ? data.default : null,
    unique: data.unique || false,
    notNull: data.notNull || false,
    isList: data.isList || false,
  };
};

export function assertNever(_x: never): never {
  throw new Error();
}
