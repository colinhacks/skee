import { bus } from './bus';
// import { blogSchema } from './testSchemas';
// import { PostgresMigrator } from './migrate/PostgresMigrator';

// bus.FUNCTION.now;

const testDB = {
  db: 'postgres',
  url: 'postgresql://colinmcd94@localhost:5432/virgil_test',
};

const pg = new bus.PostgresMigrator(testDB);

// let testSchema = bus.Skee.create()
//   .addTable('User')
//   .commit('1.0.0')
//   .addTable('Post')
//   .addTable('Profile')
//   .oneToMany('User', 'Post', 'UserToPost', {
//     columnName: 'authorId',
//     startKey: 'posts',
//     endKey: 'author',
//     required: true,
//   })
//   .commit('1.0.1')
//   .oneToOne('User', 'Profile', 'UserToProfile', {
//     columnName: 'userId',
//     startKey: 'profile',
//     endKey: 'user',
//     required: true,
//   })
//   .commit('1.0.2')
//   .addColumn('User', 'firstName', bus.COLUMN.text, { notNull: true })
//   .addColumn('User', 'otherNames', bus.COLUMN.text, {
//     isList: true,
//     notNull: true,
//   })
//   .commit('1.0.3')
//   .addTable('Tag')
//   .manyToMany('Post', 'Tag', 'PostToTags', {
//     startKey: 'tags',
//     endKey: 'posts',
//     startColumn: 'userId',
//     endColumn: 'tagId',
//   })
//   .commit('1.0.4')
//   .dropColumn('User', 'otherNames')
//   .addColumn('User', 'otherNames', bus.COLUMN.integer, { isList: true })
//   .commit('1.0.5');

const run = async () => {
  const client = await pg.connect();

  const TABLES = [
    'User',
    'Post',
    'Profile',
    'Tag',
    'Temp',
    'UserToPost',
    'UserToProfile',
    'PostToTags',
    '__commit_history__',
  ];
  for (const table of TABLES) {
    console.log(`deleting ${table}`);
    await client.query(`DROP TABLE IF EXISTS "${table}" CASCADE;`);
  }

  //////////////////////
  // TEST ADD TABLE AND ADD COLUMN
  //////////////////////
  let s1 = bus.Skee.create()
    .addTable('User')
    .addColumn('User', 'firstName', bus.COLUMN.text)
    .addColumn('User', 'points', bus.COLUMN.integer)
    .commit('1');

  await s1.sync(testDB);

  await client.query(`insert into "User" ("firstName") values ($1);`, [
    'Colin',
  ]);
  const users = await client.query(`select * from "User";`);
  console.log(JSON.stringify(users.rows, null, 2));
  const userId: string = users.rows[0].id;

  //////////////////////
  // TEST DROP TABLE AND DROP  COLUMN
  //////////////////////
  // add table tables and columns
  let s1b = s1
    .addTable('Temp')
    .addColumn('Temp', 'temp1', bus.COLUMN.text, {
      notNull: true,
    })
    .addColumn('Temp', 'temp2', bus.COLUMN.text, {
      notNull: true,
    })
    .commit('addtemp');

  await s1b.sync(testDB);
  await client.query(`insert into "Temp" ("temp1", "temp2") values ($1, $2);`, [
    'Colin',
    'McDonnell',
  ]);
  const temp1 = await client.query(`select * from "Temp";`);
  console.log(JSON.stringify(temp1.rows, null, 2));

  // dropping temp1 column
  let s1c = s1b.dropColumn('Temp', 'temp1').commit('dropcol');
  // await client.query(
  //   `update "Temp" set "temp1" = null where "temp1" is not null;`,
  // );
  await s1c.sync(testDB);
  await client.query(`insert into "Temp" ("temp2") values ($1);`, ['Colin']);
  const temp2 = await client.query(`select * from "Temp";`);
  console.log(JSON.stringify(temp2.rows, null, 2));

  // dropping Temp table
  let s1d = s1c.dropTable('Temp').commit('droptable');
  await s1d.sync(testDB);
  // await client.query(`insert into "Temp" ("temp") values ($1);`, ['Colin']);
  // const temp3 = await client.query(`select * from "Temp";`);
  // console.log(JSON.stringify(temp3.rows, null, 2));

  //////////////////////
  // TEST ONE TO ONE
  //////////////////////
  const s2 = s1d
    .addTable('Profile')
    .addColumn('Profile', 'content', bus.COLUMN.text)
    .oneToOne('User', 'Profile', 'UserToProfile', {
      columnName: 'userId',
      startKey: 'profile',
      endKey: 'user',
      required: true,
    })
    .commit('2');
  await s2.sync(testDB);

  await client.query(
    `insert into "Profile" ("content", "userId") values ($1, $2);`,
    [`this is Colin's profile!`, userId],
  );
  const profiles = await client.query(
    `select * from "Profile" join "User" on "Profile"."userId"="User"."id";`,
  );
  console.log(JSON.stringify(profiles.rows, null, 2));

  //////////////////////
  // TEST ONE TO MANY
  //////////////////////

  const s3 = s2
    .addTable('Post')
    .addColumn('Post', 'title', bus.COLUMN.text)
    .oneToMany('User', 'Post', 'UserToPost', {
      columnName: 'authorId',
      startKey: 'posts',
      endKey: 'author',
      required: true,
    })
    .commit('3');
  await s3.sync(testDB);

  await client.query(
    `insert into "Post" ("title", "authorId") values ($1, $2), ($1, $2);`,
    [`My first post!`, userId],
  );
  const posts = await client.query(
    `select title, "Post".id, "User"."id" as "authorId" from "Post" join "User" on "Post"."authorId"="User"."id";`,
  );
  console.log(JSON.stringify(posts.rows, null, 2));
  const postId = posts.rows[0].id;

  //////////////////////
  // TEST MANY TO MANY
  //////////////////////
  const s4 = s3
    .addTable('Tag')
    .addColumn('Tag', 'name', bus.COLUMN.text)
    .manyToMany('Post', 'Tag', 'PostToTags', {
      startKey: 'tags',
      endKey: 'posts',
      startColumn: 'postId',
      endColumn: 'tagId',
    })
    .commit('4');
  await s4.sync(testDB);

  await client.query(`insert into "Tag" ("name") values ($1), ($2);`, [
    `Dev`,
    'Misc',
  ]);
  const tags = await client.query(`select * from "Tag";`);
  console.log(JSON.stringify(tags.rows, null, 2));
  const tagId1 = tags.rows[0].id;
  const tagId2 = tags.rows[1].id;

  await client.query(
    `insert into "PostToTags" ("tagId", "postId") values ($1, $2), ($3, $4);`,
    [tagId1, postId, tagId2, postId],
  );
  const postTags = await client.query(`select * from "PostToTags";`);
  console.log(JSON.stringify(postTags.rows, null, 2));

  //////////////////////
  // TEST RENAMES
  //////////////////////

  const s5 = s4
    .addTable('Temp')
    .addColumn('Temp', 'temp1', bus.COLUMN.text)
    .commit('addtempagain');
  await s5.sync(testDB);
  await client.query(`insert into "Temp" ("temp1") values ($1);`, [
    'this is a test',
  ]);
  const s5a = s5.renameColumn('Temp', 'temp1', 'temp2').commit('renametemp');
  await s5a.sync(testDB);
  const tempRows = await client.query(`select * from "Temp";`);
  console.log(JSON.stringify(tempRows.rows, null, 2));

  // INDEXES AND CONSTRAINTS
  const s6 = s5a
    .setNotNull('User', 'firstName')
    .dropNotNull('User', 'firstName')
    .setUnique('User', ['firstName', 'points'])
    .dropUnique('User', ['firstName', 'points'])
    .createIndex('User', ['firstName', 'points'])
    .dropIndex('User', ['firstName', 'points'])
    .commit('addconstraints');
  console.log(`S6 SYNC`);
  await s6.sync(testDB);

  console.log(s6.to.zod());
  // TEST DELETE ALL TABLES
  await s6.deleteAllTables(testDB);
};

run();
