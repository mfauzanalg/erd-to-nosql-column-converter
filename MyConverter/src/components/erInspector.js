/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

function initERInspector() {
  var inspector = new Inspector('myInspectorDiv', myDiagram, {
    properties: {
      text: {show: Inspector.showIfPresent},
      color: {show: false},
      figure: {show: false},
      width: {show: false},
      key: {show: false},
      location: {show: false},
      height: {show: false},
      fromLinkable: {show: false},
      isOne: {show: Inspector.showIfLink, type: "checkbox"},
      isTotal: {show: Inspector.showIfLink, type: "checkbox"}
    },
  });
}
