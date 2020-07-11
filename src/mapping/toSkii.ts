import { bus } from '../bus';

const modelToSkiiStruct = (model: bus.OOPModel) => {
  const skiiModel: string[] = [];
  skiiModel.push(`skii.lazy.struct(()=>({`);

  for (const field of model.fields) {
    let fieldArg;
    let listMod = field.isList ? `.array()` : '';
    let nullMod = field.notNull ? '' : `.nullable()`;

    if (field.type === 'uuid') {
      fieldArg = `skii.string()`;
    } else if (field.type === 'serial') {
      fieldArg = `skii.number()`;
    } else if (
      field.type === 'float' ||
      field.type === 'double' ||
      field.type === 'integer'
      // || field.type === 'decimal'
    ) {
      fieldArg = `skii.number()`;
    } else if (field.type === 'bigint') {
      fieldArg = `skii.bigint()`;
    } else if (field.type === 'boolean') {
      fieldArg = `skii.boolean()`;
    } else if (field.type === 'text') {
      fieldArg = `skii.string()`;
    } else if (field.type === 'datetime') {
      fieldArg = `skii.string()`;
    } else if (field.type === 'updatedAt') {
      fieldArg = `skii.string()`;
    } else {
      const x: never = field.type;
      x;
    }

    const fullField = `${fieldArg}${listMod}${nullMod}`;
    skiiModel.push(`  ${field.key}: ${fullField},`);
  }

  for (const relation of model.relations) {
    const base = relation.related;
    const listMod = relation.isList ? `.array()` : '';
    const nullMod = relation.notNull ? '' : `.nullable()`;
    const fullField = `${base}${listMod}${nullMod}`;
    skiiModel.push(`    ${relation.key}: ${fullField},`);
  }

  skiiModel.push(`}))`);
  const finalModel = skiiModel.join('\n');
  return { model: finalModel };
};

// type GeneratedSkiiSchema = {
//   types: { [k: string]: string };
//   models: { [k: string]: { type: string; model: string } };
//   file: string;
// };

export const toSkiiSchema = (schema: bus.Schema) => {
  const oopSchema = bus.utils.schemaToOOP(schema); // schema.to.oopSchema();
  const types = bus.mapping.toTypeScript(schema); // schema.to.typescript();

  const models: { name: string; type: string; definition: string }[] = [];

  for (const model of oopSchema.models) {
    const skiiDef = modelToSkiiStruct(model);
    const tsDefs = types.models.find((t) => t.modelName === model.name)!;
    models.push({
      name: model.name,
      type: `type ${model.name} = ${tsDefs.definition};`,
      definition: `const ${model.name}: skii.struct<${model.name}> = ${skiiDef.model};`,
    });
  }

  const file = `
${types.file}

${models.map((def) => def.definition).join('\n\n')}

export default skii.structschema({ ${models.map((m) => m.name).join(', ')} })
  `;
  return { types, models, file };
};
