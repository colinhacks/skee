import { bus } from '../bus';
import { ToParams } from './toTypeScript';

const modelToZodSchema = (model: bus.OOPModel, params: ToParams) => {
  const zodModel: string[] = [];
  zodModel.push(`z.late.object(()=>({`);

  const optionalMod =
    params.optionals === 'undefined' ? '.optional()' : `.nullable()`;

  for (const field of model.fields) {
    let fieldArg;
    // let listMod = field.isList ? `.array()` : '';
    // let nullMod = field.notNull ? '' : `.nullable()`;

    if (field.type === 'uuid') {
      fieldArg = `z.string().uuid()`;
    } else if (field.type === 'serial') {
      fieldArg = `z.number()`;
    } else if (
      field.type === 'float' ||
      field.type === 'double'
      // || field.type === 'decimal'
    ) {
      fieldArg = `z.number()`;
    } else if (field.type === 'integer') {
      fieldArg = `z.number().int()`;
    } else if (field.type === 'bigint') {
      fieldArg = `z.bigint()`;
    } else if (field.type === 'boolean') {
      fieldArg = `z.boolean()`;
    } else if (field.type === 'text') {
      fieldArg = `z.string()`;
    } else if (field.type === 'datetime') {
      fieldArg = `z.string()`;
    } else if (field.type === 'updatedAt') {
      fieldArg = `z.string()`;
    } else {
      const x: never = field.type;
      x;
    }

    const fieldWithArray = field.isList ? `z.array(${fieldArg})` : fieldArg;

    const fieldWithNullMod = field.notNull
      ? fieldWithArray
      : `${fieldWithArray}${optionalMod}`;
    const fullField = fieldWithNullMod;
    zodModel.push(`  ${field.key}: ${fullField},`);
  }

  for (const relation of model.relations) {
    const base = relation.related;
    const listMod = relation.isList ? `.array()` : '';
    const nullMod = relation.notNull ? '' : optionalMod;
    const fullField = `${base}${listMod}${nullMod}`;
    zodModel.push(`    ${relation.key}: ${fullField},`);
  }

  zodModel.push(`}))`);
  const finalModel = zodModel.join('\n');
  return { model: finalModel };
};

// type GeneratedZodSchema = {
//   types: { [k: string]: string };
//   models: { [k: string]: { type: string; model: string } };
//   file: string;
// };

export const toZodSchema = (schema: bus.Schema, params: ToParams) => {
  const oopSchema = bus.mapping.toOOP(schema); // schema.to.oopSchema();
  const types = bus.mapping.toTypeScript(schema, params); // schema.to.typescript();

  const models: {
    name: string;
    type: string;
    definition: string;
  }[] = [];

  for (const model of oopSchema.models) {
    const zodDef = modelToZodSchema(model, params);
    const tsDefs = types.models.find((t) => t.modelName === model.name)!;
    models.push({
      name: model.name,
      type: `type ${model.name} = ${tsDefs.definition};`,
      definition: `const ${model.name}: toZod<${model.name}> = ${zodDef.model};`,
    });
  }

  const file = `
import * as z from "zod";
import { toZod } from "tozod";
  
${types.file}

${models.map((def) => def.definition).join('\n\n')}

export const models = { ${models.map((m) => m.name).join(', ')} };
  `;
  return { types, models, file };
};
