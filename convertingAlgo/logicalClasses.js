class LogicalModel {
  constructor(label, columnFamilies) {
    this.label = label || '';
    this.columnFamilies = columnFamilies || []
  }

  addCF(CF) {
    this.columnFamilies.push(CF)
  }

  setLabel(label) {
    this.label = label
  }

  getCF() {
    return this.columnFamilies
  }

  setCF(CF) {
    this.columnFamilies = CF
  }
}

class ColumnFamily {
  constructor(logicalModel, label, isFromRelationship, isAssociativeEntity) {
    this.logicalModel = logicalModel;
    this.label = label;
    this.isFromRelationship = isFromRelationship;
    this.isAssociativeEntity = isAssociativeEntity;
    this.parentColumnFam = null;
    this.attributes = []
  }
}

class LogicalAttribute {
  constructor(columnFamily, label, type, artificialId) {
    this.columnFamily = columnFamily
    this.label = label
    this.type = type
    this.artificialId = artificialId
  }
}