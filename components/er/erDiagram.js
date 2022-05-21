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
        fromLinkableDuplicates: false, 
        toLinkableDuplicates: false,
      },
      new go.Binding('stroke', 'color'),
      new go.Binding('strokeDashArray'),
      new go.Binding('figure'),
      new go.Binding('width'),
      new go.Binding('height'),
      new go.Binding('fromLinkable'),
      new go.Binding('toLinkable'),
      new go.Binding('fromLinkableDuplicates'),
      new go.Binding('toLinkableDuplicates'),
      new go.Binding('fromMaxLinks'),
      new go.Binding('max'),
      new go.Binding('min'),
    ),
    $(
      go.TextBlock,
      {
        font: '9pt sans-serif',
        textAlign: 'left',
        alignment: go.Spot.TopLeft, 
      },
      new go.Binding('text', 'min').makeTwoWay(),
    ),
    $(
      go.TextBlock,
      {
        font: '9pt sans-serif',
        textAlign: 'left',
        alignment: go.Spot.TopRight, 
      },
      new go.Binding('text', 'max').makeTwoWay(),
    ),
    $(
      go.TextBlock,
      {
        margin: new go.Margin(5, 3, 5, 3),
        font: '9pt sans-serif',
        overflow: go.TextBlock.OverflowEllipsis,
        width: 65,
        textAlign: 'center',
        editable: true,
        verticalAlignment: go.Spot.Bottom,
      },
      new go.Binding('text').makeTwoWay(),
      new go.Binding("isUnderline", "underline"),
    ),
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
      ),
      $(go.TextBlock,
        {
          font: "regular 10pt sans-serif",
          width: 120,
          stroke: "red",
          textAlign: "center"
        },                      // this is a Link label
        new go.Binding("text", "text")
      )
    );
}