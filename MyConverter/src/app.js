/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
var $ = go.GraphObject.make;


function init() { 
  renderCustomShapes(); 
  initERDiagram();
  initERPalette();
  initERInspector();
  load();
}

window.addEventListener('DOMContentLoaded', init);