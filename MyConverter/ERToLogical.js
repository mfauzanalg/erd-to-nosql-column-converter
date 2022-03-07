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
          cardinality: 'One',
          participation: 'Partial'
        },
      ]
    },
    {
      id: 2,
      label: 'Have',
      type: 'WeakRelationship',
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
      type: 'WeakEntity',
      key: ['Plat'],
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

let visited = []
let artificialID = 0;
let parentID = 0;
let isHasParent = false;


const mergeLogicalSchema = (logical1, logical2) => {
  let newLogicalSchema = [...logical1, ...logical2]
  
  newLogicalSchema = newLogicalSchema.filter((value, index) => {
    const _value = JSON.stringify(value);
    return index === newLogicalSchema.findIndex(newLogicalSchema => {
      return JSON.stringify(newLogicalSchema) === _value;
    });
  });

  return newLogicalSchema
}

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
  let key = []
  let i = 0
  let found = false
  if (entity.isTemporaryEntity) {
    isHasParent = true
    parentID = entity.parentID
  }

  while (!(found) && connectors && i < connectors.length) {
    if (connectors[i].type === 'ChildrenSpecialization') {
      specializationShape = ERSchema.shapes.find(o => o.id === connectors[i].from)
      if (specializationShape.isTotal) {
        parentEntity = ERSchema.shapes.find(o => o.id === specializationShape.parentID)
        key = [...parentEntity.key]
        isHasParent = true
        parentID = specializationShape.parentID
        found = true
      }
    }
    else if (connectors[i].type === 'RelationConnector') {
      let targetRelation;
      let connectorTo;
      
      if (entity.id === connectors[i].to) targetRelation = connectors[i].from
      else targetRelation = connectors[i].to

      let relation = ERSchema.shapes.find(o => o.id === targetRelation);

      if (relation.type == 'Relationship' || relation.type == 'WeakRelationship') {

        if (relation.connectors[0].to === entity.id) connectorTo = relation.connectors[1]
        else connectorTo = relation.connectors[0]

        if ((connectors[i].cardinality === 'One' && connectorTo.cardinality === 'One' && connectorTo.participation === 'Total') 
          || (relation.type === 'WeakRelationship' && connectorTo.cardinality === 'One')) {
          
          const entityAcrossID = connectorTo.to
          const entityAcross = logicalSchema.find(o => o.id === entityAcrossID)
  
          // If not in logical then do nothing, will be processed for the next entity (for one-to-one both total)
          if (entityAcross) {
            key = [...entityAcross.key]
            isHasParent = true
            parentID = entityAcrossID
          }
        }
      }
    }

    i += 1
  }

  return key
}

const findRelationshipKey = (relationship, logicalSchema) => {
  let i = 0;
  let found = false;
  let key = []
  const connectors = relationship.connectors
  while (!found && connectors && i < connectors.length) {
    if (connectors[i].cardinality == 'One' && connectors[i].participation == 'Total') {
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
    if (['Entity', 'WeakEntity'].includes(shapes[i].type)) {
      const columnFamilySet = createFamily(shapes[i],logicalSchema)
      logicalSchema = mergeLogicalSchema(columnFamilySet, logicalSchema)
    }
  }
  
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
        
        if (relation.type == 'Relationship') {

          if (relation.connectors[0].to === entityRelation.id) connectorTo = relation.connectors[1]
          else connectorTo = relation.connectors[0]

          if (entityFromCardinality === 'Many' && connectorTo.cardinality === 'One') {
            parentArray.push(ERSchema.shapes.find(o => o.id === connectorTo.to))
          }
          
          if (entityFromCardinality === 'One' && connector.participation === 'Partial'
              && connectorTo.cardinality === 'One' && connectorTo.participation === 'Total') {
            parentArray.push(ERSchema.shapes.find(o => o.id === connectorTo.to))
          }
        }
      }
    })
  }

  return parentArray
}

const getParentID = (id, logicalSchema) => {
  const parent = logicalSchema.find(o => o.id === id)
  if (parent && (parent.parentID || parent.parentID == 0)) {
    return getParentID(parent.parentID, logicalSchema)
  } 
  else return id
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

        let relationReference = ERSchema.shapes.find(o => o.id === targetRelation);
        let relation = JSON.parse(JSON.stringify(relationReference)); 
        let connectorTo;

        if (relation.type == 'Relationship') {
          if (relation.connectors[0].to === entityRelation.id) connectorTo = relation.connectors[1]
          else connectorTo = relation.connectors[0]
          // relation.label = `${entityRelation.label}-${relation.label}`
  
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
          else if (entityFromCardinality === 'One' 
            && connectorTo.cardinality === 'One' && connectorTo.participation === 'Total') {
            if (!isVisited(relation, visited)) {
              relationArray.push ({
                type: 'BinaryOneToOne',
                relation: relation,
                entityAcrossId: connectorTo.to
              })
            }
          }
        }

        else if (relation.type == 'AssociativeEntity') {
          relationArray.push({
            type: 'AssociativeEntity',
            relation: relation,
            connector: connector
          })
        }

      }
    })
  }
  return relationArray
}

const createFamily = (entityRelation, logicalSchema, returnNewCF = false) => {
  // let columnFamilySet = findPreexistentColumnFamily(entityRelation, logicalSchema)
  let columnFamilySet = [...logicalSchema]
  let columnFamily = logicalSchema.find(o => o.id === entityRelation.id);

  // Soalnya ngedouble kalo relation
  if (!columnFamily || entityRelation.type == 'Relationship') {
    // console.log('masuuk', entityRelation.label)
    columnFamily = {}
  }

  if (!isVisited(entityRelation, visited) || entityRelation.type !== 'Entity') {
    visited.push(entityRelation.id)

    // Here process parentnya first tapi nanti dlu ya
    if(['Entity', 'AssociativeEntity', 'WeakEntity'].includes(entityRelation.type)) {
      const parentArray = findParentArray(entityRelation)
      console.log('parent array', entityRelation.label)
      console.log(parentArray)
      parentArray.forEach((entity) => {
        // this is migrate to merge
        columnFamilySet = mergeLogicalSchema(columnFamilySet, createFamily(entity, logicalSchema))
      })
    }

    console.log('Process', entityRelation.label)
    columnFamily.id = entityRelation.id
    columnFamily.label = entityRelation.label
    columnFamily.key = [...defineKey(entityRelation, columnFamilySet)];
    if (isHasParent) {
      columnFamily.parentID = getParentID(parentID, columnFamilySet);
      isHasParent = false;
    }
    if (!columnFamily.attributes) {
      columnFamily.attributes = [];
    }
    entityRelation.attributes?.forEach(attribute => {
      columnFamilySet = [...columnFamilySet, ...convertAttribute(columnFamily, attribute)]
    })

    if (entityRelation.type === 'Relationship' && !entityRelation.isTemporaryRelation) columnFamily.isFromRelationship = true
    if (entityRelation.type === 'AssociativeEntity') columnFamily.isAssociativeEntity = true
    columnFamilySet.push(columnFamily)
  
    //Process for the relation
    if (['Entity', 'AssociativeEntity', 'WeakEntity'].includes(entityRelation.type)) {
      const relationDetailArray = findRelationArray(entityRelation)
      console.log('relation array detail')
      console.log(relationDetailArray)
      relationDetailArray.forEach((relationDetail) => {
        columnFamilySet = mergeLogicalSchema(columnFamilySet, convertRelationship(relationDetail, columnFamily, columnFamilySet))
      })
    }
  }


  if (returnNewCF) return columnFamily
  return columnFamilySet
}

const isSameKey = (array1, array2) => {
  // return array1.length === array2.length && array1.every(function(value, index) { return value === array2[index]})
  const result = array2.every(val => array1.includes(val));
  return result
}

const convertRelationship = (relationDetail, columnFamily, logicalSchema) => {
  // Baru case 1 doang yang diimplement
  let newLogicalSchema = [];
  if (['BinaryManyToOne', 'BinaryManyToMany', 'BinaryOneToOne'].includes(relationDetail.type)) {
    const columFamilyFromRelation = createFamily(relationDetail.relation, logicalSchema, true)

    // if (relationDetail.relation.attributes) {
    //   // nanti ya pusing
    //   // newLogicalSchema = [...columFamilyFromRelation]
    //   newLogicalSchema = newLogicalSchema.push(columFamilyFromRelation)
    // }

    if (!isSameKey(columnFamily.key, columFamilyFromRelation.key) || relationDetail.relation.type == 'Reflexive') {
      newLogicalSchema = [...newLogicalSchema, ...createArtificialRelation(columFamilyFromRelation, columnFamily, relationDetail, logicalSchema)]
    }
  }
  // Case 2 
  else if (['AssociativeEntity'].includes(relationDetail.type)) {
    const columFamilyFromAssociative = createFamily(relationDetail.relation, logicalSchema)
    newLogicalSchema = mergeLogicalSchema(newLogicalSchema, columFamilyFromAssociative)

    let type = 'BinaryManyToOne'
    if (relationDetail.connector.cardinality === 'One') {
      type = 'BinaryOneToOne'
    }
    const temporaryRelationDetail = {
      type: type,
      relation: {
        id: relationDetail.relation.id,
        label: relationDetail.relation.label,
        type: 'Relationship',
        isTemporaryRelation: true,
      }
    }

    const hasil = convertRelationship(temporaryRelationDetail, columnFamily, newLogicalSchema)
    newLogicalSchema = mergeLogicalSchema(hasil, newLogicalSchema)

  }
  // Case 3
  else if (['Specialization'].includes(relationDetail.type)) {
    if (!relationDetail.relation?.isTotal) {
      // console.log(relationDetail)
      // console.log(columnFamily)
      // console.log(logicalSchema)
      const parentColumnFamily = logicalSchema.find(o => o.id === relationDetail.relation.parentID);
      newLogicalSchema = [...newLogicalSchema, ...createArtificialRelation(columnFamily, parentColumnFamily, relationDetail, logicalSchema)]
    }
  }
  return newLogicalSchema
}

const createArtificialRelation = (columnFamily1, columnFamily2, relationDetail, logicalSchema) => {
  // let relation = relationDetail.relation
  // let withTemporary = false;
  let newLogicalSchema = []
  let newColumnFamily = undefined;

  if (columnFamily1.isFromRelationship) {
    newColumnFamily = JSON.parse(JSON.stringify(columnFamily1));
  }
  else {
    const preexistentColumnFamily = logicalSchema.find(o => o.id === columnFamily1.id);
    if (preexistentColumnFamily.isAssociativeEntity) newColumnFamily = preexistentColumnFamily
  }
  if (!newColumnFamily) {
    const temporaryEntity = {
      id: `temporary${columnFamily1.id}`,
      label: `${columnFamily1.label}-${columnFamily2.label}`,
      type: 'Entity',
      isTemporaryEntity: true,
      parentID: columnFamily1.id,
      attributes: []
    }
  
    // Kayaknya ini sih
    newColumnFamily = createFamily(temporaryEntity, logicalSchema, true)
  }
  
  let auxAttribute = {};
  auxAttribute.label = columnFamily2.label
  auxAttribute.isAuxilary = true;
  auxAttribute.isKey = true;
  auxAttribute.artificialID = artificialID;
  newColumnFamily.attributes.push(auxAttribute)
  
  // Nanti dikerjain ini knp many to many ngga
  if (relationDetail.type !== 'BinaryManyToMany') {
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
  newLogicalSchema = mergeLogicalSchema(newLogicalSchema, [newColumnFamily, columnFamily2])
  // [...newLogicalSchema, newColumnFamily, columnFamily2]
  return newLogicalSchema
}

// Masih harus dikerjain yaaa
const getColumnType = (column, attribute) => {
  if (attribute.type == 'Key') column.isKey = true
  else column.type = 'Regular'
}

const convertAttribute = (columnFamily, attribute) => {
  let additionalColumnFamily = []
  if (attribute.type === 'Composite') {
    let newColumFamily = {}
    newColumFamily.label = `${columnFamily.label}-${attribute.label}`
    newColumFamily.parentID = columnFamily.parentID || columnFamily.id
    newColumFamily.key = [...columnFamily.key]
    newColumFamily.attributes = []
    if (attribute.children) {
      attribute.children.forEach(child => {
        console.log(child)
        additionalColumnFamily = [...additionalColumnFamily,
          ...convertAttribute(newColumFamily, child)] 
      })
    }
    additionalColumnFamily.push(newColumFamily)
  }
  else {
    const column = {}
    column.label = attribute.label
    getColumnType(column, attribute)
    columnFamily.attributes.push(column)
  }
  return additionalColumnFamily
}

const defineKey = (entityRelation, logicalSchema) => {
  let key = [];
  if (entityRelation.key) {
    key = [...entityRelation.key]
  }
  if (['Entity', 'AssociativeEntity', 'WeakEntity'].includes(entityRelation.type)) {
    key = [...key, ...findParentKey(entityRelation, logicalSchema)]
  }
  else { // if thre type is Relationship
    key = [...key, ...findRelationshipKey(entityRelation, logicalSchema)]
  }
  if (key.length < 1 && !isHasParent) {
    key = [`id_${entityRelation.label}`]
  }
  return key
} 

const print = (myObject) => {
  console.log(JSON.stringify(myObject, null, 4));
}

// convertERToLogical(ERSchema);
print(convertERToLogical(ERSchema));
// console.log(convertERToLogical(ERSchema));


// Yang blm
// N-ary
// One to one partial both
// Refelxive
// Weak Entity
// Kalo kebetulan nama key nya sama gmn