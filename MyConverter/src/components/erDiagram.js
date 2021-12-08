/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

function initERDiagram () {
  // Diagram
  myDiagram = $(go.Diagram, 'myDiagramDiv', {
    'undoManager.isEnabled': true,
  });

  myDiagram.nodeTemplate = $(
    go.Node,
    'Auto',
    {locationSpot: go.Spot.Center},
    new go.Binding('location', 'location', go.Point.parse).makeTwoWay(go.Point.stringify),
    $(go.Shape, 'Circle',
      {
        fill: 'white',
        stroke: 'gray',
        strokeWidth: 1,
        portId: '',
        fromLinkable: true,
        toLinkable: true,
      },
      new go.Binding('stroke', 'color'),
      new go.Binding('strokeDashArray'),
      new go.Binding('figure'),
      new go.Binding('width'),
      new go.Binding('height'),
    ),
    $(
      go.TextBlock,
      {
        margin: new go.Margin(5, 5, 5, 5),
        font: '9pt sans-serif',
        minSize: new go.Size(16, 16),
        maxSize: new go.Size(120, NaN),
        textAlign: 'center',
        editable: true,
        overflow: go.TextBlock.OverflowEllipsis
      },
      new go.Binding('text').makeTwoWay(),
      new go.Binding("isUnderline", "underline"),
    )
  );

  myDiagram.linkTemplate =
  $(go.Link,
    $(go.Shape),
    $(go.Shape, {toArrow: ""},  
      new go.Binding("toArrow", "toArrow"),
    ),
  );
}