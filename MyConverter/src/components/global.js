/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

var $ = go.GraphObject.make;

function save() {
  document.getElementById('mySavedModel').value = myDiagram.model.toJson();
  myDiagram.isModified = false;
}

function load() {
  myDiagram.model = go.Model.fromJson(document.getElementById('mySavedModel').value);
}

const convert = () => {
  const ERModelName = "Car and Person"
  const ERSchema = JSON.parse(myDiagram.model.toJson());
  
  let newERModel = new ERModel(ERModelName)
  newERModel.entityRelations = []

  // Get the entity and relationship
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
  })

  // Get the attributes


  console.log(newERModel)
}