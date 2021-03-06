/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

function initERPalette() {
  // Palette
  myPalette = $(go.Palette, 'myPaletteDiv', {
    nodeTemplate: myDiagram.nodeTemplate,
    contentAlignment: go.Spot.Center,
    layout: $(go.GridLayout, {wrappingColumn: 4, cellSize: new go.Size(4, 4)}),
  });

  myPalette.model.nodeDataArray = [
    {text: '', figure: 'Ellipse', color: 'white', height: 70},
    {text: 'Entity', color: 'black', figure: 'Rectangle', width: 90, height: 50, fromLinkable: false, toLinkableDuplicates: true},
    {text: 'Weak\nEntity', color: 'black', figure: 'DoubleRectangle', width: 90, height: 50, fromLinkable: false},
    {text: 'Associative\nEntity', color: 'black', figure: 'AssociativeRectangle', width: 100, height: 60},
    {text: 'Relation', color: 'black', figure: 'Diamond', width: 110, height: 50, fromLinkableDuplicates: true, fromMaxLinks:2},
    {text: 'Weak\nRelation', color: 'black', figure: 'DoubleDiamond', width: 120, height: 50},
    {text: 'Speciali\nzation', color: 'black', figure: 'TriangleDown', toLinkable: false, width: 120},
    {text: 'Multivalued\nAttribute', color: 'black', figure: 'Ring', width: 100, height: 60, fromMaxLinks:1},
    {text: 'Derived\nAttribute', color: 'black', figure: 'Ellipse', strokeDashArray: [2, 2], fromMaxLinks:1},
    {text: 'Identifier\nAttribute', color: 'black', figure: 'Ellipse', underline: true, fromMaxLinks:1},
    {text: 'Regular\nAttribute', color: 'black', figure: 'Ellipse', fromMaxLinks:1},
  ];
}