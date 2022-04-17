const printDDL = (DDL) => {
  DDL.forEach(row => {
    console.log(row)
  })
}

const createPrimaryKey = (parentKeys, cfKeys, stringQuery) => {
  let primaryKey = ""
  if (parentKeys.length > 1) {
    primaryKey = `(${parentKeys.join(', ')})`
  } 
  else {
    primaryKey = parentKeys.join(', ')
  }

  if (cfKeys.length > 0) {
    if (primaryKey) {
      primaryKey += ', '
    }
    primaryKey += cfKeys.join(', ')
  }

  stringQuery.push(`  PRIMARY KEY (${primaryKey})`)
}

const removeNewLine = (str) => {
  newStr = str.replace(/\n|\r\n|\r/g, "_");
  newStr = newStr.replace(/ /g, "_");
  return newStr
}

const logicalToDDL = (logicalModel) => {
  let stringQuery = []
  logicalModel.columnFamilies.forEach((cf) => {
    let parentKeys = []
    let cfKeys = []

    stringQuery.push(`DROP TABLE IF EXISTS ${cf.label};`)
    stringQuery.push(`CREATE TABLE ${cf.label} (`)
    
    if (cf.parentColumnFam) {
      const parentAttributes = cf.parentColumnFam.attributes
      parentAttributes.forEach((attr) => {
        if (['Key', 'Auxiliary'].includes(attr.type)) {
          const dataType = document.getElementById(`${cf.parentColumnFam.label}-${attr.label}`).value
          stringQuery.push(`  ${removeNewLine(attr.label)} ${dataType.toUpperCase()},`)
          parentKeys.push(attr.label)
        }
      })
    }

    if (cf.attributes) {
      cf.attributes.forEach((attr) => {
        const dataType = document.getElementById(`${cf.label}-${attr.label}`).value
        stringQuery.push(`  ${removeNewLine(attr.label)}  ${dataType.toUpperCase()},`)
        if (['Key', 'Auxiliary'].includes(attr.type)) {
          cfKeys.push(attr.label)
        }
      })
    }
    createPrimaryKey(parentKeys, cfKeys, stringQuery)
    stringQuery.push(');')
    stringQuery.push('')
  })
  return stringQuery
}


// ============================================================================================
// Visualize logical schema

const getGroup = (cf) => {
  if (cf.parentColumnFam) {
    return cf.id
  }
  else return `${cf.id}-attr`
}

const getSymbol = (attr) => {
  if (["Key", "Auxiliary"].includes(attr.type)) {
    return `# ${attr.label}`
  }
  else if (attr.type == 'Intermediary') {
    return `^ ${attr.label}`
  }
  return attr.label
}

const visualizeLogicalModel = (columnFamilies) => {
  let gojs = {
    "class": "go.GraphLinksModel",
    "nodeDataArray": [],
    "linkDataArray": [], 
  }

  columnFamilies.forEach(cf => {
    let groupData = {
      key: cf.id,
      isGroup: true,
      text: cf.label
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

const drawArtificialRelation = (gojs) => {
  let artificialMap = {}
  gojs.nodeDataArray.forEach(node => {
    if (!node.isGroup) {
      if ((node.artificialID || node.artificialID == 0) && node.type == "Auxiliary") {
        artificialMap[node.artificialID] = node.key
      }
    }
  })

  gojs.nodeDataArray.forEach(node => {
    if (!node.isGroup) {
      if ((node.artificialID || node.artificialID == 0) && node.type == "Intermediary") {
        let linkData = {}
        linkData.from = artificialMap[node.artificialID]
        linkData.to = node.key
        gojs.linkDataArray.push(linkData)
      }
    }
  })
}