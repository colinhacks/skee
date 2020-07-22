import { Client, QueryResult } from 'pg';
import { bus } from '../bus';
import { Migrator } from '../internal';

export const PgType = {
  bigint: 'bigint',
  // bigserial:'bigserial',
  // bit:'bit',
  boolean: 'boolean',
  // box:'box',
  // bytea:'bytea',
  // character:'character',
  // cidr:'cidr',
  // circle:'circle',
  // date:'date',
  timestamptz: 'timestamp with time zone',
  double: 'double precision',
  real: 'real',
  // inet:'inet',
  integer: 'integer',
  // interval:'interval',
  // line:'line',
  // lseg:'lseg',
  // macaddr:'macaddr',
  // money:'money',
  // numeric:'numeric',
  // path:'path',
  // point:'point',
  // polygon:'polygon',
  // real:'real',
  // smallint:'smallint',
  serial: 'serial',
  text: 'text',
  // time:'time',
  // timestamp:'timestamp',
  // tsquery:'tsquery',
  // tsvector:'tsvector',
  // txid_snapshot:'txid_snapshot',
  uuid: 'uuid',
  // xml:'xml',
} as const;
export type PgType = typeof PgType[keyof typeof PgType];

export const colToPG = (col: bus.COLUMN) => {
  const map: { [k in bus.COLUMN]: PgType } = {
    bigint: PgType.bigint,
    boolean: PgType.boolean,
    text: PgType.text,
    integer: PgType.integer,
    float: PgType.real,
    double: PgType.double,
    // decimal: PgType,
    datetime: PgType.timestamptz,
    serial: PgType.serial,
    uuid: PgType.uuid,
    updatedAt: PgType.timestamptz,
  };
  return map[col];
};

export class PostgresMigrator extends Migrator {
  _db: bus.DBCxn;
  _client?: Client;

  constructor(db: bus.DBCxn) {
    super();
    this._db = db;
  }

  connect = async () => {
    if (this._client) {
      return this._client!;
    }
    const client = new Client({
      connectionString: this._db.url,
    });
    await client.connect();
    this._client = client;
    return client;
  };

  disconnect = async () => {
    const client = await this.connect();
    await client.end();

    this._client = undefined;
    return client;
  };

  execute = async <T = any>(query: string, params?: any[]) => {
    console.log(query);
    // if (params) console.log(params);
    const client = await this.connect();
    return (await client.query(query, params)) as QueryResult<T>;
  };

  toDefault = (defaultValue: any) => {
    // let defaultValue = action.value;
    if (defaultValue === bus.FUNCTION.now) return 'now()';
    if (defaultValue === bus.FUNCTION.uuidv1) return 'uuid_generate_v1()';
    if (defaultValue === bus.FUNCTION.uuidv4) return 'uuid_generate_v4()';
    return this.toLiteral(defaultValue);
  };

  toLiteral = (lit: any): string => {
    const client = new Client();
    if (Array.isArray(lit)) return `ARRAY[ ${lit.map(this.toLiteral).join(' , ')} ]`;
    if (typeof lit === 'bigint' || typeof lit === 'number') return lit.toString();
    if (typeof lit === 'string') return client.escapeLiteral(lit);
    if (lit instanceof Date) return `TIMESTAMP '${lit.toISOString()}'`;
    if (typeof lit === 'object') return JSON.stringify(lit, null, 2);
    return JSON.stringify(lit); //client.escapeLiteral(lit);
  };

  toId = (id: string) => {
    const client = new Client();
    return client.escapeIdentifier(id);
  };

  initialize = async () => {
    await this.execute(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
    await this.execute(`CREATE TABLE IF NOT EXISTS __commit_history__ (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v1(),
  "name" text UNIQUE,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);`);
    return true;
  };

  addTable = async (action: bus.ducks.addTable.Action) => {
    const QUERY = `CREATE TABLE ${this.toId(action.name)} (
  ${this.toId(action.idKey)} ${this.toId(colToPG(action.idType))} PRIMARY KEY ${
      action.idType === 'uuid' ? `DEFAULT uuid_generate_v1()` : ``
    }
);`;
    await this.execute(QUERY);
    return true;
  };

  dropTable = async (action: bus.ducks.dropTable.Action) => {
    const QUERY = `DROP TABLE ${this.toId(action.name)};`;
    await this.execute(QUERY);
    return true;
  };

  renameTable = async (action: bus.ducks.renameTable.Action) => {
    const QUERY = `ALTER TABLE ${this.toId(action.oldTableName)} RENAME TO ${this.toId(action.newTableName)};`;
    await this.execute(QUERY);
    return true;
  };

  addColumn = async (action: bus.ducks.addColumn.Action) => {
    const { isList, notNull, unique, default: def } = action.data;
    const constraints: string[] = [];
    if (notNull) constraints.push(`NOT NULL`);
    if (unique) constraints.push(`UNIQUE`);
    // if(default)constraints.push(`UNIQUE`);

    const QUERY = [
      `ALTER TABLE`,
      this.toId(action.tableName),
      `ADD COLUMN`,
      this.toId(action.columnName),
      colToPG(action.dataType),
      isList ? 'ARRAY' : '',
      notNull ? 'NOT NULL' : '',
      unique ? 'UNIQUE' : '',
      def !== undefined ? `DEFAULT ${this.toDefault(def)}` : '',
      `;`,
    ]
      .filter((x) => x)
      .join(' ');
    await this.execute(QUERY);
    return true;
  };

  dropColumn = async (action: bus.ducks.dropColumn.Action) => {
    const { tableName, columnName } = action;
    const QUERY = `SELECT COUNT(*) FROM ${this.toId(tableName)} WHERE ${this.toId(columnName)} IS NOT NULL;`;
    const nonNullRow = await this.execute(QUERY);
    const count = parseInt(nonNullRow.rows[0].count);

    if (count === 0) {
      const QUERY = `ALTER TABLE ${this.toId(tableName)} DROP COLUMN ${this.toId(columnName)};`;
      await this.execute(QUERY);
    } else {
      throw new Error(
        `Column "${columnName}" contains data. To drop this column, you must remove all data from this column.`,
      );
    }
    return true;
  };

  renameColumn = async (action: bus.ducks.renameColumn.Action) => {
    const QUERY = `ALTER TABLE ${this.toId(action.tableName)} RENAME COLUMN ${this.toId(
      action.columnName,
    )} TO ${this.toId(action.newColumnName)};`;
    await this.execute(QUERY);
    return true;
  };

  setDefault = async (action: bus.ducks.setDefault.Action) => {
    const defaultValue = this.toDefault(action.value);
    const QUERY = `ALTER TABLE ${this.toId(action.tableName)} ALTER COLUMN ${this.toId(
      action.columnName,
    )} SET DEFAULT ${defaultValue};`;
    await this.execute(QUERY);
    return true;
  };

  dropDefault = async (action: bus.ducks.dropDefault.Action) => {
    const QUERY = `ALTER TABLE ${this.toId(action.tableName)} ALTER COLUMN ${this.toId(
      action.columnName,
    )} DROP DEFAULT;`;
    await this.execute(QUERY);
    return true;
  };

  getCommits = async () => {
    const QUERY = `SELECT * FROM __commit_history__;`;
    const result = await this.execute<{ name: string; created_at: Date }>(QUERY);
    if (!Array.isArray(result.rows)) {
      throw new Error(`Error retrieving previous commits.`);
    }
    return result.rows.sort((a, b) => a.created_at.valueOf() - b.created_at.valueOf());
  };

  commit = async (action: bus.ducks.commit.Action) => {
    await this.execute(`INSERT INTO __commit_history__ (name) VALUES ($1);`, [action.name]);
    return true;
  };

  protected addIndex = async (table: string, column: string) => {
    const indexName = `${table}_${column}_idx`;
    const IDX_QUERY = `CREATE INDEX ${this.toId(indexName)} ON ${this.toId(table)}(${this.toId(column)});`;
    await this.execute(IDX_QUERY);
  };

  protected addUniquenessConstraint = async (table: string, columns: string[]) => {
    const cxName = `${table}_${columns.join('_')}_unique_cx`;
    const UNIQUE_QUERY = [
      `ALTER TABLE`,
      this.toId(table),
      `ADD CONSTRAINT`,
      this.toId(cxName),
      `UNIQUE (${columns.map(this.toId).join(', ')});`,
    ].join(' ');
    await this.execute(UNIQUE_QUERY);
  };

  protected addForeignKey = async (referencing: string, fkColumn: string, referenced: string) => {
    const cxName = `${referencing}_${fkColumn}_references_${referenced}_cx`;
    const FK_QUERY = [
      `ALTER TABLE`,
      this.toId(referencing),
      `ADD CONSTRAINT`,
      cxName,
      `FOREIGN KEY`,
      `(${this.toId(fkColumn)})`,
      `REFERENCES`,
      this.toId(referenced),
    ].join(' ');
    await this.execute(FK_QUERY);
  };

  beginTransaction = async () => {
    await this.execute('BEGIN;');
  };

  commitTransaction = async () => {
    await this.execute('COMMIT;');
  };

  rollbackTransaction = async () => {
    await this.execute('ROLLBACK;');
  };

  protected addForeignKeyRelation = async (
    action: bus.ducks.oneToOne.Action | bus.ducks.oneToMany.Action,
    schema: bus.Schema,
  ) => {
    // action.params.

    const keyType = bus.utils.getIdType(schema, action.start);

    // const unique = action.type === 'ADD_ONE_TO_ONE_EDGE';

    try {
      // start transaction
      //  await this.execute('BEGIN');

      // add column to end table
      const unique = action.type === 'ADD_ONE_TO_ONE_EDGE';
      const QUERY = [
        `ALTER TABLE`,
        this.toId(action.end),
        `ADD COLUMN`,
        this.toId(action.params.columnName),
        keyType,
        unique ? `UNIQUE` : '', // one to one!
        action.params.required ? 'NOT NULL' : '',
        `REFERENCES ${this.toId(action.start)}`,
      ].join(' ');
      // await this.addColumn({type:"ADD_COLUMN", tableName:action.end,columnName:action.params.columnName, dataType: keyType as any, data:{}})
      await this.execute(QUERY);

      // add foreign key
      // await this.addForeignKey(action.end, action.params.columnName, action.start);

      // add uniqueness for one-to-ones
      // if(unique){
      //   await this.addUniquenessConstraint(action.end,[action.params.columnName]);
      // }

      // create index for one-to-many
      if (!unique) {
        await this.addIndex(action.end, action.params.columnName);
      }

      // commit transaction
      //  await this.execute('COMMIT;');
    } catch (e) {
      //  await this.execute('ROLLBACK;');
      throw e;
    }

    return true;
  };

  oneToOne = async (action: bus.ducks.oneToOne.Action, schema: bus.Schema) => {
    return await this.addForeignKeyRelation(action, schema);
  };

  oneToMany = async (action: bus.ducks.oneToMany.Action, schema: bus.Schema) => {
    return await this.addForeignKeyRelation(action, schema);
  };

  manyToMany = async (action: bus.ducks.manyToMany.Action, schema: bus.Schema) => {
    const startIdType = bus.utils.getIdType(schema, action.start);
    const endIdType = bus.utils.getIdType(schema, action.start);
    try {
      // start transaction
      //  await this.execute('BEGIN;');

      // create join table
      const JOIN_TABLE_COLUMNS = [
        `${this.toId(action.params.startColumn)} ${startIdType} NOT NULL REFERENCES ${this.toId(action.start)}`,
        `${this.toId(action.params.endColumn)} ${endIdType} NOT NULL REFERENCES ${this.toId(action.end)}`,
      ];
      const JOIN_QUERY = [`CREATE TABLE`, this.toId(action.name), `( ${JOIN_TABLE_COLUMNS.join(' , ')} );`].join(' ');
      await this.execute(JOIN_QUERY);

      // add index

      // add multi-column uniqueness constraint;
      await this.addUniquenessConstraint(action.name, [action.params.startColumn, action.params.endColumn]);

      await this.addIndex(action.name, action.params.startColumn);
      await this.addIndex(action.name, action.params.endColumn);

      // commit transaction
      //  await this.execute('COMMIT;');
    } catch (err) {
      //  await this.execute('ROLLBACK;');
      throw err;
    }

    return true;
  };

  deleteAllTables = async (schema: bus.Schema) => {
    try {
      const relationalSchema = bus.utils.schemaToRelational(schema);
      for (const table of relationalSchema.tables) {
        await this.execute(`DROP TABLE IF EXISTS "${table.name}" CASCADE;`);
      }
      await this.execute(`DROP TABLE IF EXISTS "__commit_history__" CASCADE;`);
    } catch (err) {
      console.log(err);
      throw err;
    }

    return true;
  };
}
