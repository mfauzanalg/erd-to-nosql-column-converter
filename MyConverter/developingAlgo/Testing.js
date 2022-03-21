const ERSchema = {
  entityRelations: [
    {
      id: 0,
      label: 'Person',
      type: 'Entity',
      attributes: [
        {
          type: 'Key',
          label: 'Name'
        },
        {
          type: 'Regular',
          label: 'Address'
        }
      ],
      connectors: [
        {
          type: 'RelationConnector',
          from: 2,
          to: 0,
          cardinality: 'One',
          participation: 'Partial'
        },
      ]
    },
    {
      id: 2,
      label: 'Have',
      type: 'Relationship',
      connectors: [
        {
          type: 'RelationConnector',
          from: 2,
          to: 0,
          cardinality: 'One',
          participation: 'Partial'
        },
        {
          type: 'RelationConnector',
          from: 2,
          to: 3,
          cardinality: 'One',
          participation: 'Total'
        }
      ]
    },
    {
      id: 3,
      label: 'Car',
      type: 'Entity',
      connectors: [
        {
          type: 'RelationConnector',
          from: 2,
          to: 3,
          cardinality: 'One',
          participation: 'Total'
        },
      ],
      attributes: [
        {
          type: 'Key',
          label: 'Plat'
        },
        {
          type: 'Regular',
          label: 'Color'
        }
      ],
    },
  ],
}

const createReference = (ERSchema) => {
  ERSchema.entityRelations.forEach(er => {
    er.connectors.forEach(conn => {
      conn.from = ERSchema.entityRelations.find(o => o.id == conn.from)
      conn.to = ERSchema.entityRelations.find(o => o.id == conn.to)
    })
  })
}

createReference(ERSchema)

console.log(ERSchema.entityRelations[0].connectors[0].from)
// print(ERSchema)