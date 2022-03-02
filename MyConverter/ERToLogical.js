const ERSchema = {
  shapes: [
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
          cardinality: 'One',
          participation: 'Total'
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

const findParentKey = (entity, logicalSchema) => {
  let connectors = entity.connectors
  key = []
  if (entity.isTemporary) {
    isHasParent = true
    parentID = entity.parentID
  }
  if (connectors && connectors.length > 0) {
    connectors.forEach((connector) => {
      if (connector.type === 'ChildrenSpecialization') {
        specializationShape = ERSchema.shapes.find(o => o.id === connector.from)
        if (specializationShape.isTotal) {
          parentEntity = ERSchema.shapes.find(o => o.id === specializationShape.parentID)
          key = [...parentEntity.key]
          isHasParent = true
          parentID = specializationShape.parentID
        }
      }
    })
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
  const shapes = ERSchema.shapes
  for (let i = 0; i < shapes.length; i++) {
    if (shapes[i].type === 'Entity') {
      const columnFamilySet = createFamily(shapes[i],logicalSchema)
      logicalSchema = [...columnFamilySet, ...logicalSchema]
    }
  }

  logicalSchema = logicalSchema.filter((value, index) => {
    const _value = JSON.stringify(value);
    return index === logicalSchema.findIndex(logicalSchema => {
      return JSON.stringify(logicalSchema) === _value;
    });
  });
  
  return logicalSchema
}


const findParentArray = (entityRelation) => {
  let parentArray = []
  let connectors = entityRelation.connectors
  if (connectors && connectors.length > 0) {
    connectors.forEach((connector) => {
      if (connector.type === 'ChildrenSpecialization') {
        specializationShape = ERSchema.shapes.find(o => o.id === connector.from)
        parentEntity = ERSchema.shapes.find(o => o.id === specializationShape.parentID)
        parentArray.push(parentEntity);
      }
      else if (connector.type === 'RelationConnector') {
        let entityFromCardinality = connector.cardinality
        let targetRelation
        if (entityRelation.id === connector.to) targetRelation = connector.from
        else targetRelation = connector.to

        let relation = ERSchema.shapes.find(o => o.id === targetRelation);
        let connectorTo;

        if (relation.connectors[0].to === entityRelation.id) connectorTo = relation.connectors[1]
        else connectorTo = relation.connectors[0]

        if (entityFromCardinality === 'Many' && connectorTo.cardinality === 'One') {
          parentArray.push(ERSchema.shapes.find(o => o.id === connectorTo.to))
        }
      }
    })
  }
  return parentArray
}

const findRelationArray = (entityRelation) => {
  let relationArray = []
  let connectors = entityRelation.connectors
  if (connectors && connectors.length > 0) {
    connectors.forEach((connector) => {
      if (connector.type === 'ChildrenSpecialization') {
        specializationShape = ERSchema.shapes.find(o => o.id === connector.from)
        relationArray.push({
          type: 'Specialization',
          relation: specializationShape,
          entityAcrossId: specializationShape.parentID
        })
      } 

      else if (connector.type === 'RelationConnector') {
        let entityFromCardinality = connector.cardinality
        let targetRelation
        if (entityRelation.id === connector.to) targetRelation = connector.from
        else targetRelation = connector.to

        let relation = ERSchema.shapes.find(o => o.id === targetRelation);
        let connectorTo;

        if (relation.connectors[0].to === entityRelation.id) connectorTo = relation.connectors[1]
        else connectorTo = relation.connectors[0]

        if (entityFromCardinality === 'Many' && connectorTo.cardinality === 'One') {
          relationArray.push ({
            type: 'BinaryManyToOne',
            relation: relation,
            entityAcrossId: connectorTo.to
          })
        }
        else if (entityFromCardinality === 'Many' && connectorTo.cardinality === 'Many') {
          relationArray.push ({
            type: 'BinaryManyToMany',
            relation: relation,
            entityAcrossId: connectorTo.to
          })
        }
        else if (entityFromCardinality === 'One' && connectorTo.cardinality === 'One') {
          if (!isVisited(relation, visited)) {
            relationArray.push ({
              type: 'BinaryOneToOne',
              relation: relation,
              entityAcrossId: connectorTo.to
            })
          }
        }
      }
    })
  }
  return relationArray
}

const createFamily = (entityRelation, logicalSchema) => {
  // let columnFamilySet = findPreexistentColumnFamily(entityRelation, logicalSchema)
  let columnFamilySet = [...logicalSchema]
  let columnFamily = {}
  if (!isVisited(entityRelation, visited) || entityRelation.type === 'Relationship') {
    visited.push(entityRelation.id)

    // Here process parentnya first tapi nanti dlu ya
    if(entityRelation.type === 'Entity') {
      const parentArray = findParentArray(entityRelation)
      parentArray.forEach((entity) => {
        columnFamilySet = [...columnFamilySet, ...createFamily(entity, logicalSchema)]
      })
    }

    console.log(entityRelation.label)
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
        columnFamilySet = [...columnFamilySet, ...convertRelationship(relationDetail, columnFamily, columnFamilySet)]

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
  if (['BinaryManyToOne', 'BinaryManyToMany', 'BinaryOneToOne'].includes(relationDetail.type)) {
    const convertedRelation = createFamily(relationDetail.relation, logicalSchema)
 
    if (relationDetail.relation.attributes) {
      // nanti ya pusing
      newLogicalSchema = [...convertedRelation]
    }
    columFamilyFromRelation = convertedRelation.find(o => o.id === relationDetail.relation.id);
    if (!isArrayEqual(columnFamily.key, columFamilyFromRelation.key) || relation.type == 'Reflexive') {
      newLogicalSchema = [...newLogicalSchema, ...createArtificialRelation(columFamilyFromRelation, columnFamily, relationDetail)]
    }
  }
  // Case 3
  else if (['Specialization'].includes(relationDetail.type)) {
    if (!relationDetail.relation?.isTotal) {
      const parentColumnFamily = logicalSchema.find(o => o.id === relationDetail.relation.parentID);
      newLogicalSchema = [...newLogicalSchema, ...createArtificialRelation(columnFamily, parentColumnFamily, relationDetail)]
    }
  }
  return newLogicalSchema
}

const createArtificialRelation = (columnFamily1, columnFamily2, relationDetail) => {
  let relation = relationDetail.relation
  let withTemporary = false;
  let newLogicalSchema = []
  let newColumnFamily;
  if (columnFamily1.isFromRelationhip) {
    newColumnFamily = JSON.parse(JSON.stringify(columnFamily1));
  }
  else {
    // Nanti deh ini apasi
  }
  if (!newColumnFamily) {
    withTemporary = true
    const temporaryEntity = {
      id: `temporary${columnFamily1.id}`,
      label: `${columnFamily1.label}-${columnFamily2.label}`,
      type: 'Entity',
      isTemporary: true,
      parentID: columnFamily1.id
    }
    newColumnFamily = createFamily(temporaryEntity, newLogicalSchema)[0]
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

  // handle many to many artificial relation
  if (relationDetail.type === 'BinaryManyToMany') {
    newColumnFamily.parentID = columnFamily2.id
    newColumnFamily.key = [...columnFamily2.key]
  }

  if (relationDetail.type === 'BinaryOneToOne') {
    newColumnFamily.key = [...columnFamily2.key]
  }

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
    if (entityRelation.type === 'Entity') {
      // Pake parent key alias jadi shared key gitu, tapi nanti ya
      key = [...findParentKey(entityRelation, logicalSchema)]
    }
    else { // if thre type is Relationship
      key = [...findRelationshipKey(entityRelation, logicalSchema)]
    }
    if (key.length < 1 && !isHasParent) {
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
