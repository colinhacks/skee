import { bus } from './bus';
import { blogSchema } from './testSchemas';
// import { PostgresMigrator } from './migrate/PostgresMigrator';

bus.FUNCTION.now;

const testDB = {
  db: 'postgres',
  url: 'postgresql://colinmcd94@localhost:5432/virgil_test',
};

// const pg = new bus.PostgresMigrator(testDB);

const run = async () => {
  await blogSchema.deleteAllTables(testDB);
  await blogSchema.sync(testDB);

  // await pgTest.dropTable('__commit_history__');
  // await mySchema.sync(testDB);

  // const value = await pgTest.execute(`select * from "User";`);
  // console.log(JSON.stringify(value.rows, null, 2));

  // const test = blogSchema.to.oopSchema();
  // console.log(JSON.stringify(test, null, 2));
  // console.log('\nDONE.');

  // const test = blogSchema.to.zod();
  // console.log(test.file);
  // console.log('\nDONE.');

  // console.log(JSON.stringify(blogSchema._schema, null, 2));
  // console.log(JSON.stringify(blogSchema.renameTable('User', 'Person')._schema, null, 2));
};

run();
