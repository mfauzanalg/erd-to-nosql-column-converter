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

const getSymbol = (attr) => {
  if (["Key", "Auxiliary"].includes(attr.type)) {
    return `# ${attr.label}`
  }
  else if (attr.type == 'Intermediary') {
    return `^ ${attr.label}`
  }
  else if (attr.type == 'Multivalued') {
    return `[ ] ${attr.label}`
  }
  return attr.label
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