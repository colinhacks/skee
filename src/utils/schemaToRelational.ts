import { bus } from '../bus';

export const schemaToRelational = (schema: bus.Schema): bus.RelationalSchema => {
  const tableStore: {
    [k: string]: bus.RelationalTable;
  } = {};

  const modTables = [...schema.tables];
  const joinTables: string[] = [];

  // adding join tables
  for (const edge of schema.edges.filter((e) => e.kind === 'manyToMany')) {
    joinTables.push(edge.name);
    modTables.push({
      name: edge.name,
      idKey: 'id',
      idType: 'uuid',
      columns: [],
      // isJoinTable: true,
    });
  }

  // copying over existing tables
  for (const table of modTables) {
    const modColumns: bus.RelationalColumn[] = table.columns.map((col) => ({ ...col, primary: false }));

    // adding ID
    modColumns.push({
      name: table.idKey,
      type: table.idType,
      isList: false,
      unique: true,
      notNull: true,
      default: null,
      primary: true,
    });

    // adding createdAt
    // modColumns.push({
    //   name: 'createdAt',
    //   type: bus.COLUMN.datetime,
    //   isList: false,
    //   unique: false,
    //   notNull: true,
    //   default: bus.FUNCTION.now,
    //   primary: false,
    // });

    // adding updatedAt
    // modColumns.push({
    //   name: 'updatedAt',
    //   type: bus.COLUMN.updatedAt,
    //   isList: false,
    //   unique: false,
    //   notNull: true,
    //   default: null,
    //   primary: false,
    // });

    tableStore[table.name] = {
      ...table,
      isJoinTable: joinTables.includes(table.name),
      columns: modColumns,
    };
  }

  // // adding ID, createdAt, updatedAt
  // for (const tableKey in tableStore) {
  //   const table = tableStore[tableKey];

  // }

  // adding foreign key columns
  for (const edge of schema.edges) {
    const start = bus.utils.getTable(schema, edge.start as any)!;
    const end = bus.utils.getTable(schema, edge.end as any)!;

    if (edge.kind === 'manyToMany') {
      tableStore[edge.name].columns.push({
        name: edge.startColumn,
        type: bus.utils.tableToFKType(start),
        default: null,
        unique: false,
        notNull: true,
        isList: false,
        references: [start.name, start.idKey],
        primary: false,
      });

      tableStore[edge.name].columns.push({
        name: edge.endColumn,
        type: bus.utils.tableToFKType(end),
        default: null,
        unique: false,
        notNull: true,
        isList: false,
        references: [end.name, end.idKey],
        primary: false,
      });
    } else if (edge.kind === 'oneToMany') {
      tableStore[edge.end].columns.push({
        name: edge.columnName,
        type: bus.utils.tableToFKType(start),
        default: null,
        unique: false,
        notNull: edge.required,
        isList: false,
        references: [start.name, start.idKey],
        primary: false,
      });
    } else if (edge.kind === 'oneToOne') {
      tableStore[edge.end].columns.push({
        name: edge.columnName,
        type: bus.utils.tableToFKType(start),
        default: null,
        unique: true,
        notNull: edge.required,
        isList: false,
        references: [start.name, start.name],
        primary: false,
      });
    }
  }

  return { tables: Object.values(tableStore) };
};
