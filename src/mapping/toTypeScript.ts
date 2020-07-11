import { bus } from '../bus';

const typeToTS = {
  text: 'string',
  integer: 'number',
  float: 'number',
  double: 'number',
  decimal: 'number',
  bigint: 'bigint',
  boolean: 'boolean',
  datetime: 'string',
  updatedAt: 'string',
  serial: 'number',
  uuid: 'string',
} as const;

const fieldToTs = (field: bus.OOPField) => {
  // let baseType;
  const baseType = typeToTS[field.type];
  const arrayMod = field.isList ? '[]' : '';
  const nullMod = field.notNull ? '' : ' | null';
  return `${baseType}${arrayMod}${nullMod}`;
};

const relationToTS = (field: bus.OOPRelation) => {
  // let baseType;
  const baseType = field.related;
  const arrayMod = field.isList ? '[]' : '';
  const nullMod = field.notNull ? '' : ' | null';
  return `${baseType}${arrayMod}${nullMod}`;
};

const modelToTypeScript = (table: bus.OOPModel) => {
  const tsModel = [];
  tsModel.push(`{`);
  for (const field of table.fields) {
    tsModel.push(`  ${field.key}: ${fieldToTs(field)};`);
  }
  for (const field of table.relations) {
    tsModel.push(`  ${field.key}: ${relationToTS(field)};`);
  }

  tsModel.push(`}`);
  return tsModel.join('\n');
};

type ModelToTypeScript = { modelName: string; definition: string; fullDefinition: string };
type ToTypeScript = { file: string; models: ModelToTypeScript[] };

export const toTypeScript = (schema: bus.Schema): ToTypeScript => {
  const tsTypes = [];
  const models = bus.utils.schemaToOOP(schema).models;
  for (const model of models) {
    const definition = modelToTypeScript(model);
    const fullDefinition = `type ${model.name} = ${definition}`;
    tsTypes.push({ modelName: model.name, definition, fullDefinition });
  }
  return { file: tsTypes.map((m) => m.fullDefinition).join(`\n\n`), models: tsTypes };
};

// export const schemaToTypeScript
