const ERModel = {
  entityRelations: [
    {
      id: 6,
      label: 'B',
      type: 'Entity',
      connectors: [
        {
          type: 'Specialization',
          from: 12,
          to: 6,
        },
        {
          type: 'RelationConnector',
          from: 8,
          to: 6,
          cardinality: 'One',
          participation: 'Total'
        },
      ],
      attributes: [
        {
          label: 'Bogor',
          type: 'Regular',
        },
      ],
    },
    {
      id: 1,
      label: 'A',
      type: 'Entity',
      connectors: [
        {
          type: 'ParentSpecialization',
          from: 12,
          to: 1,
        },
      ],
      attributes: [
        {
          label: 'id_1',
          type: 'Key',
        },
      ],
    },
    {
      id: 12,
      label: 'Special',
      type: 'Specialization',
      isTotal: true,
      isDisjoint: true,
      superID: 1,
      connectors: [
        {
          type: 'ParentSpecialization',
          from: 12,
          to: 1,
        },
        {
          type: 'Specialization',
          from: 12,
          to: 6,
        },
        {
          type: 'Specialization',
          from: 12,
          to: 7,
        },
        {
          type: 'Specialization',
          from: 12,
          to: 4,
        },
      ],
    },
    {
      id: 7,
      label: 'C',
      type: 'Entity',
      connectors: [
        {
          type: 'Specialization',
          from: 12,
          to: 7,
        },
      ],
    },
    {
      id: 8,
      label: 'R1',
      type: 'Relationship',
      connectors: [
        {
          type: 'RelationConnector',
          from: 8,
          to: 6,
          cardinality: 'One',
          participation: 'Total'
        },
        {
          type: 'RelationConnector',
          from: 8,
          to: 0,
          cardinality: 'Many',
          participation: 'Partial'
        }
      ]
    },
    {
      id: 0,
      label: 'E',
      type: 'Entity',
      connectors: [
        {
          type: 'RelationConnector',
          from: 8,
          to: 0,
          cardinality: 'Many',
          participation: 'Partial'
        },
        {
          type: 'RelationConnector',
          from: 2,
          to: 0,
          cardinality: 'Many',
          participation: 'Partial'
        },
      ]
    },
    {
      id: 5,
      label: 'R2',
      type: 'Relationship',
      connectors: [
        {
          type: 'RelationConnector',
          from: 5,
          to: 4,
          cardinality: 'One',
          participation: 'Total',
        },
        {
          type: 'RelationConnector',
          from: 5,
          to: 2,
          cardinality: 'One',
          participation: 'Partial',
        }
      ],
    },
    {
      id: 2,
      label: 'R3',
      type: 'AssociativeEntity',
      connectors: [
        {
          type: 'RelationConnector',
          from: 5,
          to: 2,
          cardinality: 'One',
          participation: 'Partial',
        },
        {
          type: 'RelationConnector',
          from: 2,
          to: 0,
          cardinality: 'Many',
          participation: 'Partial'
        },
        {
          type: 'RelationConnector',
          from: 2,
          to: 3,
          cardinality: 'Many',
          participation: 'Partial'
        }
      ]
    },
    {
      id: 4,
      label: 'D',
      type: 'Entity',
      connectors: [
        {
          type: 'RelationConnector',
          from: 5,
          to: 4,
          cardinality: 'One',
          participation: 'Total',
        },
        {
          type: 'Specialization',
          from: 12,
          to: 4,
        },
      ]
    },
    {
      id: 3,
      label: 'H',
      type: 'Entity',
      connectors: [
        {
          type: 'RelationConnector',
          from: 2,
          to: 3,
          cardinality: 'Many',
          participation: 'Partial'
        },
        {
          type: 'ParentSpecialization',
          from: 11,
          to: 3,
        },
      ],
      attributes: [
        {
          label: 'Plat',
          type: 'Key',
        },
        {
          label: 'Color',
          type: 'Regular',
        }
      ],
    },
    {
      id: 11,
      label: 'Special',
      type: 'Specialization',
      isTotal: false,
      isDisjoint: true,
      superID: 3,
      connectors: [
        {
          type: 'ParentSpecialization',
          from: 11,
          to: 3,
        },
        {
          type: 'Specialization',
          from: 11,
          to: 9,
        },
        {
          type: 'Specialization',
          from: 11,
          to: 10,
        },
      ],
    },
    {
      id: 10,
      label: 'G',
      type: 'Entity',
      connectors: [
        {
          type: 'Specialization',
          from: 11,
          to: 10,
        },
      ],
    },
    {
      id: 9,
      label: 'F',
      type: 'Entity',
      connectors: [
        {
          type: 'Specialization',
          from: 11,
          to: 9,
        },
      ],
      attributes: [
        {
          label: 'Bogor',
          type: 'Regular',
        },
      ],
    },
  ],
}

const v8 = require('v8');

const structuredClone = obj => {
  return v8.deserialize(v8.serialize(obj));
};

const createReference = (ERSchema) => {
  ERSchema.entityRelations.forEach(er => {
    if (er.superID || er.superID == 0) {
      er.superER = ERSchema.entityRelations.find(o => o.id == er.superID)
    }
    er.connectors.forEach(conn => {
      conn.fromER = ERSchema.entityRelations.find(o => o.id == conn.from)
      conn.toER = ERSchema.entityRelations.find(o => o.id == conn.to)
    })
  })
}

let visited = []
let artificialID = 0;


const getArrayKey = (attributes) => {
  let arrayKeys = []
  attributes?.forEach(attr => {
    if (attr.type == "Key" || attr.isKey) {
      arrayKeys.push(attr.label)
    }
  })
  return arrayKeys
}

const filterKey = (attributes) => {
  let arrayKeys = []
  attributes?.forEach(attr => {
    if (attr.type == "Key" || attr.isKey) {
      arrayKeys.push(attr)
    }
  })
  return arrayKeys
}

const arrayKeysToAttribute = (keys) => {
  let arrayAttr = []
  keys?.forEach(key => {
    arrayAttr.push ({
      label: key,
      type: "Key",
    })
  })
  return arrayAttr
}

const stringifyCircularObject = (key, value) => {
  if (key == 'fromER' || key == 'toER' || key == 'super' || key == 'sharedColumn') { return `reference to id ${value.id}`;}
  else {return value;}
}

const mergeLogicalSchema = (logical1, logical2) => {
  let newLogicalSchema = [...logical1, ...logical2]
  
  newLogicalSchema = newLogicalSchema.filter((value, index) => {
    const _value = JSON.stringify(value, stringifyCircularObject);
    return index === newLogicalSchema.findIndex(newLogicalSchema => {
      return JSON.stringify(newLogicalSchema, stringifyCircularObject) === _value;
    });
  });

  return newLogicalSchema
}

const mergeArray = (arr1, arr2) => {
  let newArr = [...arr1, ...arr2]
  
  newArr = newArr.filter((value, index) => {
    const _value = JSON.stringify(value, stringifyCircularObject);
    return index === newArr.findIndex(newArr => {
      return JSON.stringify(newArr, stringifyCircularObject) === _value;
    });
  });

  return newArr
}

// Unused
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

// Unused
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

const findParentKey = (entity, logicalSchema, columnFamily) => {
  let connectors = entity.connectors
  let key = []
  let i = 0
  let found = false
  if (entity.isTemporaryEntity) {
    columnFamily.sharedColumn = getSharedID(entity.sharedColumn, logicalSchema)
  }

  while (!(found) && connectors && i < connectors.length) {
    if (connectors[i].type === 'Specialization') {
      specializationShape = connectors[i].fromER
      if (specializationShape.isTotal) {
        parentEntity = specializationShape.superER
        // key = getArrayKey(parentEntity.attributes)
        columnFamily.sharedColumn = getSharedID(specializationShape.superER, logicalSchema)
        found = true
      }
    }
    else if (connectors[i].type === 'RelationConnector') {
      let relation;
      let connectorTo;
      
      if (entity.id === connectors[i].to) relation = connectors[i].fromER
      else relation = connectors[i].toER


      if (relation.type == 'Relationship' || relation.type == 'WeakRelationship') {

        if (relation.connectors[0].to === entity.id) connectorTo = relation.connectors[1]
        else connectorTo = relation.connectors[0]

        if ((connectors[i].cardinality === 'One' && connectorTo.cardinality === 'One' && connectorTo.participation === 'Total') 
          || (relation.type === 'WeakRelationship' && connectorTo.cardinality === 'One')) {
          
          const entityAcrossID = connectorTo.to
          const entityAcross = logicalSchema.find(o => o.id === entityAcrossID)
  
          // If not in logical then do nothing, will be processed for the next entity (for one-to-one both total)
          if (entityAcross) {
            // key = getArrayKey(entityAcross.attributes)
            columnFamily.sharedColumn = getSharedID(entityAcross, logicalSchema)
          }
        }
      }
    }

    i += 1
  }

  return key
}

const findRelationshipKey = (relationship, logicalSchema, columnFamily) => {
  let i = 0;
  let found = false;
  let key = []
  const connectors = relationship.connectors
  while (!found && connectors && i < connectors.length) {
    if (connectors[i].cardinality == 'One' && connectors[i].participation == 'Total') {
      const parent = logicalSchema.find(o => o.id === connectors[i].to)
      found = true
      // key = getArrayKey(parent.attributes)
      columnFamily.sharedColumn = getSharedID(parent, logicalSchema);
    }
    i += 1
  }
  return key
}

const isVisited = (entityRelation, visited) => {
  return visited.includes(entityRelation.id)
}

const convertERToLogical = (ERModel) => {
  let logicalSchema = []
  const entityRelations = ERModel.entityRelations
  for (let i = 0; i < entityRelations.length; i++) {
    if (['Entity', 'WeakEntity'].includes(entityRelations[i].type)) {
      const columnFamilySet = createFamily(entityRelations[i],logicalSchema)
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
      if (connector.type === 'Specialization') {
        specializationShape = connector.fromER
        parentEntity = specializationShape.superER
        parentArray.push(parentEntity);
      }
      else if (connector.type === 'RelationConnector') {
        let entityFromCardinality = connector.cardinality
        let relation
        let connectorTo;

        if (entityRelation.id === connector.to) relation = connector.fromER
        else relation = connector.toER


        if (relation.type == 'Relationship') {
          if (relation.connectors[0].to === entityRelation.id) connectorTo = relation.connectors[1]
          else connectorTo = relation.connectors[0]

          if (entityFromCardinality === 'Many' && connectorTo.cardinality === 'One') {
            parentArray.push(connectorTo.toER)
          }
          
          if (entityFromCardinality === 'One' && connector.participation === 'Partial'
              && connectorTo.cardinality === 'One' && connectorTo.participation === 'Total') {
            parentArray.push(connectorTo.toER)
          }
        }
      }
    })
  }

  return parentArray
}

const getSharedID = (entityRelation, logicalSchema) => {
  const columnfamily = logicalSchema.find(o => o.id == entityRelation.id)
  if (entityRelation && entityRelation.sharedColumn) {
    return getSharedID(entityRelation.sharedColumn, logicalSchema)
  } 
  else return columnfamily
}

const duplicateArray = (array) => {
  return structuredClone(array)
}

const findRelationArray = (entityRelation) => {
  let relationArray = []
  let connectors = entityRelation.connectors
  if (connectors && connectors.length > 0) {
    connectors.forEach((connector) => {
      if (connector.type === 'Specialization') {
        specializationShape = connector.fromER
        relationArray.push({
          type: 'Specialization',
          relation: specializationShape,
          entityAcrossId: specializationShape.superID
        })
      } 

      else if (connector.type === 'RelationConnector') {
        let entityFromCardinality = connector.cardinality
        let targetRelation
        if (entityRelation.id === connector.to) targetRelation = connector.fromER
        else targetRelation = connector.toER

        let relation = structuredClone(targetRelation)
        let connectorTo;

        if (relation.type == 'ReflexiveRelationship') {
          relationArray.push ({
            type: 'ReflexiveRelationship',
            relation: relation,
          })
        }

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


  return removeDuplicate(relationArray)
}

const removeDuplicate = (arr) => {
  const uniqueArray = arr.filter((value, index) => {
    const _value = JSON.stringify(value, stringifyCircularObject);
    return index === arr.findIndex(obj => {
      return JSON.stringify(obj, stringifyCircularObject) === _value;
    });
  });

  return uniqueArray
}

const createFamily = (entityRelation, logicalSchema, returnNewCF = false) => {
  // let columnFamilySet = findPreexistentColumnFamily(entityRelation, logicalSchema)
  let columnFamilySet = [...logicalSchema]
  let columnFamily = logicalSchema.find(o => o.id === entityRelation.id);

  // Soalnya ngedouble kalo relation
  if (!columnFamily || entityRelation.type == 'Relationship') {
    columnFamily = {}
  }

  if (!isVisited(entityRelation, visited) || entityRelation.type !== 'Entity') {
    visited.push(entityRelation.id)

    // Here process parentnya first tapi nanti dlu ya
    if(['Entity', 'AssociativeEntity', 'WeakEntity'].includes(entityRelation.type)) {
      const parentArray = findParentArray(entityRelation)
      // console.log('parent array', entityRelation.label)
      // console.log(parentArray)
      parentArray.forEach((entity) => {
        // this is migrate to merge
        columnFamilySet = mergeLogicalSchema(columnFamilySet, createFamily(entity, logicalSchema))
      })
    }

    columnFamily.id = entityRelation.id
    columnFamily.label = entityRelation.label
    const attributes = [...defineKey(entityRelation, columnFamilySet, columnFamily)];
    columnFamily.attributes = mergeArray(attributes, columnFamily.attributes || [])

    // if (isSharedKey) {
    //   // columnFamily.sharedColumn = getSharedID(sharedColumn);
    //   // columnFamily.attributes = mergeArray(columnFamily.attributes, filterKey(columnFamily.sharedColumn?.attributes) || []))
    //   isSharedKey = false;
    // }
    
    if (!columnFamily.attributes) {
      columnFamily.attributes = [];
    }
    entityRelation.attributes?.forEach(attribute => {
      columnFamilySet = [...columnFamilySet, ...convertAttribute(columnFamily, attribute)]
    })

    if (
        (['Relationship', 'ReflexiveRelationship'].includes(entityRelation.type) 
        && !entityRelation.isTemporaryRelation)
        ) columnFamily.isFromRelationship = true

    if (entityRelation.type === 'AssociativeEntity') columnFamily.isAssociativeEntity = true

    columnFamilySet.push(columnFamily)
  
    //Process for the relation
    if (['Entity', 'AssociativeEntity', 'WeakEntity'].includes(entityRelation.type)) {
      const relationDetailArray = findRelationArray(entityRelation)
      // console.log('relation array detail')
      // console.log(relationDetailArray)
      relationDetailArray.forEach((relationDetail) => {
        columnFamilySet = mergeLogicalSchema(columnFamilySet, convertRelationship(relationDetail, columnFamily, columnFamilySet))
      })
    }
  }


  if (returnNewCF) return columnFamily
  return columnFamilySet
}

const isSameKey = (columnFamily1, columnFamily2) => {
  let result = false
  if (columnFamily1.sharedColumn && columnFamily1.sharedColumn?.id === columnFamily2.sharedColumn?.id) {
    result = true
  }
  // console.log("WOWWWW")
  // console.log(result)

  const keysCF1 = getArrayKey(columnFamily1.attributes)
  const keysCF2 = getArrayKey(columnFamily2.attributes)

  if (keysCF1.length > 1 && keysCF2.length > 1) {
    result = keysCF2.every(val => keysCF1.includes(val));
    if (!result) result = keysCF1.every(val => keysCF2.includes(val));
  }
  
  return result
}

const convertRelationship = (relationDetail, columnFamily, logicalSchema) => {
  // Baru case 1 doang yang diimplement
  let newLogicalSchema = [];
  if (['BinaryManyToOne', 'BinaryManyToMany', 'BinaryOneToOne', 'ReflexiveRelationship'].includes(relationDetail.type)) {
    const columFamilyFromRelation = createFamily(relationDetail.relation, logicalSchema, true)

    if (relationDetail.relation?.attributes?.length > 0 && relationDetail.type === 'BinaryOneToOne') {
      newLogicalSchema.push(columFamilyFromRelation)
    }

    // console.log('=============================================================================')
    // console.log(columnFamily)
    // console.log(columFamilyFromRelation)

    if (!isSameKey(columnFamily, columFamilyFromRelation) || relationDetail.relation.type == 'ReflexiveRelationship') {
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
      const parentColumnFamily = logicalSchema.find(o => o.id === relationDetail.relation.superID);
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
    newColumnFamily = duplicateArray(columnFamily1)
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
      sharedColumn: columnFamily1,
      attributes: []
    }
  
    newColumnFamily = createFamily(temporaryEntity, logicalSchema, true)
  }
  
  let auxAttribute = {};
  auxAttribute.label = columnFamily2.label
  auxAttribute.isAuxilary = true;
  auxAttribute.type = "Key";
  auxAttribute.artificialID = artificialID;
  newColumnFamily.attributes.push(auxAttribute)
  
  // Nanti dikerjain ini knp many to many ngga
  if (relationDetail.type !== 'BinaryManyToMany') {
    let interAttribute = {};
    interAttribute.label = columnFamily1.label
    interAttribute.isIntermediary = true;
    interAttribute.artificialID = artificialID;
    interAttribute.type = "Key";
    columnFamily2.attributes.push(interAttribute)
  }
  
  artificialID += 1

  // handle many to many artificial relation
  if (relationDetail.type === 'BinaryManyToMany') {
    newColumnFamily.sharedColumn = columnFamily2
    // newColumnFamily.attributes = mergeArray(newColumnFamily.attributes, filterKey(columnFamily2.attributes))
  }

  // Coba2 lagi ya nanti
  // if (relationDetail.type === 'BinaryOneToOne') {
  //   newColumnFamily.key = [...columnFamily2.key]
  // }
  newLogicalSchema = mergeLogicalSchema(newLogicalSchema, [newColumnFamily, columnFamily2])
  // [...newLogicalSchema, newColumnFamily, columnFamily2]

  return newLogicalSchema
}

// Masih harus dikerjain yaaa
const getColumnType = (column, attribute) => {
  if (attribute.type == 'Key') column.type = 'Key'
  else column.type = 'Regular'
}

const convertAttribute = (columnFamily, attribute) => {
  let additionalColumnFamily = []
  if (attribute.type === 'Composite') {
    let newColumFamily = {}
    newColumFamily.label = `${columnFamily.label}-${attribute.label}`
    newColumFamily.id = `${columnFamily.label}-${attribute.label}`
    newColumFamily.sharedColumn = columnFamily.sharedColumn || columnFamily
    newColumFamily.attributes = filterKey(columnFamily.attributes)

    if (attribute.children) {
      attribute.children.forEach(child => {
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
    
    columnFamily.attributes = mergeArray([column], columnFamily.attributes)
  }
  return additionalColumnFamily
}

const defineKey = (entityRelation, logicalSchema, columnFamily) => {
  let key = [];
  let ERKeys = getArrayKey(entityRelation.attributes)

  if (ERKeys.length > 0) {
    key = duplicateArray(ERKeys)
  }
  if (['Entity', 'AssociativeEntity', 'WeakEntity'].includes(entityRelation.type)) {
    key = [...ERKeys, ...findParentKey(entityRelation, logicalSchema, columnFamily)]
  }
  else { // if thre type is Relationship
    key = [...ERKeys, ...findRelationshipKey(entityRelation, logicalSchema, columnFamily)]
    // console.log(key, 'keyy')
  }
  if (key.length < 1 && !columnFamily.sharedColumn) {
    key = [`id_${entityRelation.label}`]
  }
  return arrayKeysToAttribute(key)
} 

const print = (myObject) => {
  console.log(JSON.stringify(myObject, null, 2));
}

const print2 = (myObject) => {
  console.log(JSON.stringify(myObject, stringifyCircularObject, 2));
}

createReference(ERModel)
// console.log(ERModel)
// convertERToLogical(ERModel);
// print(convertERToLogical(ERModel));
print2(convertERToLogical(ERModel));
// console.log(convertERToLogical(ERModel));


// Yang blm
// One to one partial both
// Relationship ada attribute
// Kalo kebetulan nama key nya sama gmn


// Notes
// Weak entity kalo many to many emng gabisa
// N-ary SKIP
// Refelxive udah tapi masih aneh