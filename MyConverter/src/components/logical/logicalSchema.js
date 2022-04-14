function init() {
  myLogicalDiagram = new go.Diagram("myLogicalDiagramDiv",
      {
        // when a drag-drop occurs in the Diagram's background, make it a top-level node
        mouseDrop: e => finishDrop(e, null),
        layout:  // Diagram has simple horizontal layout
          new go.GridLayout(
            { wrappingWidth: Infinity, alignment: go.GridLayout.Position, cellSize: new go.Size(1, 1) }),
        "commandHandler.archetypeGroupData": { isGroup: true, text: "Group", horiz: false },
        "undoManager.isEnabled": true
      });

  // The one template for Groups can be configured to be either layout out its members
  // horizontally or vertically, each with a different default color.

  function makeLayout(horiz) {  // a Binding conversion function
    if (horiz) {
      return new go.GridLayout(
        {
          wrappingWidth: Infinity, alignment: go.GridLayout.Position,
          cellSize: new go.Size(1, 1), spacing: new go.Size(4, 4)
        });
    } else {
      return new go.GridLayout(
        {
          wrappingColumn: 1, alignment: go.GridLayout.Position,
          cellSize: new go.Size(1, 1), spacing: new go.Size(4, 4)
        });
    }
  }

  function defaultColor(horiz) {  // a Binding conversion function
    return horiz ? "rgba(255, 221, 51, 0.55)" : "rgba(51,211,229, 0.5)";
  }

  function defaultFont(horiz) {  // a Binding conversion function
    return horiz ? "bold 20px sans-serif" : "bold 16px sans-serif";
  }

  // this function is used to highlight a Group that the selection may be dropped into
  function highlightGroup(e, grp, show) {
    if (!grp) return;
    e.handled = true;
    if (show) {
      // cannot depend on the grp.diagram.selection in the case of external drag-and-drops;
      // instead depend on the DraggingTool.draggedParts or .copiedParts
      var tool = grp.diagram.toolManager.draggingTool;
      var map = tool.draggedParts || tool.copiedParts;  // this is a Map
      // now we can check to see if the Group will accept membership of the dragged Parts
      if (grp.canAddMembers(map.toKeySet())) {
        grp.isHighlighted = true;
        return;
      }
    }
    grp.isHighlighted = false;
  }

  // Upon a drop onto a Group, we try to add the selection as members of the Group.
  // Upon a drop onto the background, or onto a top-level Node, make selection top-level.
  // If this is OK, we're done; otherwise we cancel the operation to rollback everything.
  function finishDrop(e, grp) {
    var ok = (grp !== null
      ? grp.addMembers(grp.diagram.selection, true)
      : e.diagram.commandHandler.addTopLevelParts(e.diagram.selection, true));
    if (!ok) e.diagram.currentTool.doCancel();
  }

  myLogicalDiagram.groupTemplate =
    new go.Group("Auto",
      {
        background: "blue",
        ungroupable: true,
        // highlight when dragging into the Group
        mouseDragEnter: (e, grp, prev) => highlightGroup(e, grp, true),
        mouseDragLeave: (e, grp, next) => highlightGroup(e, grp, false),
        computesBoundsAfterDrag: true,
        // when the selection is dropped into a Group, add the selected Parts into that Group;
        // if it fails, cancel the tool, rolling back any changes
        mouseDrop: finishDrop,
        handlesDragDropForMembers: true,  // don't need to define handlers on member Nodes and Links
        // Groups containing Groups lay out their members horizontally
        layout: makeLayout(false)
      })
      .bind("layout", "horiz", makeLayout)
      .bind(new go.Binding("background", "isHighlighted", h => h ? "rgba(255,0,0,0.2)" : "transparent").ofObject())
      .add(new go.Shape("Rectangle",
        { fill: null, stroke: defaultColor(false), fill: defaultColor(false), strokeWidth: 2 })
        .bind("stroke", "horiz", defaultColor)
        .bind("fill", "horiz", defaultColor))
      .add(
        new go.Panel("Vertical")  // title above Placeholder
          .add(new go.Panel("Horizontal",  // button next to TextBlock
            { stretch: go.GraphObject.Horizontal, background: defaultColor(false) })
            .bind("background", "horiz", defaultColor)
            .add(go.GraphObject.make("SubGraphExpanderButton", { alignment: go.Spot.Right, margin: 5 }))
            .add(new go.TextBlock(
              {
                alignment: go.Spot.Left,
                editable: true,
                margin: 5,
                font: defaultFont(false),
                opacity: 0.95,  // allow some color to show through
                stroke: "#404040"
              })
              .bind("font", "horiz", defaultFont)
              .bind("text", "text", null, null)) // `null` as the fourth argument makes this a two-way binding
          )  // end Horizontal Panel
          .add(new go.Placeholder({ padding: 5, alignment: go.Spot.TopLeft }))
      )  // end Vertical Panel


  myLogicalDiagram.nodeTemplate =
    new go.Node("Auto",
      { // dropping on a Node is the same as dropping on its containing Group, even if it's top-level
        mouseDrop: (e, node) => finishDrop(e, node.containingGroup)
      })
      .add(new go.Shape("RoundedRectangle", { fill: "rgba(172, 230, 0, 0.9)", stroke: "white", strokeWidth: 0.5 }))
      .add(new go.TextBlock(
        {
          margin: 7,
          editable: true,
          font: "bold 13px sans-serif",
          opacity: 0.90
        })
        .bind("text", "text", null, null));  // `null` as the fourth argument makes this a two-way binding

  // initialize the Palette and its contents
  var slider = document.getElementById("levelSlider");
  slider.addEventListener('change', reexpand);
  slider.addEventListener('input', reexpand);

  loadLogical();
}

function reexpand(e) {
  myLogicalDiagram.commit(diag => {
    var level = parseInt(document.getElementById("levelSlider").value);
    diag.findTopLevelGroups().each(g => expandGroups(g, 0, level))
  } ,"reexpand");
}
function expandGroups(g, i, level) {
  if (!(g instanceof go.Group)) return;
  g.isSubGraphExpanded = i < level;
  g.memberParts.each(m => expandGroups(m, i + 1, level))
}

// save a model to and load a model from JSON text, displayed below the Diagram
function saveLogical() {
  document.getElementById("mySavedModel").value = myLogicalDiagram.model.toJson();
  myLogicalDiagram.isModified = false;
}
function loadLogical() {
  myLogicalDiagram.model = go.Model.fromJson(document.getElementById("myLogicalSavedModel").value);
}
window.addEventListener('DOMContentLoaded', init);