class LogicalModel {
  constructor(label, columnFamilies) {
    this.label = label || '';
    this.columnFamilies = columnFamilies || []
  }

  logicalToPhysicalCassandra (logicalModel) {
    const physicalCassandra = new PhysicalCassandra(logicalModel.label)
    logicalModel.columnFamilies.forEach((cf) => {
      let table = new Table()
      let parentKeys = []
      let cfKeys = []

      table.setLabel(removeNewLine(cf.label))
      
      if (cf.parentColumnFam) {
        const parentAttributes = cf.parentColumnFam.attributes
        parentAttributes.forEach((attr) => {
          let column = new Column()
          if (['Key', 'Auxiliary'].includes(attr.type)) {
            let dataType = document.getElementById(`${cf.parentColumnFam.label}-${attr.label}`).value
            if (attr.type == "Multivalued") {
              dataType = `list<${dataType}>`
            }
            column.setLabel(removeNewLine(attr.label))
            column.setDataType(dataType.toUpperCase())
            parentKeys.push(removeNewLine(attr.label))
            table.addColumn(column)
          }
        })
      }
  
      if (cf.attributes) {
        cf.attributes.forEach((attr) => {
          let column = new Column()
          let dataType = document.getElementById(`${cf.label}-${attr.label}`).value
          if (attr.type == "Multivalued") {
            dataType = `list<${dataType}>`
          }
          column.setLabel(removeNewLine(attr.label))
          column.setDataType(dataType.toUpperCase())
          if (['Key', 'Auxiliary'].includes(attr.type)) {
            cfKeys.push(removeNewLine(attr.label))
          }
          table.addColumn(column)
        })
      }
      table.setKeys(createPrimaryKey(parentKeys, cfKeys))
      physicalCassandra.addTable(table)
    })
    return physicalCassandra
  }

  visualizeLogicalModel (columnFamilies) {
    let gojs = {
      "class": "go.GraphLinksModel",
      "nodeDataArray": [],
      "linkDataArray": [], 
    }
  
    columnFamilies.forEach(cf => {
      let groupData = {
        key: cf.id,
        isGroup: true,
        text: getColumnFamilyName(cf)
      }
      if (cf.parentColumnFam) {
        groupData.group = cf.parentColumnFam.id
      } else {
        groupData.horiz = true
        let verticalData = {
          key: `${cf.id}-attr`,
          isGroup: true,
          text: '',
          group: cf.id
        }
        gojs.nodeDataArray.push(verticalData)
      }
  
      cf.attributes.forEach(attr => {
        let nodeData = {
          key: `${cf.id}-${attr.label}`,
          text: getSymbol(attr),
          group: getGroup(cf)
        }
        if (attr.artificialID || attr.artificialID == 0) {
          nodeData.type = attr.type
          nodeData.artificialID = attr.artificialID
        } 
        gojs.nodeDataArray.push(nodeData)
      })
  
      gojs.nodeDataArray.push(groupData)
    })
  
    drawArtificialRelation(gojs)
  
    return gojs
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

  addLogicalAttr(attr) {
    this.attributes.push(attr)
  }
}

class LogicalAttribute {
  constructor(columnFamily, label, type, artificialId) {
    this.columnFamily = columnFamily
    this.label = label
    this.type = type
    this.artificialId = artificialId
  }

  setLabel(label){
    this.label = label
  }

  setType(type){
    this.type = type
  }
}