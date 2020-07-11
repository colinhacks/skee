import { blogSchema } from '../testSchemas';

test('setDefault', () => {
  expect(JSON.stringify(blogSchema._schema).includes('Bobby')).toEqual(false);
  expect(JSON.stringify(blogSchema._schema).includes('Pumpkins')).toEqual(false);

  const modSchema = blogSchema.setDefault('User', 'firstName', ['Bobby', 'Pumpkins'])._schema;
  expect(JSON.stringify(modSchema).includes('Bobby')).toEqual(true);
  expect(JSON.stringify(modSchema).includes('Pumpkins')).toEqual(true);

  const modModSchema = blogSchema.dropDefault('User', 'firstName');
  expect(JSON.stringify(modModSchema).includes('Bobby')).toEqual(false);
  expect(JSON.stringify(modModSchema).includes('Pumpkins')).toEqual(false);
});
