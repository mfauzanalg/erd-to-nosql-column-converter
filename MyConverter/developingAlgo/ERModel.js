// One Partial - One Total (OK) Pass
const ERModel = {
  entityRelations: [
    {
      id: 0,
      label: 'Person',
      type: 'Entity',
      attributes: [
        {
          type: 'Key',
          label: 'Name'
        },
        {
          type: 'Regular',
          label: 'Address'
        }
      ],
      connectors: [
        {
          type: 'RelationConnector',
          from: 2,
          to: 0,
          cardinality: 'One',
          participation: 'Partial'
        },
      ]
    },
    {
      id: 2,
      label: 'Have',
      type: 'Relationship',
      connectors: [
        {
          type: 'RelationConnector',
          from: 2,
          to: 0,
          cardinality: 'One',
          participation: 'Partial'
        },
        {
          type: 'RelationConnector',
          from: 2,
          to: 3,
          cardinality: 'One',
          participation: 'Total'
        }
      ]
    },
    {
      id: 3,
      label: 'Car',
      type: 'Entity',
      connectors: [
        {
          type: 'RelationConnector',
          from: 2,
          to: 3,
          cardinality: 'One',
          participation: 'Total'
        },
      ],
      attributes: [
        {
          type: 'Key',
          label: 'Plat'
        },
        {
          type: 'Regular',
          label: 'Color'
        }
      ],
    },
  ],
}

// Simple One to Many (OK) Pass
const ERModel = {
  entityRelations: [
    {
      id: 0,
      label: 'Person',
      type: 'Entity',
      attributes: [
        {
          type: 'Key',
          label: 'Name'
        },
        {
          type: 'Regular',
          label: 'Address'
        }
      ],
      connectors: [
        {
          type: 'RelationConnector',
          from: 2,
          to: 0,
          cardinality: 'One',
          participation: 'Total'
        },
      ]
    },
    {
      id: 2,
      label: 'Have',
      type: 'Relationship',
      connectors: [
        {
          type: 'RelationConnector',
          from: 2,
          to: 0,
          cardinality: 'One',
          participation: 'Total'
        },
        {
          type: 'RelationConnector',
          from: 2,
          to: 3,
          cardinality: 'Many',
          participation: 'Total'
        }
      ]
    },
    {
      id: 3,
      label: 'Car',
      type: 'Entity',
      connectors: [
        {
          type: 'RelationConnector',
          from: 2,
          to: 3,
          cardinality: 'Many',
          participation: 'Total'
        },
      ],
      attributes: [
        {
          type: 'Key',
          label: 'Plat'
        },
        {
          type: 'Regular',
          label: 'Color'
        }
      ],
    },
  ],
}

// Game
const ERModel = {
  entityRelations: [
    {
      id: 0,
      label: 'Player',
      type: 'Entity',
      key: ['UserName'],
      attributes: [
        {
          type: 'Key',
          label: 'UserName'
        },
        {
          type: 'Regular',
          label: 'FirstName'
        }
      ],
      connectors: [
        {
          type: 'RelationConnector',
          from: 1,
          to: 0,
          cardinality: 'One',
          participation: 'Total'
        },
        {
          type: 'RelationConnector',
          from: 2,
          to: 0,
          cardinality: 'One',
          participation: 'Total'
        },
      ]
    },
    {
      id: 1,
      label: 'First',
      type: 'Relationship',
      connectors: [
        {
          type: 'RelationConnector',
          from: 1,
          to: 0,
          cardinality: 'One',
          participation: 'Total'
        },
        {
          type: 'RelationConnector',
          from: 1,
          to: 3,
          cardinality: 'Many',
          participation: 'Total'
        }
      ]
    },
    {
      id: 2,
      label: 'Second',
      type: 'Relationship',
      connectors: [
        {
          type: 'RelationConnector',
          from: 2,
          to: 0,
          cardinality: 'One',
          participation: 'Total'
        },
        {
          type: 'RelationConnector',
          from: 2,
          to: 3,
          cardinality: 'Many',
          participation: 'Total'
        }
      ]
    },
    {
      id: 3,
      label: 'Game',
      type: 'Entity',
      connectors: [
        {
          type: 'RelationConnector',
          from: 2,
          to: 3,
          cardinality: 'Many',
          participation: 'Total'
        },
        {
          type: 'RelationConnector',
          from: 1,
          to: 3,
          cardinality: 'Many',
          participation: 'Total'
        },
      ],
      attributes: [
        {
          type: 'Regular',
          label: 'Color'
        }
      ],
    },
  ],
}

// ERModel One to many to many
const ERModel = {
  entityRelations: [
    {
      id: 3,
      label: 'Car',
      type: 'Entity',
      key: ['Plat'],
      connectors: [
        {
          type: 'RelationConnector',
          from: 2,
          to: 3,
          cardinality: 'Many',
          participation: 'Total'
        },
        {
          type: 'RelationConnector',
          from: 4,
          to: 3,
          cardinality: 'Many',
          participation: 'Total'
        },
      ],
      attributes: [
        {
          type: 'Key',
          label: 'Plat'
        },
        {
          type: 'Regular',
          label: 'Color'
        }
      ],
    },
    {
      id: 2,
      label: 'Have',
      type: 'Relationship',
      connectors: [
        {
          type: 'RelationConnector',
          from: 2,
          to: 0,
          cardinality: 'One',
          participation: 'Total'
        },
        {
          type: 'RelationConnector',
          from: 2,
          to: 3,
          cardinality: 'Many',
          participation: 'Total'
        }
      ]
    },
    {
      id: 4,
      label: 'Drive',
      type: 'Relationship',
      connectors: [
        {
          type: 'RelationConnector',
          from: 4,
          to: 3,
          cardinality: 'Many',
          participation: 'Total'
        },
        {
          type: 'RelationConnector',
          from: 4,
          to: 5,
          cardinality: 'Many',
          participation: 'Total'
        }
      ]
    },
    {
      id: 0,
      label: 'Person',
      type: 'Entity',
      key: ['Name'],
      attributes: [
        {
          type: 'Key',
          label: 'Name'
        },
        {
          type: 'Regular',
          label: 'Address'
        }
      ],
      connectors: [
        {
          type: 'RelationConnector',
          from: 2,
          to: 0,
          cardinality: 'One',
          participation: 'Total'
        },
      ]
    },
    {
      id: 5,
      label: 'Driver',
      type: 'Entity',
      key: ['LicenseNumber'],
      attributes: [
        {
          type: 'Key',
          label: 'LicenseNumber'
        },
      ],
      connectors: [
        {
          type: 'RelationConnector',
          from: 4,
          to: 5,
          cardinality: 'Many',
          participation: 'Total'
        },
      ]
    },
  ],
}

// Specialization No Total (OK) PASS
const ERModel = {
  entityRelations: [
    {
      id: 0,
      label: 'H',
      type: 'Entity',
      connectors: [
        {
          type: 'ParentSpecialization',
          from: 1,
          to: 0,
        },
      ],
      attributes: [
        {
          type: 'Key',
          label: 'id_1'
        },
      ],
    },
    {
      id: 2,
      label: 'F',
      type: 'Entity',
      connectors: [
        {
          type: 'Specialization',
          from: 1,
          to: 2,
        },
      ],
      attributes: [
        {
          type: 'Regular',
          label: 'Bogor'
        },
      ],
    },
    
    {
      id: 1,
      label: 'Special',
      type: 'Specialization',
      isTotal: false,
      isDisjoint: true,
      superID: 0,
      connectors: [
        {
          type: 'ParentSpecialization',
          from: 1,
          to: 0,
        },
        {
          type: 'Specialization',
          from: 1,
          to: 2,
        },
        {
          type: 'Specialization',
          from: 1,
          to: 3,
        },
      ],
    },
    {
      id: 3,
      label: 'G',
      type: 'Entity',
      connectors: [
        {
          type: 'Specialization',
          from: 1,
          to: 3,
        },
      ],
    },
  ],
}

// Specialization Total & One to many (OK) PASS
const ERModel = {
  entityRelations: [
    {
      id: 2,
      label: 'B',
      type: 'Entity',
      connectors: [
        {
          type: 'Specialization',
          from: 1,
          to: 2,
        },
        {
          type: 'RelationConnector',
          from: 4,
          to: 2,
          cardinality: 'One',
          participation: 'Total'
        },
      ],
      attributes: [
        {
          type: 'Regular',
          label: 'Bogor'
        },
      ],
    },
    {
      id: 0,
      label: 'A',
      type: 'Entity',
      connectors: [
        {
          type: 'ParentSpecialization',
          from: 1,
          to: 0,
        },
      ],
      attributes: [
        {
          type: 'Key',
          label: 'id_1'
        },
      ],
    },
    {
      id: 1,
      label: 'Special',
      type: 'Specialization',
      isTotal: true,
      isDisjoint: true,
      superID: 0,
      connectors: [
        {
          type: 'ParentSpecialization',
          from: 1,
          to: 0,
        },
        {
          type: 'Specialization',
          from: 1,
          to: 2,
        },
        {
          type: 'Specialization',
          from: 1,
          to: 3,
        },
      ],
    },
    {
      id: 3,
      label: 'C',
      type: 'Entity',
      connectors: [
        {
          type: 'Specialization',
          from: 1,
          to: 3,
        },
      ],
    },
    {
      id: 4,
      label: 'R1',
      type: 'Relationship',
      connectors: [
        {
          type: 'RelationConnector',
          from: 4,
          to: 2,
          cardinality: 'One',
          participation: 'Total'
        },
        {
          type: 'RelationConnector',
          from: 4,
          to: 5,
          cardinality: 'Many',
          participation: 'Total'
        }
      ]
    },
    {
      id: 5,
      label: 'E',
      type: 'Entity',
      connectors: [
        {
          type: 'RelationConnector',
          from: 4,
          to: 5,
          cardinality: 'Many',
          participation: 'Total'
        },
      ]
    },
  ],
}

// Asssociative Relation (OK) PASS
const ERModel = {
  entityRelations: [
    {
      id: 0,
      label: 'E',
      type: 'Entity',
      attributes: [
        {
          type: 'Key',
          label: 'Name'
        },
      ],
      connectors: [
        {
          type: 'RelationConnector',
          from: 2,
          to: 0,
          cardinality: 'Many',
          participation: 'Partial'
        },
      ]
    },
    {
      id: 5,
      label: 'R2',
      type: 'Relationship',
      connectors: [
        {
          type: 'RelationConnector',
          from: 5,
          to: 4,
          cardinality: 'One',
          participation: 'Total',
        },
        {
          type: 'RelationConnector',
          from: 5,
          to: 2,
          cardinality: 'One',
          participation: 'Partial',
        }
      ],
    },
    {
      id: 2,
      label: 'R3',
      type: 'AssociativeEntity',
      connectors: [
        {
          type: 'RelationConnector',
          from: 5,
          to: 2,
          cardinality: 'One',
          participation: 'Partial',
        },
        {
          type: 'RelationConnector',
          from: 2,
          to: 0,
          cardinality: 'Many',
          participation: 'Partial'
        },
        {
          type: 'RelationConnector',
          from: 2,
          to: 3,
          cardinality: 'Many',
          participation: 'Partial'
        }
      ]
    },
    {
      id: 4,
      label: 'D',
      type: 'Entity',
      connectors: [
        {
          type: 'RelationConnector',
          from: 5,
          to: 4,
          cardinality: 'One',
          participation: 'Total',
        }
      ]
    },
    {
      id: 3,
      label: 'H',
      type: 'Entity',
      connectors: [
        {
          type: 'RelationConnector',
          from: 2,
          to: 3,
          cardinality: 'Many',
          participation: 'Partial'
        },
      ],
      attributes: [
        {
          type: 'Key',
          label: 'Plat'
        },
        {
          type: 'Regular',
          label: 'Color'
        }
      ],
    },
  ],
}

// Contoh poffo mello (OK) PASS
const ERModel = {
  entityRelations: [
    {
      id: 6,
      label: 'B',
      type: 'Entity',
      connectors: [
        {
          type: 'Specialization',
          from: 12,
          to: 6,
        },
        {
          type: 'RelationConnector',
          from: 8,
          to: 6,
          cardinality: 'One',
          participation: 'Total'
        },
      ],
      attributes: [
        {
          type: 'Regular',
          label: 'Bogor'
        },
      ],
    },
    {
      id: 1,
      label: 'A',
      type: 'Entity',
      connectors: [
        {
          type: 'ParentSpecialization',
          from: 12,
          to: 1,
        },
      ],
      attributes: [
        {
          type: 'Key',
          label: 'id_1'
        },
      ],
    },
    {
      id: 12,
      label: 'Special',
      type: 'Specialization',
      isTotal: true,
      isDisjoint: true,
      superID: 1,
      connectors: [
        {
          type: 'ParentSpecialization',
          from: 12,
          to: 1,
        },
        {
          type: 'Specialization',
          from: 12,
          to: 6,
        },
        {
          type: 'Specialization',
          from: 12,
          to: 7,
        },
        {
          type: 'Specialization',
          from: 12,
          to: 4,
        },
      ],
    },
    {
      id: 7,
      label: 'C',
      type: 'Entity',
      connectors: [
        {
          type: 'Specialization',
          from: 12,
          to: 7,
        },
      ],
    },
    {
      id: 8,
      label: 'R1',
      type: 'Relationship',
      connectors: [
        {
          type: 'RelationConnector',
          from: 8,
          to: 6,
          cardinality: 'One',
          participation: 'Total'
        },
        {
          type: 'RelationConnector',
          from: 8,
          to: 0,
          cardinality: 'Many',
          participation: 'Partial'
        }
      ]
    },
    {
      id: 0,
      label: 'E',
      type: 'Entity',
      connectors: [
        {
          type: 'RelationConnector',
          from: 8,
          to: 0,
          cardinality: 'Many',
          participation: 'Partial'
        },
        {
          type: 'RelationConnector',
          from: 2,
          to: 0,
          cardinality: 'Many',
          participation: 'Partial'
        },
      ]
    },
    {
      id: 5,
      label: 'R2',
      type: 'Relationship',
      connectors: [
        {
          type: 'RelationConnector',
          from: 5,
          to: 4,
          cardinality: 'One',
          participation: 'Total',
        },
        {
          type: 'RelationConnector',
          from: 5,
          to: 2,
          cardinality: 'One',
          participation: 'Partial',
        }
      ],
    },
    {
      id: 2,
      label: 'R3',
      type: 'AssociativeEntity',
      connectors: [
        {
          type: 'RelationConnector',
          from: 5,
          to: 2,
          cardinality: 'One',
          participation: 'Partial',
        },
        {
          type: 'RelationConnector',
          from: 2,
          to: 0,
          cardinality: 'Many',
          participation: 'Partial'
        },
        {
          type: 'RelationConnector',
          from: 2,
          to: 3,
          cardinality: 'Many',
          participation: 'Partial'
        }
      ]
    },
    {
      id: 4,
      label: 'D',
      type: 'Entity',
      connectors: [
        {
          type: 'RelationConnector',
          from: 5,
          to: 4,
          cardinality: 'One',
          participation: 'Total',
        },
        {
          type: 'Specialization',
          from: 12,
          to: 4,
        },
      ]
    },
    {
      id: 3,
      label: 'H',
      type: 'Entity',
      connectors: [
        {
          type: 'RelationConnector',
          from: 2,
          to: 3,
          cardinality: 'Many',
          participation: 'Partial'
        },
        {
          type: 'ParentSpecialization',
          from: 11,
          to: 3,
        },
      ],
      attributes: [
        {
          type: 'Key',
          label: 'Plat'
        },
        {
          type: 'Regular',
          label: 'Color'
        }
      ],
    },
    {
      id: 11,
      label: 'Special',
      type: 'Specialization',
      isTotal: false,
      isDisjoint: true,
      superID: 3,
      connectors: [
        {
          type: 'ParentSpecialization',
          from: 11,
          to: 3,
        },
        {
          type: 'Specialization',
          from: 11,
          to: 9,
        },
        {
          type: 'Specialization',
          from: 11,
          to: 10,
        },
      ],
    },
    {
      id: 10,
      label: 'G',
      type: 'Entity',
      connectors: [
        {
          type: 'Specialization',
          from: 11,
          to: 10,
        },
      ],
    },
    {
      id: 9,
      label: 'F',
      type: 'Entity',
      connectors: [
        {
          type: 'Specialization',
          from: 11,
          to: 9,
        },
      ],
      attributes: [
        {
          type: 'Regular',
          label: 'Bogor'
        },
      ],
    },
  ],
}

// Simplified composite attribute (OK) PASS
const ERModel = {
  entityRelations: [
    {
      id: 0,
      label: 'E',
      type: 'Entity',
      attributes: [
        {
          type: 'Composite',
          label: 'Oke',
          children: [
            {
              type: 'Regular',
              label: 'Fauzan'
            },
          ]
        },
        {
          type: 'Key',
          label: 'Name'
        }
      ],
    },
  ],
}

// Composite attribute (OK) Pass
const ERModel = {
  entityRelations: [
    {
      id: 0,
      label: 'E',
      type: 'Entity',
      attributes: [
        {
          type: 'Composite',
          label: 'Oke',
          children: [
            {
              type: 'Regular',
              label: 'Fauzan'
            },
            {
              type: 'Composite',
              label: 'Ghifari',
              children: [
                {
                  type: 'Regular',
                  label: 'A'
                },
                {
                  type: 'Regular',
                  label: 'B'
                }
              ]
            }
          ]
        },
        {
          type: 'Key',
          label: 'Name'
        }
      ],
    },
  ],
}

// Weak Entity (OK)
const ERModel = {
  entityRelations: [
    {
      id: 0,
      label: 'Person',
      type: 'Entity',
      attributes: [
        {
          type: 'Key',
          label: 'Name'
        },
        {
          type: 'Regular',
          label: 'Address'
        }
      ],
      connectors: [
        {
          type: 'RelationConnector',
          from: 2,
          to: 0,
          cardinality: 'One',
          participation: 'Total'
        },
      ]
    },
    {
      id: 2,
      label: 'Have',
      type: 'WeakRelationship',
      connectors: [
        {
          type: 'RelationConnector',
          from: 2,
          to: 0,
          cardinality: 'One',
          participation: 'Total'
        },
        {
          type: 'RelationConnector',
          from: 2,
          to: 3,
          cardinality: 'One',
          participation: 'Total'
        }
      ]
    },
    {
      id: 3,
      label: 'Car',
      type: 'WeakEntity',
      connectors: [
        {
          type: 'RelationConnector',
          from: 2,
          to: 3,
          cardinality: 'One',
          participation: 'Total'
        },
      ],
      attributes: [
        {
          type: 'Key',
          label: 'Plat'
        },
        {
          type: 'Regular',
          label: 'Color'
        }
      ],
    },
  ],
}

// Reflexive
const ERModel = {
  entityRelations: [
    {
      id: 0,
      label: 'Employee',
      type: 'Entity',
      key: ['Name'],
      attributes: [
        {
          type: 'Key',
          label: 'Name'
        },
        {
          type: 'Regular',
          label: 'Address'
        }
      ],
      connectors: [
        {
          type: 'RelationConnector',
          from: 2,
          to: 0,
          cardinality: 'One',
          participation: 'Partial'
        },
        {
          type: 'RelationConnector',
          from: 2,
          to: 0,
          cardinality: 'Many',
          participation: 'Partial'
        },
      ]
    },
    {
      id: 2,
      label: 'Supervision',
      type: 'ReflexiveRelationship',
      connectors: [
        {
          type: 'RelationConnector',
          from: 2,
          to: 0,
          cardinality: 'One',
          participation: 'Partial'
        },
        {
          type: 'RelationConnector',
          from: 2,
          to: 0,
          cardinality: 'Many',
          participation: 'Total'
        }
      ]
    },
  ],
}
