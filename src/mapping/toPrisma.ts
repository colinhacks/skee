import { bus } from '../bus';

export type ToPrismaConfig = {
  datasource: { provider: string; url: string };
};

const typeToPrisma = {
  text: 'String',
  integer: 'Int',
  float: 'Float',
  double: 'Float',
  decimal: 'Float',
  bigint: 'Int',
  boolean: 'Boolean',
  datetime: 'DateTime',
  updatedAt: 'DateTime',
  serial: 'Int',
  uuid: 'String',
} as const;

export const toPrisma = (schema: bus.Schema) => (): { file: string } => {
  console.log(schema);
  // const oop = schema.to.oopSchema();
  const { edges } = schema;
  const lines: { [k: string]: string[] } = {};

  const tables = bus.utils.toRelational(schema).tables; // schema.to.relationalSchema().tables;

  // generate fields
  for (const table of tables) {
    // skip join tables (managed by Prisma)
    if (table.isJoinTable) continue;

    lines[table.name] = [];

    const fieldLines = table.columns.map((col) => {
      const baseType = typeToPrisma[col.type];
      const arrayMod = col.isList ? '[]' : '';
      const nullMod = col.notNull ? '' : '?';
      const updatedAtMod = col.type === 'updatedAt' ? ' @updatedAt' : '';
      const idMod = [bus.COLUMN.uuid, bus.COLUMN.serial].includes(
        col.type as any,
      )
        ? ' @id'
        : '';
      const uniqueMod = col.unique && !idMod ? ' @unique' : '';

      const defMod =
        col.type === 'uuid'
          ? 'uuid()'
          : col.type === 'serial'
          ? 'autoincrement()'
          : col.default === bus.FUNCTION.uuidv1
          ? 'uuid()'
          : col.default === bus.FUNCTION.uuidv4
          ? 'uuid()'
          : col.default === bus.FUNCTION.now
          ? 'now()'
          : typeof col.default === 'string'
          ? `"${col.default}"`
          : col.default || null;

      return `${col.name} ${baseType}${arrayMod}${nullMod}${idMod}${uniqueMod}${
        defMod ? ` @default(${defMod})` : ''
      }${updatedAtMod}`;
    });
    lines[table.name].push(...fieldLines);
  }

  for (const edge of edges) {
    let startLine = '';
    let endLine = '';

    const start = bus.utils.getTable(schema, edge.start);
    const end = bus.utils.getTable(schema, edge.end);

    // generate Prisma relations
    if (edge.kind === 'oneToOne') {
      // edge
      if (edge.required) {
        throw new Error(
          'One-to-one relations cannot be required in Prisma: https://github.com/prisma/prisma/releases/tag/2.12.0',
        );
      }
      const reqMod = edge.required ? '' : '?';
      startLine = `${edge.startKey} ${edge.end}? @relation("${edge.name}")`;
      endLine = `${edge.endKey} ${edge.start}${reqMod} @relation("${edge.name}", fields: [${edge.columnName}], references: [${start.idKey}])`;
      // endScalarLine = `${edge.columnName} ${}`
    } else if (edge.kind === 'oneToMany') {
      const reqMod = edge.required ? '' : '?';

      startLine = `${edge.startKey} ${edge.end}[] @relation("${edge.name}")`;
      endLine = `${edge.endKey} ${edge.start}${reqMod} @relation("${edge.name}", fields: [${edge.columnName}], references: [${start.idKey}])`;
    } else if (edge.kind === 'manyToMany') {
      if (edge.name.slice(0, 1) !== '_')
        throw new Error(
          'First character of join table name must be an underscore. Read their documentation at https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-schema/relations#conventions-for-relation-tables-in-implicit-m-n-relations to learn more.',
        );
      startLine = `${edge.startKey} ${edge.end}[] @relation("${edge.name.slice(
        1,
      )}", references: [${end.idKey}])`;
      endLine = `${edge.endKey} ${edge.start}[] @relation("${edge.name.slice(
        1,
      )}", references: [${start.idKey}])`;
    }
    lines[edge.start] = [...lines[edge.start], startLine];
    lines[edge.end] = [...lines[edge.end], endLine];
    // if(endScalarLine)lines[edge.end] = [...lines[edge.end], endScalarLine];
  }

  const prisma = Object.keys(lines)
    .map((modelName) => {
      return `model ${modelName} {\n${lines[modelName]
        .map((line) => `  ${line}`)
        .join('\n')}\n}`;
    })
    .join('\n\n');

  //   const file = `datasource db {
  //   provider = "${config.datasource.provider}"
  //   url      = "${config.datasource.url}"
  // }

  // ${prisma}

  // generator client {
  //   provider = "prisma-client-js"
  // }`;
  return { file: prisma };
};
