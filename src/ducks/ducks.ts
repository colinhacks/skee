import * as addTable from './addTable';
import * as dropTable from './dropTable';
import * as renameTable from './renameTable';
import * as addColumn from './addColumn';
import * as dropColumn from './dropColumn';
import * as renameColumn from './renameColumn';
import * as setDefault from './setDefault';
import * as dropDefault from './dropDefault';
import * as setNotNull from './setNotNull';
import * as dropNotNull from './dropNotNull';
import * as setUnique from './setUnique';
import * as dropUnique from './dropUnique';
import * as createIndex from './createIndex';
import * as dropIndex from './dropIndex';
import * as oneToOne from './oneToOne';
import * as oneToMany from './oneToMany';
import * as manyToMany from './manyToMany';

import * as commit from './commit';

export {
  addTable,
  dropTable,
  renameTable,
  addColumn,
  dropColumn,
  renameColumn,
  setDefault,
  dropDefault,
  setNotNull,
  dropNotNull,
  setUnique,
  dropUnique,
  createIndex,
  dropIndex,
  oneToOne,
  oneToMany,
  manyToMany,
  commit,
};

// export const addTable = (
//   schema: bus.Schema,
//   name: string,
//   params: { idType?: bus.ID; idKey?: string } = {},
// ): bus.Schema => {
//   bus.utils.assert.noTableWithName(schema, name as any);
//   return {
//     ...schema,
//     tables: [
//       ...schema.tables,
//       { name, idKey: params.idKey || 'id', idType: params.idType || bus.COLUMN.uuid, columns: [] },
//     ],
//   };
// };

// export const addColumn = (
//   schema: bus.Schema,
//   tableName: string,
//   columnName: string,
//   dataType: Exclude<bus.COLUMN, 'uuid' | 'serial'>,
//   data: bus.ColumnInput = {},
// ): bus.Schema => {
//   if ((dataType as any) === 'uuid' || (dataType as any) === 'serial')
//     throw new Error(`Cannnot use addColumn for primary keys.`);
//   bus.utils.assert.noColumn(schema, tableName, columnName);
//   const table = bus.utils.getTable(schema, tableName);

//   const modTables = [...schema.tables];
//   modTables[modTables.indexOf(table)] = {
//     ...table,
//     columns: [...table.columns, bus.utils.setColumnDefaults({ ...data, name: columnName, type: dataType })],
//   };
//   return {
//     ...schema,
//     tables: modTables,
//   };
// };

// export const oneToOne = (
//   schema: bus.Schema,
//   start: string,
//   end: string,
//   name: string,
//   params: bus.OneToOneEdgeInput,
// ): bus.Schema => {
//   bus.utils.assert.noEdge(schema, name);
//   return bus.utils.addEdge(schema, {
//     ...params,
//     name,
//     start,
//     end,
//     kind: bus.EDGE.oneToOne,
//     required: params.required || false,
//   });
// };

// export const oneToMany = (
//   schema: bus.Schema,
//   start: string,
//   end: string,
//   name: string,
//   params: bus.OneToManyEdgeInput,
// ): bus.Schema => {
//   bus.utils.assert.noEdge(schema, name);

//   return bus.utils.addEdge(schema, {
//     ...params,
//     name,
//     start,
//     end,
//     kind: bus.EDGE.oneToMany,
//     required: params.required || false,
//   });
// };

// export const manyToMany = (
//   schema: bus.Schema,
//   start: string,
//   end: string,
//   name: string,
//   params: bus.ManyToManyEdgeInput,
// ): bus.Schema => {
//   bus.utils.assert.noEdge(schema, name);
//   return bus.utils.addEdge(schema, { ...params, name, start, end, kind: bus.EDGE.manyToMany }) as any;
// };

// export const commit = (schema: bus.Schema, commitName: string): bus.Schema => {
//   if (schema.commits.map((c) => c.name).includes(commitName)) {
//     throw new Error(`There's already a commit named "${commitName}". Commit names must be unique.`);
//   }
//   return {
//     ...schema,
//     commits: [...schema.commits, { name: commitName }],
//   };
// };
