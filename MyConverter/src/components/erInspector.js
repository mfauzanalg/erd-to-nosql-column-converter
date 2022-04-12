/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

let ERType = ["Rectangle", "DoubleRectangle", "AssociativeEntity", "Diamond", "DoubleDiamond"]
let isShowTotal = false
let isShowOne = false
let isSpecialization = false
let inspector

function initERInspector() {
  inspector = new Inspector('myInspectorDiv', myDiagram, {
    properties: {
      text: {show: Inspector.showIfPresent},
      color: {show: false},
      figure: {show: false},
      width: {show: false},
      key: {show: false},
      location: {show: false},
      height: {show: false},
      fromLinkable: {show: false},
      isParent: {show: false, type: "checkbox"},
      isTotal: {show: false, type: "checkbox"},
      isOne: {show: false, type: "checkbox"},
    },
  });
}


const getIsShowTotalOne = (inspectedObject) => {
  const nodes = JSON.parse(myDiagram.model.toJson()).nodeDataArray
  const selectedObject = inspectedObject
  const from = nodes.find(o => o.key == selectedObject.from)
  const to = nodes.find(o => o.key == selectedObject.to)

  isShowTotal = false
  isShowOne = false
  // If the seledted item is a link
  if (from && to) {
    // If the selected item is able to click isTotal
    if (ERType.includes(from.figure) && ERType.includes(to.figure)) {
      isShowTotal = true
      isShowOne = true
    }
  }
  
  inspector.declaredProperties.isTotal = {
    show: isShowTotal,
    type: "checkbox"
  } 
  inspector.declaredProperties.isOne = {
    show: isShowTotal,
    type: "checkbox"
  } 
}

const getIsSpecialization = (inspectedObject) => {
  const nodes = JSON.parse(myDiagram.model.toJson()).nodeDataArray
  const selectedObject = inspectedObject
  const from = nodes.find(o => o.key == selectedObject.from)
  const to = nodes.find(o => o.key == selectedObject.to)

  isSpecialization = false
  // If the seledted item is a link
  if (from && to) {
    // If the selected item is able to click isTotal
    console.log(from.figure)
    console.log(to.figure)
    if (from.figure == "TriangleDown" || to.figure == "TriangleDown") {
      isSpecialization = true
    }
  }


  inspector.declaredProperties.isParent = {
    show: isSpecialization,
    type: "checkbox"
  } 
  inspector.declaredProperties.isTotal = {
    show: isSpecialization || isShowTotal,
    type: "checkbox"
  } 
  inspector.declaredProperties.isDisjoint = {
    show: isSpecialization,
    type: "checkbox"
  } 
}