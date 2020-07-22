import { bus } from './bus';
// import { PostgresMigrator } from './migrate/postgres';

type CommitCache = { [k: string]: bus.Skee<any, any> };

export class Skee<T extends string, V extends CommitCache> {
  _actions: bus.store.Action[];
  _schema: bus.Schema;
  //  protected _cachedState: bus.store.Action[];
  //  protected _tables!: T;
  //  protected _v!: V;

  //  _schema: bus.Schema;

  constructor(actions: bus.store.Action[]) {
    this._actions = actions;
    this._schema = bus.store.actionsToSchema(this._actions);
    // this._schema = schema;
  }

  static create = (): Skee<never, {}> => {
    return new Skee([]);
  };

  to = {
    relational: () => bus.utils.toRelational(this._schema),
    oop: () => bus.mapping.toOOP(this._schema),
    skiiStructs: (): ReturnType<typeof bus.mapping.toSkiiSchema> => bus.mapping.toSkiiSchema(this._schema),
    zod: (): ReturnType<typeof bus.mapping.toZodSchema> => bus.mapping.toZodSchema(this._schema),
    typescript: () => bus.mapping.toTypeScript(this._schema),
    prisma: () => bus.mapping.toPrisma(this._schema)(),
  };

  //  protected addEdge = (edge: bus.Edge): this => {
  //    bus.utils.assert.noEdge(this._schema, edge.name);
  //    return new Skee({
  //      ...this._schema,
  //      edges: [...this._schema.edges, edge],
  //    }) as any;
  //  };

  addTable = <TableName extends string>(
    name: TableName,
    params: { idType?: bus.ID; idKey?: string } = {},
  ): Skee<T | TableName, V> => {
    return new Skee([
      ...this._actions,
      {
        type: bus.ducks.addTable.ActionType,
        name,
        idType: params.idType || bus.COLUMN.uuid,
        idKey: params.idKey || 'id',
      },
    ]);
  };

  renameTable = <Old extends T, New extends string>(tableName: Old, newName: New): Skee<Exclude<T, Old> | New, V> => {
    return new Skee([
      ...this._actions,
      {
        type: bus.ducks.renameTable.ActionType,
        oldTableName: tableName,
        newTableName: newName,
      },
    ]);
  };

  dropTable = (table: T): Skee<T, V> => {
    return new Skee([
      ...this._actions,
      {
        type: bus.ducks.dropTable.ActionType,
        name: table,
      },
    ]);
  };

  addColumn = <TableName extends T>(
    tableName: TableName,
    columnName: string,
    dataType: Exclude<bus.COLUMN, 'uuid' | 'serial'>,
    data: bus.ColumnInput = {},
  ): Skee<T, V> => {
    // if ((dataType as any) === 'uuid' || (dataType as any) === 'serial')
    //   throw new Error(`Cannnot use addColumn for primary keys.`);
    // bus.utils.assert.noColumn(this._schema, tableName, columnName);
    // const table = this.getTable(tableName);

    // const modTables = [...this._schema.tables];
    // modTables[modTables.indexOf(table)] = {
    //   ...table,
    //   columns: [...table.columns, bus.utils.setColumnDefaults({ ...data, name: columnName, type: dataType })],
    // };
    // return new Skee({
    //   ...this._schema,
    //   tables: modTables,
    // });

    return new Skee([
      ...this._actions,
      {
        type: bus.ducks.addColumn.ActionType,
        tableName,
        columnName,
        dataType,
        data,
      },
    ]);
  };

  renameColumn = (tableName: T, columnName: string, newColumnName: string): Skee<T, V> => {
    return new Skee([
      ...this._actions,
      {
        type: bus.ducks.renameColumn.ActionType,
        tableName,
        columnName,
        newColumnName,
      },
    ]);
  };

  dropColumn = (tableName: T, columnName: string): Skee<T, V> => {
    return new Skee([
      ...this._actions,
      {
        type: bus.ducks.dropColumn.ActionType,
        tableName,
        columnName,
      },
    ]);
  };

  setDefault = (tableName: T, columnName: string, value: any): Skee<T, V> => {
    return new Skee([
      ...this._actions,
      {
        type: bus.ducks.setDefault.ActionType,
        tableName,
        columnName,
        value,
      },
    ]);
  };

  dropDefault = (tableName: T, columnName: string): Skee<T, V> => {
    return new Skee([
      ...this._actions,
      {
        type: bus.ducks.dropDefault.ActionType,
        tableName,
        columnName,
      },
    ]);
  };

  //  setNotNull = (table: T, column: string): Skee<T, V> => {
  //    return new Skee([
  //      ...this._actions,
  //      {
  //        type: bus.ducks.setNotNull.ActionType,
  //      },
  //    ]);
  //  };
  //  dropNotNull = (table: T, column: string): Skee<T, V> => {
  //    return new Skee([
  //      ...this._actions,
  //      {
  //        type: bus.ducks.dropNotNull.ActionType,
  //      },
  //    ]);
  //  };
  //  setUnique = (table: T, column: string): Skee<T, V> => {
  //    return new Skee([
  //      ...this._actions,
  //      {
  //        type: bus.ducks.setUnique.ActionType,
  //      },
  //    ]);
  //  };
  //  dropUnique = (table: T, column: string): Skee<T, V> => {
  //    return new Skee([
  //      ...this._actions,
  //      {
  //        type: bus.ducks.dropUnique.ActionType,
  //      },
  //    ]);
  //  };
  //  createIndex = (table: T, column: string): Skee<T, V> => {
  //    return new Skee([
  //      ...this._actions,
  //      {
  //        type: bus.ducks.createIndex.ActionType,
  //      },
  //    ]);
  //  };
  //  dropIndex = (table: T, column: string): Skee<T, V> => {
  //    return new Skee([
  //      ...this._actions,
  //      {
  //        type: bus.ducks.dropIndex.ActionType,
  //      },
  //    ]);
  //  };

  oneToOne = <StartTable extends T, EndTable extends T, Params extends bus.OneToOneEdgeInput>(
    start: StartTable,
    end: EndTable,
    name: string,
    params: Params,
  ): Skee<T, V> => {
    // bus.utils.assert.noEdge(this._schema, name);
    // return this.addEdge({
    //   ...params,
    //   name,
    //   start,
    //   end,
    //   kind: bus.EDGE.oneToOne,
    //   required: params.required || false,
    // });

    return new Skee([
      ...this._actions,
      {
        type: bus.ducks.oneToOne.ActionType,
        start,
        end,
        name,
        params,
      },
    ]);
  };

  oneToMany = <StartTable extends T, EndTable extends T, Params extends bus.OneToManyEdgeInput>(
    start: StartTable,
    end: EndTable,
    name: string,
    params: Params,
  ): Skee<T, V> => {
    // bus.utils.assert.noEdge(this._schema, name);

    // return this.addEdge({
    //   ...params,
    //   name,
    //   start,
    //   end,
    //   kind: bus.EDGE.oneToMany,
    //   required: params.required || false,
    // });
    return new Skee([
      ...this._actions,
      {
        type: bus.ducks.oneToMany.ActionType,
        start,
        end,
        name,
        params,
      },
    ]);
  };

  manyToMany = <
    StartTable extends T,
    EndTable extends T,
    TableName extends string,
    Params extends bus.ManyToManyEdgeInput
  >(
    start: StartTable,
    end: EndTable,
    name: TableName,
    params: Params,
  ): Skee<T | TableName, V> => {
    // bus.utils.assert.noEdge(this._schema, name);
    // return this.addEdge({ ...params, name, start, end, kind: bus.EDGE.manyToMany }) as any;
    return new Skee([
      ...this._actions,
      {
        type: bus.ducks.manyToMany.ActionType,
        start,
        end,
        name,
        params,
      },
    ]);
  };

  commit = <CommitName extends string>(name: CommitName): Skee<T, V & { [k in CommitName]: this }> => {
    return new Skee([
      ...this._actions,
      {
        type: bus.ducks.commit.ActionType,
        name,
      },
    ]);
  };

  getCommit = <Name extends keyof V>(name: Name): V[Name] => {
    const commitAction = this._actions.find((a) => a.type === 'ADD_COMMIT' && a.name === name);
    if (!commitAction) throw new Error(`Commit "${name}" does not exist.`);
    const actions = this._actions.slice(0, this._actions.indexOf(commitAction) + 1);
    return new Skee(actions) as any;
  };

  sync = async (db: bus.DBCxn, params: { break?: keyof V } = {}) => {
    if (params.break) {
      if (!this._schema.commits.find((c) => c.name === params.break)) {
        throw new Error(`You specified a breakpoint of "${params.break}" but that commit doesn't exist.`);
      }
    }

    let migrator: bus.Migrator;
    if (db.db === 'postgres') {
      migrator = new bus.PostgresMigrator(db);
    } else {
      throw new Error(`Unsupported database: "${db.db}". Only 'postgres' is currently supported.`);
    }

    await migrator.initialize();

    /////////////////////////////
    ///  COMMIT SANITY CHECKS ///
    /////////////////////////////
    const schemaCommits = this._schema.commits;
    const appliedCommits = (await migrator.getCommits()).sort(
      (a, b) => b.created_at.valueOf() - a.created_at.valueOf(),
    );

    if (schemaCommits.length === 0) {
      console.log(`No commits to apply...done.`);
      return;
    }

    if (schemaCommits.length < appliedCommits.length) {
      throw new Error(`Commit history out of sync.`);
    }

    if (schemaCommits.length === appliedCommits.length) {
      console.log(`All commits have been applied...done.`);
      return;
    }

    appliedCommits.map((_, j) => {
      if (appliedCommits[j].name !== schemaCommits[j].name) {
        throw new Error(
          `Commit history out of sync.\n\nApplied commits:\n${JSON.stringify(
            appliedCommits,
            null,
            2,
          )}\n\nAll commits:\n${JSON.stringify(schemaCommits, null, 2)}`,
        );
      }
    });

    ////////////////////////////////
    ///  GROUP ACTIONS BY COMMIT ///
    ////////////////////////////////
    let stagedActions: bus.store.Action[] = [];
    const commitActions: { name: string; actions: bus.store.Action[] }[] = [];

    for (const action of this._actions) {
      if (action.type === 'ADD_COMMIT') {
        stagedActions.push(action); // include commit as final action
        commitActions.push({ name: action.name, actions: stagedActions });
        stagedActions = [];
        if (params.break === action.name) break;
      } else {
        stagedActions.push(action);
      }
    }

    // console.log(JSON.stringify(commitActions, null, 2));

    //////////////////////////
    ///  LOOP OVER COMMITS ///
    //////////////////////////
    const appliedCommitNames = appliedCommits.map((c) => c.name);
    // console.log(`\nApplied commits`);
    // console.log(JSON.stringify(appliedCommitNames, null, 2));
    for (const commitAction of commitActions) {
      if (appliedCommitNames.includes(commitAction.name)) {
        console.log(`commit "${commitAction.name}" has already been applied`);
        continue;
      }

      console.log();
      console.log(
        [`===========================`, `    COMMIT ${commitAction.name}   `, `===========================`].join('\n'),
      );

      // apply all actions inside a transaction
      await migrator.beginTransaction();
      try {
        for (const action of commitAction.actions) {
          // console.log(action.type);
          switch (action.type) {
            case bus.ducks.addTable.ActionType:
              await migrator.addTable(action);
              break;
            case bus.ducks.dropTable.ActionType:
              await migrator.dropTable(action);
              break;

            case bus.ducks.renameTable.ActionType:
              await migrator.renameTable(action);
              break;

            case bus.ducks.addColumn.ActionType:
              await migrator.addColumn(action);
              break;

            case bus.ducks.dropColumn.ActionType:
              await migrator.dropColumn(action);
              break;

            case bus.ducks.renameColumn.ActionType:
              await migrator.renameColumn(action);
              break;

            case bus.ducks.setDefault.ActionType:
              await migrator.setDefault(action);
              break;

            case bus.ducks.dropDefault.ActionType:
              await migrator.dropDefault(action);
              break;

            case bus.ducks.oneToOne.ActionType:
              await migrator.oneToOne(action, this._schema);
              break;

            case bus.ducks.oneToMany.ActionType:
              await migrator.oneToMany(action, this._schema);
              break;

            case bus.ducks.manyToMany.ActionType:
              await migrator.manyToMany(action, this._schema);
              break;

            case bus.ducks.commit.ActionType:
              await migrator.commit(action);
              break;

            default:
              bus.utils.assertNever(action);
            // throw new Error(`Unrecognized action type: "${(action as any).type}"`);
          }
        }

        await migrator.commitTransaction();
      } catch (err) {
        console.log(err);
        await migrator.rollbackTransaction();
        throw err;
      }
    }
    if (params.break) {
      console.log(`Reached breakpoint: "${params.break}"`);
      return;
    }

    return;
  };

  deleteAllTables = async (db: bus.DBCxn) => {
    let migrator: bus.Migrator;
    if (db.db === 'postgres') {
      migrator = new bus.PostgresMigrator(db);
    } else {
      throw new Error(`Unsupported database: "${db.db}". Only 'postgres' is currently supported.`);
    }
    await migrator.deleteAllTables(this._schema);
    return;
  };
}
