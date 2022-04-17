/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

var $ = go.GraphObject.make;
let contents = {}
const ername = document.getElementById("er-name-input")
const logicalName = document.getElementById("logical-schema-name")
const logicalSection = document.getElementById("logical-schema-section")
let logicalModel

// Clear Diagram
const clearDiagram = () => {
  myDiagram.model = go.Model.fromJson(
  { "class": "GraphLinksModel",
  "nodeDataArray": [],
  "linkDataArray": []})
  ername.value = ""
  logicalName.innerHTML = ""
  logicalSection.style.display = "none"

  document.getElementById("convertDDL-btn").style.display = "inline-block"
  document.getElementById("button-container-logical").style.display = "block"
  document.getElementById("data-type-input").innerHTML = ""
  document.getElementById("data-type-input-container").style.display = "none"
  document.getElementById("ddl-section").style.display = "none"
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
  ername.value = "Car and Person"
  logicalSection.style.display = "none"

  // development
  document.getElementById("convert-logical-btn").click()
  document.getElementById("convertDDL-btn").click()
}

// Convert Diagram
const convertToERModel = (ername) => {
  const ERModelName = ername
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
  const ername = document.getElementById("er-name-input")
  document.getElementById("convertDDL-btn").style.display = "inline-block"
  document.getElementById("button-container-logical").style.display = "block"
  document.getElementById("data-type-input").innerHTML = ""
  document.getElementById("data-type-input-container").style.display = "none"
  document.getElementById("ddl-section").style.display = "none"


  if (ername.value == "") {
    alert("Please fill yhe entity relationship name")
  }
  else {
    logicalSection.style.display = "block"
    logicalName.innerHTML = `for ${ername.value}`

    const logicalTitle = document.getElementById("logical-schema-title")
    logicalTitle.scrollIntoView()
  
    const newERModel = convertToERModel(ername.value)
  
    console.log("ER MODEL")
    console.log(newERModel)

    createReference(newERModel)
    splitER(newERModel)
  
    
    logicalModel = convertERToLogical(newERModel)
    console.log("LOGICAL MODEL")
    console.log(logicalModel)
    const logicalSchema = visualizeLogicalModel(logicalModel.columnFamilies)
  
    loadLogical(logicalSchema);
  }
}

// createReference(ERModel)
// splitER(ERModel)



// Kekurangan
// Type di connector blm implement
// How can kita membatasi konstrain2 saat membangun ERD
// kalo yg one to many gtu gmn supaya yang ada cuma buat shape2 tertentu aja
// Kalau composite attribute agak susah karena tidak tau from to nya
// Attribute bisa nyambung kemana pun sesuka hati