const logicalModel = {
  columnFamily: [
    {
      "id": 0,
      "label": "Person",
      "attributes": [
        {
          "label": "Address",
          "type": "Regular"
        },
        {
          "label": "Name",
          "isKey": true
        }
      ]
    },
    {
      "id": 3,
      "label": "Car",
      "attributes": [
        {
          "label": "Color",
          "type": "Regular"
        },
        {
          "label": "Plat",
          "isKey": true
        },
        {
          "label": "Have",
          "isIntermediary": true,
          "artificialID": 0,
          "isKey": true
        }
      ]
    },
    {
      "id": 2,
      "label": "Have",
      "attributes": [
        {
          "label": "Name",
          "isKey": true
        },
        {
          "label": "Address",
          "type": "Regular"
        },
        {
          "label": "Car",
          "isAuxilary": true,
          "isKey": true,
          "artificialID": 0
        }
      ],
      "parentID": 0,
      "isFromRelationship": true
    }
  ]
};

const createPrimaryKey = (keys, tableQuery) => {
  const primaryKey = `PRIMARY KEY (${keys.toString()})`
  tableQuery.push(primaryKey)
}

const logicalToDDL = (logicalModel) => {
  let tableQuery = []
  logicalModel.columnFamily.forEach((cf) => {
    let keys = []
    tableQuery.push(`DROP TABLE IF EXISTS ${cf.label}`)
    tableQuery.push(`CREATE TABLE ${cf.label} (`)
    if (cf.attributes) {
      cf.attributes.forEach((attr) => {
        tableQuery.push(`  ${attr.label} TEXT,`)
        if (attr.isKey) {
          keys.push(attr.label)
        }
      })
    }
    createPrimaryKey(keys, tableQuery)
    tableQuery.push(')')
    tableQuery.push('')
  })
  return tableQuery
}



const print = (myObject) => {
  console.log(JSON.stringify(myObject, null, 4));
}
console.log(logicalToDDL(logicalModel))
// print(logicalToDDL(logicalModel))
// logicalToDDL(logicalModel)