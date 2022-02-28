// const logicalSchema = [
//   {
//     label: 'X',
//     key: 'x1',
//     attributes: [
//       {
//         label: 'x1',
//         additional: {
//           isKey: true,
//         },
//       },
//     ],
//     children: [
//       {
//         label: 'Y',
//         parent: 'X',
//         sharedKey: 'x1',
//         attributes: [
//           {
//             label: 'y1',
//           },
//           {
//             label: 'y2',
//             additional: {
//               isMultiple: true,
//               length: [-1, -1]
//             }
//           },
//           {
//             label: 'Z',
//             additional: {
//               isKey: true,
//               isAuxiliary: true,
//               artificialId: 1,
//             }
//           }
//         ]
//       }
//     ]
//   },
//   {
//     label: 'Z',
//     key: 'z1',
//     attributes: [
//       {
//         label: 'z1',
//         additional: {
//           isKey: true,
//         }
//       },
//       {
//         label: 'z2',
//         additional: {
//           isMandatory: true,
//         }
//       },
//       {
//         label: 'z3',
//         additional: {
//           isMultiple: true,
//           length: ['n', 'm']
//         }
//       },
//       {
//         label: 'Y',
//         additional: {
//           isIntermediary: true,
//           artificialId: 1,
//         }
//       }
//     ],
//     children: [
//       {
//         label: 'W',
//         parent: 'Z',
//         attributes: [
//           {
//             label: 'w1'
//           }
//         ]
//       }
//     ]
//   }
// ]


const logicalSchema = [
  {
    label: 'Person',
    key: ['Name'],
    attributes: [
      {
        label: 'Name',
        isKey: true,
      },
    ],
    children: [
      {
        label: 'Have',
        parent: 'Person',
        sharedKey: 'name',
        attributes: [
          {
            label: 'Car',
            isKey: true,
            isAuxiliary: true,
            artificialId: 1,
          }
        ]
      }
    ]
  },
  {
    label: 'Car',
    key: ['Plat'],
    attributes: [
      {
        label: 'Plat',
          isKey: true
      },
      {
        label: 'Color',
      },
      {
        label: 'Have',
        isIntermediary: true,
        artificialId: 1,
      }
    ]
  }
]


let tableQuery = []
const convertLogical = (logical, tableQuery) => {
  logical.forEach((table) => {
    tableQuery.push(`DROP TABLE IF EXISTS ${table.label}`)
    tableQuery.push(`CREATE TABLE ${table.label} (`)
    if (table.attributes) {
      table.attributes.forEach((attr) => {
        tableQuery.push(`  ${attr.label} TEXT,`)
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

printDDL(convertLogical(logicalSchema, tableQuery));