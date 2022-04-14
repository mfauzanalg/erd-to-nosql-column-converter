/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
var $ = go.GraphObject.make;


function init() { 
  renderCustomShapes(); 
  initERDiagram();
  initERPalette();
  initERInspector();
  loadDefault();
}

window.addEventListener('DOMContentLoaded', init);