class ERModel {
  constructor(label, entities, relationships) {
    this.label = label;
    this.entities = entities || [];
    this.relationships = relationships || [];
  }

  convertERToLogical() {
    visited = [];
    artificialID = 0;
    let logicalCF = [];
    const entities = this.entities;
    for (let i = 0; i < entities.length; i++) {
      if (['Entity', 'WeakEntity'].includes(entities[i].type)) {
        const columnFamilySet = entities[i].createFamily(entities[i], logicalCF);
        logicalCF = mergeLogicalCF(columnFamilySet, logicalCF);
      }
    }

    const logicalModel = {
      label: this.label,
      columnFamilies: logicalCF,
    };

    return logicalModel;
  }

  addEntity(entity) {
    this.entities.push(entity)
  }

  addRelationship(relationship) {
    this.relationships.push(relationship)
  }
}

class EntityRelation {
  constructor(ERModel, label, type, connectors, attributes) {
    this.ERModel = ERModel;
    this.label = label;
    this.type = type;
    this.connectors = connectors || [],
    this.attributes = attributes || []
  }

  createFamily(entityRelation, logicalCF, returnNewCF = false) {
    let columnFamilySet = [...logicalCF]
    let columnFamily = logicalCF.find(o => o.id === entityRelation.id);
  
    // For the relation, so it's not processes twice
    if (!columnFamily || entityRelation.type == 'Relationship') {
      columnFamily = {}
    }
  
    let firstCome = !isVisited(entityRelation, visited)
    if (firstCome || entityRelation.type !== 'Entity') {
      visited.push(entityRelation.id)
  
      // Process the parents first
      if(['Entity', 'AssociativeEntity', 'WeakEntity'].includes(entityRelation.type)) {
        const parentArray = findParentArray(entityRelation)
        parentArray.forEach((entity) => {
          // this is migrate to merge
          columnFamilySet = mergeLogicalCF(columnFamilySet, entity.createFamily(entity, logicalCF))
        })
      }
  
      columnFamily.id = entityRelation.id
      columnFamily.label = entityRelation.label
      const attributes = [...entityRelation.defineKey(entityRelation, columnFamilySet, columnFamily)];
      columnFamily.attributes = mergeArray(attributes, columnFamily.attributes || [])
      
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
        if (!(entityRelation.type == 'AssociativeEntity' && !firstCome)) {
          const relationDetailArray = findRelationArray(entityRelation)
          relationDetailArray.forEach((relationDetail) => {
            relationDetail.relation.binaryType = relationDetail.type
            console.log(relationDetail.relation);
            columnFamilySet = mergeLogicalCF(columnFamilySet, relationDetail.relation.convertRelationship(relationDetail, columnFamily, columnFamilySet))
          })
        }
      }
    }
  
    if (returnNewCF) return columnFamily
    return columnFamilySet
  }

  defineKey (entityRelation, logicalCF, columnFamily) {
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

  convertRelationship (relationDetail, columnFamily, logicalCF) {
    let newLogicalCF = [];
    // Case1
    if (['BinaryManyToOne', 'BinaryManyToMany', 'BinaryOneToOne', 'ReflexiveRelationship'].includes(relationDetail.type)) {
      const columFamilyFromRelation = relationDetail.relation.createFamily(relationDetail.relation, logicalCF, true)
  
      if (relationDetail.relation?.attributes?.length > 0 && relationDetail.type === 'BinaryOneToOne') {
        newLogicalCF.push(columFamilyFromRelation)
      }
  
      if (relationDetail.type != 'BinaryOneToOne' && (!isSameKey(columnFamily, columFamilyFromRelation) || relationDetail.relation.type == 'ReflexiveRelationship')) {
        newLogicalCF = [...newLogicalCF, ...relationDetail.relation.createArtificialRelation(columFamilyFromRelation, columnFamily, relationDetail, logicalCF)]
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
  
      const result = tempRelation.convertRelationship(temporaryRelationDetail, columnFamily, newLogicalCF)
      newLogicalCF = mergeLogicalCF(result, newLogicalCF)
  
    }
    // Case 3
    else if (['SpecialConnector'].includes(relationDetail.type)) {
      if (!relationDetail.relation?.isTotal) {
        const parentColumnFamily = logicalCF.find(o => o.id === relationDetail.relation.superID);
        newLogicalCF = [...newLogicalCF, ...relationDetail.relation.createArtificialRelation(columnFamily, parentColumnFamily, relationDetail, logicalCF)]
      }
    }
    return newLogicalCF
  }

}

class Entity extends EntityRelation {
  constructor(ERModel, label, type, connectors, attributes) {
    super(ERModel, label, type, connectors, attributes)
  }
}

class Relationship extends EntityRelation {
  constructor(ERModel, label, type, connectors, attributes) {
    super(ERModel, label, type, connectors, attributes)
  }

  createArtificialRelation (columnFamily1, columnFamily2, relationDetail, logicalCF) {
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
}

class Specialization extends Relationship {
  constructor(ERModel, label, type, isTotal, isDisjoint) {
    super(ERModel);
    super(label);
    super(type);
    (this.isTotal = isTotal), (this.isDisjoint = isDisjoint);
    this.connectors = [];
    this.attributes = [];
  }
}

class Connector {
  constructor(ERModel, from, to, cardinality, participation, type) {
    (this.ERModel = ERModel), (this.id = `${ERModel}-${from}-${to}`);
    this.type = type;
    this.cardinality = cardinality;
    this.participation = participation;
    this.from = from;
    this.to = to;
  }
}

class Attribute {
  constructor(label, type, ER) {
    this.ER = ER;
    this.label = label;
    this.type = type;
    this.children = [];
  }
}
