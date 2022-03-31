import { ERModel, convertERToLogical, getArrayKey } from './ERToLogical.js';

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
          stringQuery.push(`  ${attr.label} TEXT,`)
          parentKeys.push(attr.label)
        }
      })
    }

    if (cf.attributes) {
      cf.attributes.forEach((attr) => {
        stringQuery.push(`  ${attr.label} TEXT,`)
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

const logicalModel = convertERToLogical(ERModel)
console.log(logicalModel)

const DDL = logicalToDDL(logicalModel)
printDDL(DDL)