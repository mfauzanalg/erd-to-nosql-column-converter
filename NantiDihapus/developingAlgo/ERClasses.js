class ERModelClass {
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
    }
}

class Relationship {
    constructor(ERModel, label, type) {
        this.ERModel = ERModel
        this.label = label
        this.type = type
    }
}

class Specialization extends Relationship {
    constructor(ERModel, label, type, isTotal, isDisjoint) {
        super(ERModel)
        super(label)
        super(type)
        this.isTotal = isTotal,
        this.isDisjoint = isDisjoint
    }
}

class Connector {
    constructor(ER, type, cardinality, participation, from, to) {
        this.ER = ER,
        this.id = `${ER}-${from}-${to}`
        this.type = type
        this.cardinality = cardinality
        this. participation = participation
        this.from = from
        this.to = to
    }
}

class Attribute {
    constructor(ER, label, type) {
        this.ER = ER
        this. label = label
        this. type = type
    }
}