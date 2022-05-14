const createReference = (entityRelations) => {
  entityRelations.forEach(er => {
    if (er.superID || er.superID == 0) {
      er.superER = entityRelations.find(o => o.id == er.superID)
    }
    er.connectors.forEach(conn => {
      conn.fromER = entityRelations.find(o => o.id == conn.from)
      conn.toER = entityRelations.find(o => o.id == conn.to)
    })
  })
}

const splitER = (ERModel, entityRelations) => {
  entityRelations.forEach(er => {
    if(['Entity', 'AssociativeEntity', 'WeakEntity'].includes(er.type)) {
      ERModel.addEntity(er)
    }
    else {
      ERModel.addRelationship(er)
    }
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
  if (key == 'fromER' || key == 'toER' || key == 'super' || key == 'parentColumnFam') { return `reference to id ${value?.id}`;}
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

// HERE
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
        columnFamily.parentColumnFam = getParentCF(specializationShape.superER, logicalCF)
        found = true
      }
    }
    else if (connectors[i].type === 'RelationConnector') {
      let relation;
      let connectorTo;
      
      if (entity.type == connectors[i].toER.type) relation = connectors[i].fromER
      else relation = connectors[i].toER

      // Define Associative Entity Parent
      if (entity.type == 'AssociativeEntity' && connectors[i].fromER.type === 'AssociativeEntity') {
        if (connectors[i].cardinality === 'One' && connectors[i].toER.type === 'Entity') {
          const columnFamilyAcross = logicalCF.find(o => o.id === connectors[i].toER.id)
          if (columnFamilyAcross) {
            columnFamily.parentColumnFam = getParentCF(columnFamilyAcross, logicalCF)
          }
        }
      }

      if (relation.type == 'Relationship' || relation.type == 'WeakRelationship' || relation.type == 'AssociativeEntity') {
        if (relation.connectors[0].toER == entity) connectorTo = relation.connectors[1]
        else connectorTo = relation.connectors[0]

        if (relation.type == 'AssociativeEntity') {
          relation.connectors.forEach(conn => {
            if (conn.toER.type == 'Entity' && conn.toER != entity) {
              connectorTo = conn
            }
          })
        }

        //  Total
        if ((connectors[i].cardinality === 'One' && connectorTo.cardinality === 'One') 
          || (relation.type === 'WeakRelationship' && connectorTo.cardinality === 'One')) {
          
          const entityAcrossID = connectorTo.toER.id
          const columnFamilyAcross = logicalCF.find(o => o.id === entityAcrossID)
  
          // If not in logical then do nothing, will be processed for the next entity (for one-to-one both total)
          if (columnFamilyAcross) {
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
  if (relationship.binaryType == 'ReflexiveRelationship') {
    const parent = logicalCF.find(o => o.id === connectors[i].toER.id)
    columnFamily.parentColumnFam = getParentCF(parent, logicalCF);
  }
  else {
    while (!found && connectors && i < connectors.length) {
      // Total
      if (connectors[i].cardinality == 'One') {
        const parent = logicalCF.find(o => o.id === connectors[i].toER.id)
        if (parent) {
          found = true
          columnFamily.parentColumnFam = getParentCF(parent, logicalCF);
        }
      }
      i += 1
    }
  }
  return key
}

const isVisited = (entityRelation, visited) => {
  return visited.includes(entityRelation.id)
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

        if (entity.type === connector.toER.type) {
          relation = connector.fromER
        }
        else {
          relation = connector.toER
        } 

        if (relation.type == 'Relationship') {
          if (relation.connectors[0].toER === entity) connectorTo = relation.connectors[1]
          else connectorTo = relation.connectors[0]

          if (entityFromCardinality === 'Many' && connectorTo.cardinality === 'One') {
            parentArray.push(connectorTo.toER)
          }

          if (entityFromCardinality === 'One' && connectorTo.cardinality === 'One') {
            if ((entity.type == 'AssociativeEntity' || connectorTo.toER.type == 'AssociativeEntity')) {
              if (connector.participation === 'Partial' && connectorTo.participation === 'Total') {
                if (entity != connectorTo.toER) {
                  parentArray.push(connectorTo.toER)
                } 
              }
            }
            else if (connector.participation === 'Total' && connectorTo.participation === 'Partial') {
              parentArray.push(connectorTo.toER)
            }
          }
        }

        if (connector.fromER.type == 'AssociativeEntity') {
          relation.connectors.forEach(conn => {
            if (conn.toER.type == 'Entity' && conn.toER != entity) {
              connectorTo = conn
            }
          })

          if (connectorTo.cardinality == 'One') {
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

const clone = (orig) => {
  return Object.assign(Object.create(Object.getPrototypeOf(orig)), orig)
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
        if (entity.type === connector.toER.type) targetRelation = connector.fromER
        else targetRelation = connector.toER

        let relation = clone(targetRelation)
        // relation.createFamily = targetRelation.createFamily

        let connectorTo;
        if (relation.type == 'ReflexiveRelationship') {
          relationArray.push ({
            type: 'ReflexiveRelationship',
            relation: relation,
          })
        }

        if (relation.type == 'Relationship') {
          if (relation.connectors[0].toER.label == entity.label) connectorTo = relation.connectors[1]
          else connectorTo = relation.connectors[0]
          
          let type = ''
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
              entityAcross: connectorTo.toER
            })
          }
          else if (entityFromCardinality === 'One' 
            // && connectorTo.cardinality === 'One' && connectorTo.participation === 'Total') {
            && connectorTo.cardinality === 'One') {
            if (!isVisited(relation, visited)) {
              type = 'BinaryOneToOne',
              relationArray.push ({
                type: 'BinaryOneToOne',
                relation: relation,
              })
            }
          }

          // For change the label in many to many
          if (type != 'BinaryOneToOne') {
            relation.label = `${relation.label}_${entity.label}`
            relation.id = `${relation.id}_${entity.id}`
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
  let newLogicalCF = [];
  // Case1
  if (['BinaryManyToOne', 'BinaryManyToMany', 'BinaryOneToOne', 'ReflexiveRelationship'].includes(relationDetail.type)) {
    const columFamilyFromRelation = relationDetail.relation.createFamily(relationDetail.relation, logicalCF, true)

    if (relationDetail.relation?.attributes?.length > 0 && relationDetail.type === 'BinaryOneToOne') {
      newLogicalCF.push(columFamilyFromRelation)
    }

    if (relationDetail.type != 'BinaryOneToOne' && (!isSameKey(columnFamily, columFamilyFromRelation) || relationDetail.relation.type == 'ReflexiveRelationship')) {
      newLogicalCF = [...newLogicalCF, ...createArtificialRelation(columFamilyFromRelation, columnFamily, relationDetail, logicalCF)]
    }
  }
  // Case 2 
  else if (['AssociativeEntity'].includes(relationDetail.type)) {
    const columFamilyFromAssociative = relationDetail.relation.createFamily(relationDetail.relation, logicalCF)
    newLogicalCF = mergeLogicalCF(newLogicalCF, columFamilyFromAssociative)

    let type = 'BinaryManyToOne'
    if (relationDetail.connector.cardinality === 'One') {
      type = 'BinaryOneToOne'
    }

    const tempRelation = new Relationship(
      relationDetail.relation.ERModel,
      relationDetail.relation.label,
      'Relationship'
    )
    tempRelation.isTemporaryRelation = true
    tempRelation.id = relationDetail.relation.id

    const temporaryRelationDetail = {
      type: type,
      relation: tempRelation
    }

    // const temporaryRelationDetail = {
    //   type: type,
    //   relation: {
    //     id: relationDetail.relation.id,
    //     label: relationDetail.relation.label,
    //     type: 'Relationship',
    //     isTemporaryRelation: true,
    //   }
    // }


    const result = convertRelationship(temporaryRelationDetail, columnFamily, newLogicalCF)
    newLogicalCF = mergeLogicalCF(result, newLogicalCF)

  }
  // Case 3
  else if (['SpecialConnector'].includes(relationDetail.type)) {
    if (!relationDetail.relation?.isTotal) {
      const parentColumnFamily = logicalCF.find(o => o.id === relationDetail.relation.superID);
      newLogicalCF = [...newLogicalCF, ...createArtificialRelation(columnFamily, parentColumnFamily, relationDetail, logicalCF)]
    }
  }
  return newLogicalCF
}

const createArtificialRelation = (columnFamily1, columnFamily2, relationDetail, logicalCF) => {
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
    const temporaryEntity = new Entity(
      'ERModel', 
      `${columnFamily1.label}_${columnFamily2.label}`,
      'Entity'
    )

    temporaryEntity.id = `temporary${columnFamily1.id}`
    temporaryEntity.isTemporaryEntity = true
    temporaryEntity.parentColumnFam = columnFamily1

  
    newColumnFamily = temporaryEntity.createFamily(temporaryEntity, logicalCF, true)
  }
  
  let auxAttribute = {};
  auxAttribute.label = columnFamily2.label
  auxAttribute.type = "Auxiliary";
  auxAttribute.artificialID = artificialID;
  newColumnFamily.attributes.push(auxAttribute)
  
  // Skip many to many, just like the original alog
  let interAttribute = {};
  if (relationDetail.type !== 'BinaryManyToMany') {
    interAttribute.label = columnFamily1.label
    interAttribute.artificialID = artificialID;
    interAttribute.type = "Intermediary";
    columnFamily2.attributes.push(interAttribute)
  }
  
  artificialID += 1

  // handle many to many artificial relation
  if (relationDetail.type === 'BinaryManyToMany') {
    newColumnFamily.parentColumnFam = relationDetail.entityAcross.id
  }

  newLogicalCF = mergeLogicalCF(newLogicalCF, [newColumnFamily, columnFamily2])
  return newLogicalCF
}

const getColumnType = (column, attribute) => {
  if (attribute.type == 'Key') column.type = 'Key'
  else if (attribute.type == 'Multivalued') column.type = 'Multivalued'
  else column.type = 'Regular'
}

const convertAttribute = (columnFamily, attribute) => {
  let additionalColumnFamily = []
  if (attribute.children?.length > 0) {
    let newColumFamily = {}
    newColumFamily.label = `${columnFamily.label}_${attribute.label}`
    newColumFamily.id = `${columnFamily.label}_${attribute.label}`
    newColumFamily.parentColumnFam = columnFamily.parentColumnFam || columnFamily
    newColumFamily.attributes = []

    if (attribute.children.length > 0) {
      attribute.children.forEach(child => {
        additionalColumnFamily = [...additionalColumnFamily,
          ...convertAttribute(newColumFamily, child)] 
      })
    }
    additionalColumnFamily.push(newColumFamily)
  }
  else {
    if (attribute.type != "Derived") {
      const column = {}
      column.label = attribute.label
      getColumnType(column, attribute)
      
      columnFamily.attributes = mergeArray([column], columnFamily.attributes)
    }
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
  }
  if (key.length < 1 && !columnFamily.parentColumnFam && !(entityRelation.binaryType == "BinaryManyToMany")) {
    key = [`id_${entityRelation.label}`]
  }
  return arrayKeysToAttribute(key)
} 
