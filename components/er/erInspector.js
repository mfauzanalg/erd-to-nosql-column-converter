/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

let ERType = ["Rectangle", "DoubleRectangle", "AssociativeRectangle", "Diamond", "DoubleDiamond"]
let isShowTotal = false
let isShowOne = false
let isSpecialization = false
let inspector

function initERInspector() {
  inspector = new Inspector('myInspectorDiv', myDiagram, {
    properties: {
      text: {show: true},
      color: {show: false},
      figure: {show: false},
      width: {show: false},
      key: {show: false},
      location: {show: false},
      height: {show: false},
      fromLinkable: {show: false},
      toLinkable: {show: false},
      isParent: {show: false, type: "checkbox"},
      isTotal: {show: false, type: "checkbox"},
      isOne: {show: false, type: "checkbox"},
      strokeDashArray: {show: false},
      fromLinkableDuplicates: {show: false},
      toLinkableDuplicates: {show: false},
      fromMaxLinks: {show: false},
      underline: {show: false},
      from: {show: false},
      to: {show: false},
      min: {show: false},
      max: {show: false}
    },
  });
}


const getIsShowTotalOne = (inspectedObject) => {

  if (inspectedObject.figure == 'Ring') {
    inspector.declaredProperties.min = {
      show: true,
    }
    inspector.declaredProperties.max = {
      show: true,
    }
    inspector.declaredProperties.text = {
      show: false,
    }
  }
  else {
    inspector.declaredProperties.min = {
      show: false,
    }
    inspector.declaredProperties.max = {
      show: false,
    }


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
    
    inspector.declaredProperties.text = {
      show: isShowTotal,
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

  inspector.declaredProperties.text = {
    show: true,
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