// JSON ER
{
  "shapes":[
     {
        "id":6,
        "label":"B",
        "type":"Entity",
        "connectors":[
           {
              "type":"ChildrenSpecialization",
              "from":12,
              "to":6
           },
           {
              "type":"RelationConnector",
              "from":8,
              "to":6,
              "cardinality":"One",
              "participation":"Total"
           }
        ],
        "attributes":[
           {
              "type":"Regular",
              "label":"Bogor"
           }
        ]
     },
     {
        "id":1,
        "label":"A",
        "type":"Entity",
        "key":[
           "id_1"
        ],
        "connectors":[
           {
              "type":"ParentSpecialization",
              "from":12,
              "to":1
           }
        ],
        "attributes":[
           {
              "type":"Key",
              "label":"id_1"
           }
        ]
     },
     {
        "id":12,
        "label":"Special",
        "type":"Specialization",
        "isTotal":true,
        "isDisjoint":true,
        "parentID":1,
        "connectors":[
           {
              "type":"ParentSpecialization",
              "from":12,
              "to":1
           },
           {
              "type":"ChildrenSpecialization",
              "from":12,
              "to":6
           },
           {
              "type":"ChildrenSpecialization",
              "from":12,
              "to":7
           },
           {
              "type":"ChildrenSpecialization",
              "from":12,
              "to":4
           }
        ]
     },
     {
        "id":7,
        "label":"C",
        "type":"Entity",
        "connectors":[
           {
              "type":"ChildrenSpecialization",
              "from":12,
              "to":7
           }
        ]
     },
     {
        "id":8,
        "label":"R1",
        "type":"Relationship",
        "connectors":[
           {
              "type":"RelationConnector",
              "from":8,
              "to":6,
              "cardinality":"One",
              "participation":"Total"
           },
           {
              "type":"RelationConnector",
              "from":8,
              "to":0,
              "cardinality":"Many",
              "participation":"Partial"
           }
        ]
     },
     {
        "id":0,
        "label":"E",
        "type":"Entity",
        "key":[
           "Name"
        ],
        "connectors":[
           {
              "type":"RelationConnector",
              "from":8,
              "to":0,
              "cardinality":"Many",
              "participation":"Partial"
           },
           {
              "type":"RelationConnector",
              "from":2,
              "to":0,
              "cardinality":"Many",
              "participation":"Partial"
           }
        ]
     },
     {
        "id":5,
        "label":"R2",
        "type":"Relationship",
        "connectors":[
           {
              "type":"RelationConnector",
              "from":5,
              "to":4,
              "cardinality":"One",
              "participation":"Total"
           },
           {
              "type":"RelationConnector",
              "from":5,
              "to":2,
              "cardinality":"One",
              "participation":"Partial"
           }
        ]
     },
     {
        "id":2,
        "label":"R3",
        "type":"AssociativeEntity",
        "connectors":[
           {
              "type":"RelationConnector",
              "from":5,
              "to":2,
              "cardinality":"One",
              "participation":"Partial"
           },
           {
              "type":"RelationConnector",
              "from":2,
              "to":0,
              "cardinality":"Many",
              "participation":"Partial"
           },
           {
              "type":"RelationConnector",
              "from":2,
              "to":3,
              "cardinality":"Many",
              "participation":"Partial"
           }
        ]
     },
     {
        "id":4,
        "label":"D",
        "type":"Entity",
        "connectors":[
           {
              "type":"RelationConnector",
              "from":5,
              "to":4,
              "cardinality":"One",
              "participation":"Total"
           },
           {
              "type":"ChildrenSpecialization",
              "from":12,
              "to":4
           }
        ]
     },
     {
        "id":3,
        "label":"H",
        "type":"Entity",
        "key":[
           "Plat"
        ],
        "connectors":[
           {
              "type":"RelationConnector",
              "from":2,
              "to":3,
              "cardinality":"Many",
              "participation":"Partial"
           },
           {
              "type":"ParentSpecialization",
              "from":11,
              "to":3
           }
        ],
        "attributes":[
           {
              "type":"Key",
              "label":"Plat"
           },
           {
              "type":"Regular",
              "label":"Color"
           }
        ]
     },
     {
        "id":11,
        "label":"Special",
        "type":"Specialization",
        "isTotal":false,
        "isDisjoint":true,
        "parentID":3,
        "connectors":[
           {
              "type":"ParentSpecialization",
              "from":11,
              "to":3
           },
           {
              "type":"ChildrenSpecialization",
              "from":11,
              "to":9
           },
           {
              "type":"ChildrenSpecialization",
              "from":11,
              "to":10
           }
        ]
     },
     {
        "id":10,
        "label":"G",
        "type":"Entity",
        "connectors":[
           {
              "type":"ChildrenSpecialization",
              "from":11,
              "to":10
           }
        ]
     },
     {
        "id":9,
        "label":"F",
        "type":"Entity",
        "connectors":[
           {
              "type":"ChildrenSpecialization",
              "from":11,
              "to":9
           }
        ],
        "attributes":[
           {
              "type":"Regular",
              "label":"Bogor"
           }
        ]
     }
  ]
}

// TS ER
export interface ERSchema {
   shapes: Shape[];
}

export interface Shape {
   id:          number;
   label:       string;
   type:        ShapeType;
   connectors:  Connector[];
   attributes?: Attribute[];
   key?:        string[];
   isTotal?:    boolean;
   isDisjoint?: boolean;
   parentID?:   number;
}

export interface Attribute {
   type:       AttributeType;
   label:      string;
   children?:  Attribute[];    
}

export interface Connector {
   type:           ConnectorType;
   from:           number;
   to:             number;
   cardinality?:   Cardinality;
   participation?: Participation;
}

export enum AttributeType {
   Regular     = "Regular",
   Key         = "Key",
   Composite   = "Composite"
}

export enum ShapeType {
   Entity                  = "Entity",
   Relationship            = "Relationship",
   ReflexiveRelationship   = "ReflexiveRelationship",
   Specialization          = "Specialization",
   AssociativeEntity       = "AssociativeEntity",
   WeakRelationship        = "WeakRelationship"
}

export enum ConnectorType {
   ChildrenSpecialization  = "ChildrenSpecialization",
   ParentSpecialization    = "ParentSpecialization",
   RelationConnector       = "RelationConnector",
}

export enum Cardinality {
   Many  = "Many",
   One   = "One",
}

export enum Participation {
   Partial  = "Partial",
   Total    = "Total",
}


