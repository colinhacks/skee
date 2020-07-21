import { bus } from '../bus';

export const schemaToOOP = (schema: bus.Schema): bus.OOPSchema => {
  const objects = schema.tables.map((t) => {
    const columnFields = t.columns.map((col) => ({
      type: col.type,
      isList: col.isList,
      key: col.name,
      unique: col.unique,
      notNull: col.notNull,
    }));

    columnFields.push({
      key: t.idKey,
      type: t.idType,
      isList: false,
      unique: true,
      notNull: true,
    });

    columnFields.push({
      key: 'createdAt',
      type: bus.COLUMN.datetime,
      isList: false,
      unique: false,
      notNull: true,
    });

    // columnFields.push({
    //   key: 'updatedAt',
    //   type: bus.COLUMN.datetime,
    //   isList: false,
    //   unique: false,
    //   notNull: true,
    // });

    const relationFields: bus.OOPRelation[] = [];
    const startEdges = schema.edges.filter((e) => e.start === t.name);
    const endEdges = schema.edges.filter((e) => e.end === t.name);

    for (const se of startEdges) {
      const isList = se.kind.includes('ToMany');
      relationFields.push({
        key: se.startKey,
        edgeName: se.name,
        related: se.end,
        isList: isList,
        notNull: isList,
      });
    }

    for (const ee of endEdges) {
      const isList = ee.kind.includes('manyTo');
      const isReq = (ee as any).required || false;
      relationFields.push({
        key: ee.endKey,
        edgeName: ee.name,
        related: ee.start,
        isList: isList,
        notNull: isReq || isList,
      });
    }

    return {
      name: t.name,
      fields: columnFields,
      relations: relationFields,
    };
  });
  return {
    models: objects.filter(
      (o) =>
        !schema.edges
          .filter((e) => e.kind === 'manyToMany')
          .map((e) => e.name)
          .includes(o.name),
    ),
  };
};
