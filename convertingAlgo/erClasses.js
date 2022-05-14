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
      const attributes = [...defineKey(entityRelation, columnFamilySet, columnFamily)];
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
            columnFamilySet = mergeLogicalCF(columnFamilySet, convertRelationship(relationDetail, columnFamily, columnFamilySet))
          })
        }
      }
    }
  
    if (returnNewCF) return columnFamily
    return columnFamilySet
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
