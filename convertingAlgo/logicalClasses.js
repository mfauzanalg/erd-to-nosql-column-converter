class LogicalModel {
  constructor(label, columnFamilies) {
    this.label = label || '';
    this.columnFamilies = columnFamilies || []
  }

  logicalToPhysicalCassandra (logicalModel) {
    const physicalCassandra = new PhysicalCassandra(logicalModel.label)
    logicalModel.columnFamilies.forEach((cf) => {
      let table = new Table()
      let comments = []
      let parentKeys = []
      let cfKeys = []

      table.setLabel(removeNewLine(cf.label))
      if (cf.min) comments.push(`Minimum number of ${removeNewLine(cf.label)} is ${cf.min}`)
      if (cf.max) comments.push(`Maximum number of ${removeNewLine(cf.label)} is ${cf.max}`)
      
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
          if (attr.min) comments.push(`Minimum number of ${removeNewLine(attr.label)} is ${attr.min}`)
          if (attr.max) comments.push(`Maximum number of ${removeNewLine(attr.label)} is ${attr.max}`)
          table.addColumn(column)
        })
      }
      table.setKeys(createPrimaryKey(parentKeys, cfKeys))
      table.setComments(comments)
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