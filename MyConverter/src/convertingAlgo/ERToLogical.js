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

const splitER = (ERSchema) => {
  let Entity = []
  let Relationship = []

  ERSchema.entityRelations.forEach(er => {
    if(['Entity', 'AssociativeEntity', 'WeakEntity'].includes(er.type)) {
      Entity.push(er)
    }
    else {
      Relationship.push(er)
    }
  })
  
  ERSchema.entities = Entity
  ERSchema.relationships = Relationship
  ERSchema.entityRelations = []

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
  if (key == 'fromER' || key == 'toER' || key == 'super' || key == 'parentColumnFam') { return `reference to id ${value.id}`;}
  else {return value;}
}

const mergeLogicalCF = (logical1, logical2) => {
  let newLogicalCF = [...logical1, ...logical2]
  
  newLogicalCF = newLogicalCF.filter((value, index) => {
    const _value = JSON.stringify(value, stringifyCircularObject);
    return index === newLogicalCF.findIndex(newLogicalCF => {
      return JSON.stringify(newLogicalCF, stringifyCircularObject) === _value;
    });
  });

  return newLogicalCF
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
const findPreexistentColumnFamily = (entityRelation, logicalCF) => {
  let found = false;
  let i = 0;
  let columnFamilySet = []

  while (!found && i < logicalCF.length) {
    let j = 0;
    if (logicalCF[i].label === entityRelation.label) {
      found = true
      columnFamilySet.push(logicalCF[i])
    }

    if (!found && logicalCF[i].children) {
      while (j < logicalCF[i].children.length) {
        if (logicalCF[i].children[j].label === entityRelation.label) {
          found = true
          columnFamilySet.push(logicalCF[i].children[j])
        }
        j += 1;
      }
    }
    i += 1;
  }
  return columnFamilySet
}

// Unused
const findColumnFamilyByID = (id, logicalCF) => {
  let found = false;
  let i = 0;
  let key = []
  while (!found && i < logicalCF.length) {
    let j = 0;
    if (logicalCF[i].id === id) {
      found = true
      key = [...logicalCF[i].key]
    }
    if (!found && logicalCF[i].children) {
      while (j < logicalCF[i].children.length) {
        if (logicalCF[i].children[j].label === id) {
          found = true
          key = logicalCF[i].children[j].key
        }
        j += 1;
      }
    }
    i += 1;
  }
  return key
}

const findParentKey = (entity, logicalCF, columnFamily) => {
  let connectors = entity.connectors
  let key = []
  let i = 0
  let found = false
  if (entity.isTemporaryEntity) {
    columnFamily.parentColumnFam = getParentCF(entity.parentColumnFam, logicalCF)
  }

  while (!(found) && connectors && i < connectors.length) {
    if (connectors[i].type === 'SpecialConnector') {
      let specializationShape = connectors[i].fromER
      if (specializationShape.isTotal) {
        let parentEntity = specializationShape.superER
        // key = getArrayKey(parentEntity.attributes)
        columnFamily.parentColumnFam = getParentCF(specializationShape.superER, logicalCF)
        found = true
      }
    }
    else if (connectors[i].type === 'RelationConnector') {
      let relation;
      let connectorTo;
      
      if (entity == connectors[i].toER) relation = connectors[i].fromER
      else relation = connectors[i].toER

      if (relation.type == 'Relationship' || relation.type == 'WeakRelationship') {

        if (relation.connectors[0].toER == entity) connectorTo = relation.connectors[1]
        else connectorTo = relation.connectors[0]

        if ((connectors[i].cardinality === 'One' && connectorTo.cardinality === 'One' && connectorTo.participation === 'Total') 
          || (relation.type === 'WeakRelationship' && connectorTo.cardinality === 'One')) {
          
          const entityAcrossID = connectorTo.toER.id
          const columnFamilyAcross = logicalCF.find(o => o.id === entityAcrossID)
  
          // If not in logical then do nothing, will be processed for the next entity (for one-to-one both total)
          if (columnFamilyAcross) {
            // key = getArrayKey(entityAcross.attributes)
            columnFamily.parentColumnFam = getParentCF(columnFamilyAcross, logicalCF)
          }
        }
      }
    }

    i += 1
  }

  return key
}

const findRelationshipKey = (relationship, logicalCF, columnFamily) => {
  let i = 0;
  let found = false;
  let key = []
  const connectors = relationship.connectors
  while (!found && connectors && i < connectors.length) {
    if (connectors[i].cardinality == 'One' && connectors[i].participation == 'Total') {
      const parent = logicalCF.find(o => o.id === connectors[i].toER.id)
      found = true
      // key = getArrayKey(parent.attributes)
      columnFamily.parentColumnFam = getParentCF(parent, logicalCF);
    }
    i += 1
  }
  return key
}

const isVisited = (entityRelation, visited) => {
  return visited.includes(entityRelation.id)
}

const convertERToLogical = (ERModel) => {
  let logicalCF = []
  const entities = ERModel.entities
  for (let i = 0; i < entities.length; i++) {
    if (['Entity', 'WeakEntity'].includes(entities[i].type)) {
      const columnFamilySet = createFamily(entities[i],logicalCF)
      logicalCF = mergeLogicalCF(columnFamilySet, logicalCF)
    }
  }

  const logicalModel = {
    label: ERModel.label,
    columnFamilies: logicalCF
  }
  
  return logicalModel
}

const findParentArray = (entity) => {
  let parentArray = []
  let connectors = entity.connectors
  if (connectors && connectors.length > 0) {
    connectors.forEach((connector) => {
      if (connector.type === 'SpecialConnector') {
        const specializationShape = connector.fromER
        const parentEntity = specializationShape.superER
        parentArray.push(parentEntity);
      }
      else if (connector.type === 'RelationConnector') {
        let entityFromCardinality = connector.cardinality
        let relation
        let connectorTo;

        if (entity === connector.toER) relation = connector.fromER
        else relation = connector.toER

        if (relation.type == 'Relationship') {
          if (relation.connectors[0].toER === entity) connectorTo = relation.connectors[1]
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

const getParentCF = (columnFamily, logicalCF) => {
  const columnfamily = logicalCF.find(o => o.id == columnFamily.id)
  if (columnFamily && columnFamily.parentColumnFam) {
    return getParentCF(columnFamily.parentColumnFam, logicalCF)
  } 
  else return columnfamily
}

const duplicateArray = (array) => {
  return structuredClone(array)
}

const findRelationArray = (entity) => {
  let relationArray = []
  let connectors = entity.connectors
  if (connectors && connectors.length > 0) {
    connectors.forEach((connector) => {
      if (connector.type === 'SpecialConnector') {
        const specializationShape = connector.fromER
        relationArray.push({
          type: 'SpecialConnector',
          relation: specializationShape,
        })
      } 

      else if (connector.type === 'RelationConnector') {
        let entityFromCardinality = connector.cardinality
        let targetRelation
        if (entity === connector.toER) targetRelation = connector.fromER
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
          if (relation.connectors[0].toER === entity) connectorTo = relation.connectors[1]
          else connectorTo = relation.connectors[0]
          // relation.label = `${entity.label}-${relation.label}`
  
          if (entityFromCardinality === 'Many' && connectorTo.cardinality === 'One') {
            relationArray.push ({
              type: 'BinaryManyToOne',
              relation: relation,
            })
          }
          else if (entityFromCardinality === 'Many' && connectorTo.cardinality === 'Many') {
            relationArray.push ({
              type: 'BinaryManyToMany',
              relation: relation,
            })
          }
          else if (entityFromCardinality === 'One' 
            && connectorTo.cardinality === 'One' && connectorTo.participation === 'Total') {
            if (!isVisited(relation, visited)) {
              relationArray.push ({
                type: 'BinaryOneToOne',
                relation: relation,
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

const createFamily = (entityRelation, logicalCF, returnNewCF = false) => {
  // let columnFamilySet = findPreexistentColumnFamily(entityRelation, logicalCF)
  let columnFamilySet = [...logicalCF]
  let columnFamily = logicalCF.find(o => o.id === entityRelation.id);

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
        columnFamilySet = mergeLogicalCF(columnFamilySet, createFamily(entity, logicalCF))
      })
    }

    columnFamily.id = entityRelation.id
    columnFamily.label = entityRelation.label
    const attributes = [...defineKey(entityRelation, columnFamilySet, columnFamily)];
    columnFamily.attributes = mergeArray(attributes, columnFamily.attributes || [])

    // if (isSharedKey) {
    //   // columnFamily.parentColumnFam = getParentCF(parentColumnFam);
    //   // columnFamily.attributes = mergeArray(columnFamily.attributes, filterKey(columnFamily.parentColumnFam?.attributes) || []))
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
        columnFamilySet = mergeLogicalCF(columnFamilySet, convertRelationship(relationDetail, columnFamily, columnFamilySet))
      })
    }
  }


  if (returnNewCF) return columnFamily
  return columnFamilySet
}

const isSameKey = (columnFamily1, columnFamily2) => {
  let result = false
  if (columnFamily1.parentColumnFam && columnFamily1.parentColumnFam?.id === columnFamily2.id) {
    result = true
  }
  if (columnFamily2.parentColumnFam && columnFamily2.parentColumnFam?.id === columnFamily1?.id) {
    result = true
  }

  const keysCF1 = getArrayKey(columnFamily1.attributes)
  const keysCF2 = getArrayKey(columnFamily2.attributes)

  if (keysCF1.length > 1 && keysCF2.length > 1) {
    result = keysCF2.every(val => keysCF1.includes(val));
    if (!result) result = keysCF1.every(val => keysCF2.includes(val));
  }
  
  return result
}

const convertRelationship = (relationDetail, columnFamily, logicalCF) => {
  // Baru case 1 doang yang diimplement
  let newLogicalCF = [];
  if (['BinaryManyToOne', 'BinaryManyToMany', 'BinaryOneToOne', 'ReflexiveRelationship'].includes(relationDetail.type)) {
    const columFamilyFromRelation = createFamily(relationDetail.relation, logicalCF, true)

    if (relationDetail.relation?.attributes?.length > 0 && relationDetail.type === 'BinaryOneToOne') {
      newLogicalCF.push(columFamilyFromRelation)
    }

    // console.log('=============================================================================')
    // console.log(columnFamily)
    // console.log(columFamilyFromRelation)
    if (!isSameKey(columnFamily, columFamilyFromRelation) || relationDetail.relation.type == 'ReflexiveRelationship') {
      newLogicalCF = [...newLogicalCF, ...createArtificialRelation(columFamilyFromRelation, columnFamily, relationDetail, logicalCF)]
    }
  }
  // Case 2 
  else if (['AssociativeEntity'].includes(relationDetail.type)) {
    const columFamilyFromAssociative = createFamily(relationDetail.relation, logicalCF)
    newLogicalCF = mergeLogicalCF(newLogicalCF, columFamilyFromAssociative)

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

    const hasil = convertRelationship(temporaryRelationDetail, columnFamily, newLogicalCF)
    newLogicalCF = mergeLogicalCF(hasil, newLogicalCF)

  }
  // Case 3
  else if (['SpecialConnector'].includes(relationDetail.type)) {
    if (!relationDetail.relation?.isTotal) {
      // console.log(relationDetail)
      // console.log(columnFamily)
      // console.log(logicalCF)
      const parentColumnFamily = logicalCF.find(o => o.id === relationDetail.relation.superID);
      newLogicalCF = [...newLogicalCF, ...createArtificialRelation(columnFamily, parentColumnFamily, relationDetail, logicalCF)]
    }
  }
  return newLogicalCF
}

const createArtificialRelation = (columnFamily1, columnFamily2, relationDetail, logicalCF) => {
  // let relation = relationDetail.relation
  // let withTemporary = false;
  let newLogicalCF = []
  let newColumnFamily = undefined;


  if (columnFamily1.isFromRelationship) {
    newColumnFamily = duplicateArray(columnFamily1)
  }
  else {
    const preexistentColumnFamily = logicalCF.find(o => o.id === columnFamily1.id);
    if (preexistentColumnFamily.isAssociativeEntity) newColumnFamily = preexistentColumnFamily
  }

  if (!newColumnFamily) {
    const temporaryEntity = {
      id: `temporary${columnFamily1.id}`,
      label: `${columnFamily1.label}-${columnFamily2.label}`,
      type: 'Entity',
      isTemporaryEntity: true,
      parentColumnFam: columnFamily1,
      attributes: []
    }
  
    newColumnFamily = createFamily(temporaryEntity, logicalCF, true)
  }
  
  let auxAttribute = {};
  auxAttribute.label = columnFamily2.label
  auxAttribute.type = "Auxiliary";
  auxAttribute.artificialID = artificialID;
  newColumnFamily.attributes.push(auxAttribute)
  
  // Nanti dikerjain ini knp many to many ngga
  if (relationDetail.type !== 'BinaryManyToMany') {
    let interAttribute = {};
    interAttribute.label = columnFamily1.label
    interAttribute.artificialID = artificialID;
    interAttribute.type = "Intermediary";
    columnFamily2.attributes.push(interAttribute)
  }
  
  artificialID += 1

  // handle many to many artificial relation
  if (relationDetail.type === 'BinaryManyToMany') {
    newColumnFamily.parentColumnFam = columnFamily2
    // newColumnFamily.attributes = mergeArray(newColumnFamily.attributes, filterKey(columnFamily2.attributes))
  }

  // Coba2 lagi ya nanti
  // if (relationDetail.type === 'BinaryOneToOne') {
  //   newColumnFamily.key = [...columnFamily2.key]
  // }
  newLogicalCF = mergeLogicalCF(newLogicalCF, [newColumnFamily, columnFamily2])
  // [...newLogicalCF, newColumnFamily, columnFamily2]

  return newLogicalCF
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
    newColumFamily.parentColumnFam = columnFamily.parentColumnFam || columnFamily
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

const defineKey = (entityRelation, logicalCF, columnFamily) => {
  let key = [];
  let ERKeys = getArrayKey(entityRelation.attributes)

  if (ERKeys.length > 0) {
    key = duplicateArray(ERKeys)
  }
  if (['Entity', 'AssociativeEntity', 'WeakEntity'].includes(entityRelation.type)) {
    key = [...ERKeys, ...findParentKey(entityRelation, logicalCF, columnFamily)]
  }
  else { // if thre type is Relationship
    key = [...ERKeys, ...findRelationshipKey(entityRelation, logicalCF, columnFamily)]
    // console.log(key, 'keyy')
  }
  if (key.length < 1 && !columnFamily.parentColumnFam) {
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

// createReference(ERModel)
// splitER(ERModel)


// print2(ERModel)
// console.log(ERModel)
// convertERToLogical(ERModel)
// print(convertERToLogical(ERModel));
// print2(convertERToLogical(ERModel));
// console.log(convertERToLogical(ERModel));


// Yang blm
// One to one partial both
// Relationship ada attribute
// Kalo kebetulan nama key nya sama gmn


// Notes
// Weak entity kalo many to many emng gabisa
// N-ary SKIP
// Refelxive udah tapi masih aneh

