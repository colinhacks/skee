import { blogSchema } from '../testSchemas';

test('renameTable', () => {
  expect(JSON.stringify(blogSchema._schema).includes('"User"')).toEqual(true);
  expect(JSON.stringify(blogSchema.renameTable('User', 'Person')._schema).includes('"User"')).toEqual(false);
});
