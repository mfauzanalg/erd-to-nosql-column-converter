/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

function initERDiagram() {
  // Diagram
  myDiagram = $(go.Diagram, 'myDiagramDiv', {
    'undoManager.isEnabled': true,
  });

  myDiagram.scrollMode = go.Diagram.InfiniteScroll;
  myDiagram.nodeTemplate = $(
    go.Node,
    'Auto',
    {locationSpot: go.Spot.Center, fromSpot: go.Spot.AllSides, toSpot: go.Spot.AllSides},
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
      new go.Binding('fromLinkable'),
      new go.Binding('toLinkable'),
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
      },
      new go.Binding('text').makeTwoWay(),
      new go.Binding("isUnderline", "underline"),
    )
  );

  myDiagram.linkTemplate =
    $(go.Link,
      {reshapable: true, toShortLength: 0, adjusting: go.Link.Stretch},
      new go.Binding("toShortLength", "isOne", function(isOne) { return isOne ? 5 : 0 }),
      $(go.Shape, 
        {
          isPanelMain: true, 
          stroke: "black", 
          strokeWidth: 1.5
        },
        new go.Binding("strokeWidth", "isTotal", function(isTotal) { return isTotal ? 4 : 1.5 }),
      ),
      $(go.Shape, 
        {
          isPanelMain: true, 
          stroke: "white", 
          strokeWidth: 0
        },
        new go.Binding("strokeWidth", "isTotal", function(isTotal) { return isTotal ? 2 : 0 }),
      ),
      $(go.Shape,
        {
          toArrow: "", scale: 1
        },
        new go.Binding("toArrow", "isOne", function(isOne) { return isOne ? "triangle" : "" }),
      ),
      $(go.TextBlock,
        {
          font: "bold 10pt sans-serif",
          width: 100,
          textAlign: "right"
        },                      // this is a Link label
        new go.Binding("text", "isParent", function(isParent) { return isParent ? "Parent" : "" })
      ),
      $(go.TextBlock,
        {
          font: "bold 10pt sans-serif",
          width: 120,
          textAlign: "left"
        },                      // this is a Link label
        new go.Binding("text", "isDisjoint", function(isDisjoint) { return isDisjoint ? "Disjoint" : "" })
      )
    );
}