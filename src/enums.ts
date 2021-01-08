export const COLUMN = {
  text: 'text',
  // char: 'char',
  integer: 'integer',
  float: 'float',
  double: 'double',
  // decimal: 'decimal',
  bigint: 'bigint',
  boolean: 'boolean',
  datetime: 'datetime',
  serial: 'serial',
  uuid: 'uuid',
  updatedAt: 'updatedAt',
} as const;

export type COLUMN = keyof typeof COLUMN;

export type ID = typeof COLUMN.uuid | typeof COLUMN.serial;

export const EDGE = {
  oneToOne: 'oneToOne',
  oneToMany: 'oneToMany',
  manyToMany: 'manyToMany',
} as const;

export type EDGE = keyof typeof EDGE;

export const FUNCTION = {
  uuidv4: `__uuidv4`,
  uuidv1: `__uuidv1`,
  now: `__now`,
} as const;

export type FUNCTION = typeof FUNCTION[keyof typeof FUNCTION];
