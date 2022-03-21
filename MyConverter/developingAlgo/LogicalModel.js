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