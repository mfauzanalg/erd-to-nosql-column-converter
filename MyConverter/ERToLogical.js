const ERSchema = {
  shapes: [
    {
      id: 0,
      label: 'Person',
      type: 'Entity',
      key: ['Name'],
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
          cardinality: 'Many',
          participation: 'Total'
        },
      ]
    },
    {
      id: 2,
      label: 'Have',
      type: 'Relationship',
      attributes: [
        {
          type: 'Regular',
          label: 'STNK'
        }
      ],
      connectors: [
        {
          type: 'RelationConnector',
          from: 2,
          to: 0,
          cardinality: 'Many',
          participation: 'Total'
        },
        {
          type: 'RelationConnector',
          from: 2,
          to: 3,
          cardinality: 'Many',
          participation: 'Total'
        }
      ]
    },
    {
      id: 3,
      label: 'Car',
      type: 'Entity',
      key: ['Plat'],
      connectors: [
        {
          type: 'RelationConnector',
          from: 2,
          to: 3,
          cardinality: 'Many',
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


let visited = []
let artificialID = 0;
let parentID = 0;
let isHasParent = false;

const findPreexistentColumnFamily = (entityRelation, logicalSchema) => {
  let found = false;
  let i = 0;
  let columnFamilySet = []

  while (!found && i < logicalSchema.length) {
    let j = 0;
    if (logicalSchema[i].label === entityRelation.label) {
      found = true
      columnFamilySet.push(logicalSchema[i])
    }

    if (!found && logicalSchema[i].children) {
      while (j < logicalSchema[i].children.length) {
        if (logicalSchema[i].children[j].label === entityRelation.label) {
          found = true
          columnFamilySet.push(logicalSchema[i].children[j])
        }
        j += 1;
      }
    }
    i += 1;
  }
  return columnFamilySet
}

const findColumnFamilyByID = (id, logicalSchema) => {
  let found = false;
  let i = 0;
  let key = []
  while (!found && i < logicalSchema.length) {
    let j = 0;
    if (logicalSchema[i].id === id) {
      found = true
      key = [...logicalSchema[i].key]
    }
    if (!found && logicalSchema[i].children) {
      while (j < logicalSchema[i].children.length) {
        if (logicalSchema[i].children[j].label === id) {
          found = true
          key = logicalSchema[i].children[j].key
        }
        j += 1;
      }
    }
    i += 1;
  }
  return key
}

const findRelationshipKey = (relationship, logicalSchema) => {
  let i = 0;
  let found = false;
  let key = []
  const connectors = relationship.connectors
  while (!found && i < connectors.length) {
    if (connectors[i].cardinality == 'One') {
      found = true
      key = findColumnFamilyByID(connectors[i].to, logicalSchema)
      parentID = ERSchema.shapes.find(o => o.id === connectors[i].to).id
      isHasParent = true
    }
    i += 1
  }
  return key
}

const isVisited = (entityRelation, visited) => {
  return visited.includes(entityRelation.id)
}

const convertERToLogical = (ERSchema) => {
  let logicalSchema = []
  ERSchema.shapes.forEach((item) => {
    if (item.type === 'Entity') {
      const columnFamilySet = createFamily(item,logicalSchema)
      logicalSchema = [...columnFamilySet, ...logicalSchema]
    }
  })
  return logicalSchema
}

const findRelationArray = (entityRelation) => {
  let relationArray = []
  let connectors = entityRelation.connectors
  if (connectors && connectors.length > 0) {
    connectors.forEach((connector) => {
      if (connector.type === 'RelationConnector') {
        let entityFromCardinality = connector.cardinality
        let targetRelation
        if (entityRelation.id === connector.to) targetRelation = connector.from
        else targetRelation = connector.to

        let relation = ERSchema.shapes.find(o => o.id === targetRelation);
        let connectorTo;
        if (relation.connectors[0].from === entityRelation.id) connectorTo = relation.connectors[1]
        else connectorTo = relation.connectors[0]

        if (entityFromCardinality === 'Many' && (connectorTo.cardinality === 'One' || connectorTo.cardinality === 'Many')) {
          relationArray.push ({
            type: 'Binary',
            relation: relation,
            entityAcrossId: connectorTo.to
          })
        }
      }
    })
  }
  return relationArray
}

const createFamily = (entityRelation, logicalSchema) => {
  let columnFamilySet = findPreexistentColumnFamily(entityRelation, logicalSchema)
  let columnFamily = {}
  if (!isVisited(entityRelation, visited)) {
    visited.push(entityRelation.id)
    // Here process parentnya first tapi nanti dlu ya
    columnFamily.id = entityRelation.id
    columnFamily.label = entityRelation.label
    columnFamily.key = [...defineKey(entityRelation, logicalSchema)];
    if (isHasParent) {
      columnFamily.parentID = parentID;
      isHasParent = false;
    }
    columnFamily.attributes = [];
    entityRelation.attributes?.forEach(attribute => {
      columnFamilySet = [...columnFamilySet, ...convertAttribute(columnFamily, attribute)]
    })

    if (entityRelation.type === 'Relationship') columnFamily.isFromRelationhip = true
    columnFamilySet.push(columnFamily)
  
    //Process for the relation
    if (entityRelation.type === 'Entity') {
      const relationDetailArray = findRelationArray(entityRelation)
      relationDetailArray.forEach((relationDetail) => {
        columnFamilySet = [...columnFamilySet, ...convertRelationship(relationDetail, columnFamily, logicalSchema)]
        
        columnFamilySet = columnFamilySet.filter((value, index, self) =>
          index === self.findIndex((t) => (
            t.id === value.id
          ))
        )

      })
    }
  }

  return columnFamilySet
}

const isArrayEqual = (array1, array2) => {
  return array1.length === array2.length && array1.every(function(value, index) { return value === array2[index]})
}

const convertRelationship = (relationDetail, columnFamily, logicalSchema) => {
  // Baru case 1 doang yang diimplement
  let newLogicalSchema = [];
  if (['Binary'].includes(relationDetail.type)) {
    const convertedRelation = createFamily(relationDetail.relation, logicalSchema)
    if (relationDetail.relation.attributes) {
      // nanti ya pusing
      newLogicalSchema = [...convertedRelation]
    }
    columFamilyFromRelation = convertedRelation[0]
    if (!isArrayEqual(columnFamily.key, columFamilyFromRelation.key) || relation.type == 'Reflexive') {
      newLogicalSchema = [...newLogicalSchema, ...createArtificialRelation(columFamilyFromRelation, columnFamily, relationDetail.relation)]
    }
  }
  return newLogicalSchema
}

const createArtificialRelation = (columnFamily1, columnFamily2, relation) => {
  let newLogicalSchema = []
  let newColumnFamily;
  if (columnFamily1.isFromRelationhip) {
    newColumnFamily = {...columnFamily1}
  }
  else {
    // Nanti deh ini apasi
  }
  if (!newColumnFamily) {
    // Nanti juga saya pusing
  }
  let auxAttribute = {};
  auxAttribute.label = columnFamily2.label
  auxAttribute.isAuxilary = true;
  auxAttribute.isKey = true;
  auxAttribute.artificialID = artificialID;
  newColumnFamily.attributes.push(auxAttribute)
  
  // Nanti dikerjain ini knp many to many ngga
  if (true) {
    let interAttribute = {};
    interAttribute.label = columnFamily1.label
    interAttribute.isIntermediary = true;
    interAttribute.artificialID = artificialID;
    interAttribute.isKey = true;
    columnFamily2.attributes.push(interAttribute)
  }
  
  artificialID += 1

  newLogicalSchema = [...newLogicalSchema, newColumnFamily, columnFamily2]
  return newLogicalSchema
}

// Masih harus dikerjain yaaa
const getColumnType = (column, attribute) => {
  if (attribute.type == 'Key') column.isKey = true
  else column.type = 'Regular'
}

const convertAttribute = (columnFamily, attribute) => {
  let column = {}
  if (attribute.type === 'Composite') {
    // Nanti yaa kalo komposite kayak gimana
  }
  else {
    column.label = attribute.label
    getColumnType(column, attribute)
    columnFamily.attributes.push(column)
  }
  return []
}

const defineKey = (entityRelation, logicalSchema) => {
  let key;
  if (entityRelation.key) {
    key = [...entityRelation.key]
  }
  if (!key) {
    if (entityRelation.type == 'Entity') {
      // Pake parent key alias jadi shared key gitu, tapi nanti ya
    }
    else { // if thre type is Relationship
      key = [...findRelationshipKey(entityRelation, logicalSchema)]
    }
    if (!key) {
      key = [`id_${entityRelation.label}`]
    }
  }
  return key
} 

const print = (myObject) => {
  console.log(JSON.stringify(myObject, null, 4));
}

// convertERToLogical(ERSchema);
print(convertERToLogical(ERSchema));
// console.log(convertERToLogical(ERSchema));
