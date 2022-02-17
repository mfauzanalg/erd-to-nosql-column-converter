const logicalShcema = [
  {
    name: 'X',
    attributes: [
      {
        name: 'x1',
        additional: {
          isKey: true,
        },
      },
    ],
    children: [
      {
        name: 'Y',
        attributes: [
          {
            name: 'y1',
            additional: {
              isKey: true,
            },
          },
          {
            name: 'y2',
            additional: {
              isMultiple: true,
              length: [-1, -1]
            }
          },
          {
            name: 'Z',
            additional: {
              isKey: true,
              isAuxiliary: true,
              artificialId: 1,
            }
          }
        ]
      }
    ]
  },
  {
    name: 'Z',
    attributes: [
      {
        name: 'z1',
        additional: {
          isKey: true,
        }
      },
      {
        name: 'z2',
        additional: {
          isMandatory: true,
        }
      },
      {
        name: 'z3',
        additional: {
          isMultiple: true,
          length: ['n', 'm']
        }
      },
      {
        name: 'Y',
        additional: {
          isIntermediary: true,
          artificialId: 1,
        }
      }
    ],
    children: [
      {
        name: 'W',
        attributes: [
          {
            name: 'w1'
          }
        ]
      }
    ]
  }
]

let tableQuery = []
const convertLogical = (logical, tableQuery) => {
  logical.forEach((table) => {
    tableQuery.push(`DROP TABLE IF EXISTS ${table.name}`)
    tableQuery.push(`CREATE TABLE ${table.name} (`)
    if (table.attributes) {
      table.attributes.forEach((attr) => {
        tableQuery.push(`  ${attr.name} TEXT,`)
      })
    }
    tableQuery.push(')')
    tableQuery.push('')

    if (table.children) {
      convertLogical(table.children, tableQuery)
    }

  })
  return tableQuery
}

const printDDL = (arrStr) => {
  arrStr.forEach(item => {
    console.log(item)
  })
}

printDDL(convertLogical(logicalShcema, tableQuery));