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

type ModelToTypeScript = {
  modelName: string;
  definition: string;
  fullDefinition: string;
};
type ToTypeScript = { file: string; models: ModelToTypeScript[] };

export type ToParams = { optionals: 'undefined' | 'null' };
class SkeeTypescript {
  schema: bus.Schema;
  params: ToParams;
  constructor(
    schema: bus.Schema,
    params: ToParams = { optionals: 'undefined' },
  ) {
    this.schema = schema;
    this.params = params;
  }

  fieldToTs = (field: bus.OOPField) => {
    // let baseType;
    const baseType = typeToTS[field.type];
    const arrayMod = field.isList ? '[]' : '';
    const optionalType =
      this.params.optionals === 'undefined' ? 'undefined' : 'null';
    const nullMod = field.notNull ? '' : ` | ${optionalType}`;
    return `${baseType}${arrayMod}${nullMod}`;
  };

  relationToTS = (field: bus.OOPRelation) => {
    // let baseType;
    const baseType = field.related;
    const arrayMod = field.isList ? '[]' : '';
    const optionalType =
      this.params.optionals === 'undefined' ? 'undefined' : 'null';
    const nullMod = field.notNull ? '' : ` | ${optionalType}`;
    return `${baseType}${arrayMod}${nullMod}`;
  };

  modelToTypeScript = (table: bus.OOPModel) => {
    const tsModel = [];
    tsModel.push(`{`);
    for (const field of table.fields) {
      tsModel.push(
        `  ${field.key}${field.notNull ? '' : '?'}: ${this.fieldToTs(field)};`,
      );
    }
    for (const field of table.relations) {
      tsModel.push(
        `  ${field.key}${field.notNull ? '' : '?'}: ${this.relationToTS(
          field,
        )};`,
      );
    }

    tsModel.push(`}`);
    return tsModel.join('\n');
  };

  toTypeScript = (): ToTypeScript => {
    const tsTypes = [];
    const models = bus.utils.toOOP(this.schema).models;
    for (const model of models) {
      const definition = this.modelToTypeScript(model);
      const fullDefinition = `type ${model.name} = ${definition}`;
      tsTypes.push({ modelName: model.name, definition, fullDefinition });
    }
    return {
      file: tsTypes.map((m) => m.fullDefinition).join(`\n\n`),
      models: tsTypes,
    };
  };
}

export const toTypeScript = (schema: bus.Schema, params: ToParams) => {
  return new SkeeTypescript(schema, params).toTypeScript();
};

// export const schemaToTypeScript
