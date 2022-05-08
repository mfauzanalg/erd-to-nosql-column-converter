class ERModel {
    constructor(label, entities, relationships) {
        this.label = label
        this.entities = entities
        this.relationships = relationships
    }
}

class Entity {
    constructor(ERModel, label, type) {
        this.ERModel = ERModel
        this.label = label
        this.type = type
        this.connectors = []
        this.attributes = []
    }
}

class Relationship {
    constructor(ERModel, label, type) {
        this.ERModel = ERModel
        this.label = label
        this.type = type
        this.connectors = []
        this.attributes = []
    }
}

class Specialization extends Relationship {
    constructor(ERModel, label, type, isTotal, isDisjoint) {
        super(ERModel)
        super(label)
        super(type)
        this.isTotal = isTotal,
        this.isDisjoint = isDisjoint
        this.connectors = []
        this.attributes = []
    }
}

class Connector {
    constructor(ERModel, from, to, cardinality, participation, type) {
        this.ERModel = ERModel,
        this.id = `${ERModel}-${from}-${to}`
        this.type = type
        this.cardinality = cardinality
        this.participation = participation
        this.from = from
        this.to = to
    }
}

class Attribute {
    constructor(label, type, ER) {
        this.ER = ER
        this. label = label
        this. type = type
        this.children = []
    }
}