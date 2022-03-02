// Simple One to Many
const ERSchema = {
  shapes: [
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
      key: ['Plat'],
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
const ERSchema = {
  shapes: [
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

// ERSchema3 One to many to many
const ERSchema = {
  shapes: [
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

// Specialization
const ERSchema = {
  shapes: [
    {
      id: 0,
      label: 'H',
      type: 'Entity',
      key: ['id_1'],
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
          type: 'ChildrenSpecialization',
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
      parentID: 0,
      connectors: [
        {
          type: 'ParentSpecialization',
          from: 1,
          to: 0,
        },
        {
          type: 'ChildrenSpecialization',
          from: 1,
          to: 2,
        },
        {
          type: 'ChildrenSpecialization',
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
          type: 'ChildrenSpecialization',
          from: 1,
          to: 3,
        },
      ],
    },
  ],
}