[
  {
      "id": 1,
      "label": "A",
      "key": [
          "id_1"
      ],
      "attributes": [
          {
              "label": "id_1",
              "isKey": true
          }
      ]
  },
  {
      "id": 6,
      "label": "B",
      "key": [
          "id_1"
      ],
      "parentID": 1,
      "attributes": [
          {
              "label": "Bogor",
              "type": "Regular"
          }
      ]
  },
  {
      "id": 7,
      "label": "C",
      "key": [
          "id_1"
      ],
      "parentID": 1,
      "attributes": []
  },
  {
      "id": 0,
      "label": "E",
      "key": [
          "Name"
      ],
      "attributes": [
          {
              "label": "R1",
              "isIntermediary": true,
              "artificialID": 0,
              "isKey": true
          },
          {
              "label": "R3",
              "isIntermediary": true,
              "artificialID": 1,
              "isKey": true
          }
      ]
  },
  {
      "id": 8,
      "label": "R1",
      "key": [
          "id_1"
      ],
      "parentID": 1,
      "attributes": [
          {
              "label": "E",
              "isAuxilary": true,
              "isKey": true,
              "artificialID": 0
          }
      ],
      "isFromRelationship": true
  },
  {
      "id": 2,
      "label": "R3",
      "key": [
          "id_1"
      ],
      "parentID": 1,
      "attributes": [
          {
              "label": "E",
              "isAuxilary": true,
              "isKey": true,
              "artificialID": 1
          },
          {
              "label": "H",
              "isAuxilary": true,
              "isKey": true,
              "artificialID": 2
          }
      ],
      "isAssociativeEntity": true
  },
  {
      "id": 4,
      "label": "D",
      "key": [
          "id_1"
      ],
      "parentID": 1,
      "attributes": []
  },
  {
      "id": 3,
      "label": "H",
      "key": [
          "Plat"
      ],
      "attributes": [
          {
              "label": "Plat",
              "isKey": true
          },
          {
              "label": "Color",
              "type": "Regular"
          },
          {
              "label": "R3",
              "isIntermediary": true,
              "artificialID": 2,
              "isKey": true
          },
          {
              "label": "G",
              "isIntermediary": true,
              "artificialID": 3,
              "isKey": true
          },
          {
              "label": "F",
              "isIntermediary": true,
              "artificialID": 4,
              "isKey": true
          }
      ]
  },
  {
      "id": 10,
      "label": "G",
      "key": [
          "id_G"
      ],
      "attributes": []
  },
  {
      "id": "temporary10",
      "label": "G-H",
      "key": [],
      "parentID": 10,
      "attributes": [
          {
              "label": "H",
              "isAuxilary": true,
              "isKey": true,
              "artificialID": 3
          }
      ]
  },
  {
      "id": 9,
      "label": "F",
      "key": [
          "id_F"
      ],
      "attributes": [
          {
              "label": "Bogor",
              "type": "Regular"
          }
      ]
  },
  {
      "id": "temporary9",
      "label": "F-H",
      "key": [],
      "parentID": 9,
      "attributes": [
          {
              "label": "H",
              "isAuxilary": true,
              "isKey": true,
              "artificialID": 4
          }
      ]
  }
]

export interface LogicalSchema {
  id:                   number | string;
  label:                string;
  key:                  string[];
  attributes:           Attribute[];
  parentID?:            number;
  isFromRelationship?:  boolean;
  isAssociativeEntity?: boolean;
}

export interface Attribute {
  label:           string;
  isKey?:          boolean;
  type?:           string;
  isIntermediary?: boolean;
  artificialID?:   number;
  isAuxilary?:     boolean;
}