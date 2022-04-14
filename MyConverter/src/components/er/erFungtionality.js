/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

var $ = go.GraphObject.make;
let contents = {}

// Clear Diagram
const clearDiagram = () => {
  myDiagram.model = go.Model.fromJson(
  { "class": "GraphLinksModel",
  "nodeDataArray": [],
  "linkDataArray": []})
}

// Save Diagram
const download = (filename, text) => {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

const save = () => {
  document.getElementById('mySavedModel').value = myDiagram.model.toJson();
  download("hello.json", myDiagram.model.toJson());
  myDiagram.isModified = false;
}

// Load Diagram
const readSingleFile = (evt) => {
  var f = evt.target.files[0];
  if (f) {
      var r = new FileReader();
      r.onload = function(e) { 
        contents = e.target.result;
        myDiagram.model = go.Model.fromJson(contents)
      }
      r.readAsText(f);
  } else {
      alert("Failed to load file");
  }
}
document.getElementById('load-input').addEventListener('change', readSingleFile, false);

const load = () => {
  document.getElementById('load-input').click();
}

const loadDefault = () => {
  myDiagram.model = go.Model.fromJson(document.getElementById('mySavedModel').value);
}

// Convert Diagram
const convertToERModel = () => {
  const ERModelName = "Car and Person"
  const ERSchema = JSON.parse(myDiagram.model.toJson());
  
  let newERModel = new ERModel(ERModelName)
  newERModel.entityRelations = []
  let attributeArray = []

  // Get the entity, relationship and attributes
  ERSchema.nodeDataArray.forEach((ER) => {
    // Entity
    if (["Rectangle", "DoubleRectangle", "AssociativeEntity"].includes(ER.figure)) {
      const newEntity = new Entity(ERModelName, ER.text)
      newEntity.id = ER.key

      if (ER.figure == "Rectangle") newEntity.type = "Entity"
      else if (ER.figure == "DoubleRectangle") newEntity.type = "WeakEntity"
      else if (ER.figure == "AssocciativeEntity") newEntity.type = "AssociativeEntity"

      newERModel.entityRelations.push(newEntity)
    }
    // Relationship
    else if (["TriangleDown", "Diamond", "DoubleDiamond"].includes(ER.figure)) {
      const newRelationship = new Relationship(ERModelName, ER.text)
      newRelationship.id = ER.key

      if (ER.figure == "TriangleDown") newRelationship.type = "SpecialConnector"
      else if (ER.figure == "Diamond") newRelationship.type = "Relationship"
      else if (ER.figure == "DoubleDiamond") newRelationship.type = "WeakRelationship"

      newERModel.entityRelations.push(newRelationship)
    }
    // Attribute
    else {
      const newAttribute = new Attribute(ER.text)
      newAttribute.id = ER.key

      if (ER.figure == "Ring")  newAttribute.type = "Multivalued"
      else if (ER.figure == "Ellipse" && ER.underline) newAttribute.type = "Key"
      else if (ER.figure == "Ellipse" && ER.strokeDashArray?.length > 0) newAttribute.type = "Derived"
      else newAttribute.type = "Regular"

      attributeArray.push(newAttribute)
    }
  })

  // Process the link
  const processedAttributes = []
  const unprocessedLinks = []
  ERSchema.linkDataArray.forEach((link) => {
    const cardinality = link.isOne ? "One" : "Many"
    const participation = link.isTotal ? "Total" : "Partial"
    const newConnector = new Connector(ERModelName, link.from, link.to, cardinality, participation)

    let ERFrom = newERModel.entityRelations.find(o => o.id == link.from)
    let ERTo = newERModel.entityRelations.find(o => o.id == link.to)

    // Relation between Entity and Relationship
    if (ERFrom && ERTo) {
      newConnector.type = "RelationConnector"
      ERFrom.connectors.push(newConnector)
      ERTo.connectors.push(newConnector)
    }
    // From Attribute to Entity/Relationship
    else if (!ERFrom) {
      ERFrom = attributeArray.find(o => o.id == link.from)
      ERFrom.ER = ERTo.label
      ERTo.attributes.push(ERFrom)
    }
    else if (!ERTo) {
      ERTo = attributeArray.find(o => o.id == link.to)
      ERTo.ER = ERFrom.label
      ERFrom.attributes.push(ERTo)
    }
  })

  return newERModel
}

const convertToLogical = () => {
  const newERModel123 = {
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
  const newERModel = convertToERModel()
  console.log(newERModel)
  createReference(newERModel)
  splitER(newERModel)
  const logicalModel = convertERToLogical(newERModel)

  // print2(logicalModel)

  const logicalSchema = visualizeLogicalModel(logicalModel.columnFamilies)
  console.log(logicalSchema)
}

// createReference(ERModel)
// splitER(ERModel)



// Kekurangan
// Type di connector blm implement
// How can kita membatasi konstrain2 saat membangun ERD
// kalo yg one to many gtu gmn supaya yang ada cuma buat shape2 tertentu aja
// Kalau composite attribute agak susah karena tidak tau from to nya
// Attribute bisa nyambung kemana pun sesuka hati