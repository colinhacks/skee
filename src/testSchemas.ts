import { bus } from './bus';

export const blogSchema = bus.Skee.create()
  .addTable('User')
  .commit('1.0.0')
  .addTable('Post')
  .addTable('Profile')
  .oneToMany('User', 'Post', 'UserToPost', {
    columnName: 'authorId',
    startKey: 'posts',
    endKey: 'author',
    required: true,
  })
  .commit('1.0.1')
  .oneToOne('User', 'Profile', 'UserToProfile', {
    columnName: 'userId',
    startKey: 'profile',
    endKey: 'user',
    required: true,
  })
  .commit('1.0.2')
  .addColumn('User', 'firstName', bus.COLUMN.text, { notNull: true })
  .addColumn('User', 'otherNames', bus.COLUMN.text, { isList: true, notNull: true })
  .commit('1.0.3')
  .addTable('Tag')
  .manyToMany('Post', 'Tag', 'PostToTags', {
    startKey: 'tags',
    endKey: 'posts',
    startColumn: 'userId',
    endColumn: 'tagId',
  })
  .commit('1.0.4')
  .dropColumn('User', 'otherNames')
  .addColumn('User', 'otherNames', bus.COLUMN.integer, { isList: true })
  .commit('1.0.5');
