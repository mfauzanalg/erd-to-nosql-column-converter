/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

function initERInspector() {
  var inspector = new Inspector('myInspectorDiv', myDiagram, {
    includesOwnProperties: true,
    properties: {
      text: {show: Inspector.showIfPresent},
      key: {readOnly: true, show: Inspector.showIfPresent},
      color: {type: 'color', show: Inspector.showIfPresent},
      figure: {show: Inspector.showIfPresent},
      toArrow: {show: Inspector.showIfLink}
    },
  });
}
