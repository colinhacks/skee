import { blogSchema } from '../testSchemas';

test('renameTable', () => {
  expect(JSON.stringify(blogSchema._schema).includes('"User"')).toEqual(true);
  const modSchema = blogSchema.renameColumn('User', 'firstName', 'first_name')._schema;
  expect(JSON.stringify(modSchema).includes('first_name')).toEqual(true);
  expect(JSON.stringify(modSchema).includes('firstName')).toEqual(false);
});
