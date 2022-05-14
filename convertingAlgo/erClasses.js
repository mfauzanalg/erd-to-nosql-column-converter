class ERModel {
  constructor(label, entities, relationships) {
    this.label = label;
    this.entities = entities;
    this.relationships = relationships;
  }

  convertERToLogical() {
    visited = [];
    artificialID = 0;
    let logicalCF = [];
    const entities = this.entities;
    for (let i = 0; i < entities.length; i++) {
      if (['Entity', 'WeakEntity'].includes(entities[i].type)) {
        const columnFamilySet = createFamily(entities[i], logicalCF);
        logicalCF = mergeLogicalCF(columnFamilySet, logicalCF);
      }
    }

    const logicalModel = {
      label: this.label,
      columnFamilies: logicalCF,
    };

    return logicalModel;
  }
}

class Entity {
  constructor(ERModel, label, type) {
    this.ERModel = ERModel;
    this.label = label;
    this.type = type;
    this.connectors = [];
    this.attributes = [];
  }
}

class Relationship {
  constructor(ERModel, label, type) {
    this.ERModel = ERModel;
    this.label = label;
    this.type = type;
    this.connectors = [];
    this.attributes = [];
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
