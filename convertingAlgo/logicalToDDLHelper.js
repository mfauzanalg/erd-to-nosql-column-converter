const removeNewLine = (str) => {
  newStr = str.replace(/\n|\r\n|\r/g, "_");
  newStr = newStr.replace(/ /g, "_");
  return newStr
}

const getGroup = (cf) => {
  if (cf.parentColumnFam) {
    return cf.id
  }
  else return `${cf.id}-attr`
}

const getColumnFamilyName = (cf) => {
  const min = parseInt(cf.min)
  const max = parseInt(cf.max)
  let range = "["
  if (min) range += min
  if (min || max) range += ":"
  if (max) range += max
  range += "]"

  if (min || max) return `${cf.label} | ${range}`
  else return cf.label
}

const getSymbol = (attr) => {
  if (["Key", "Auxiliary"].includes(attr.type)) {
    return `# ${attr.label}`
  }
  else if (attr.type == 'Intermediary') {
    return `^ ${attr.label}`
  }
  else if (attr.type == 'Multivalued') {
    const min = parseInt(attr.min)
    const max = parseInt(attr.max)
    let range = "["
    if (min) range += min
    if (min || max) range += ":"
    if (max) range += max
    range += "]"
    return `${range} ${attr.label}`
  }
  return attr.label
}

const createPrimaryKey = (parentKeys, cfKeys) => {
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

  return primaryKey
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