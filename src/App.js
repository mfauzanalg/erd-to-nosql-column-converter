import * as go from 'gojs';
import {ReactDiagram} from 'gojs-react';
import React, {useEffect, useState} from 'react';

import './App.css';  // contains .diagram-component CSS

const initDiagram = () => {
  const $ = go.GraphObject.make;
  // set your license key here before creating the diagram: go.Diagram.licenseKey = "...";
  const diagram =
    $(go.Diagram,
      {
        'undoManager.isEnabled': true,  // must be set to allow for model change listening
        // 'undoManager.maxHistoryLength': 0,  // uncomment disable undo/redo functionality
        'clickCreatingTool.archetypeNodeData': {text: 'new node', color: 'lightblue'},
        model: $(go.GraphLinksModel,
          {
            linkKeyProperty: 'key'  // IMPORTANT! must be defined for merges and data sync when using GraphLinksModel
          })
      });

  // define a simple Node template
  diagram.nodeTemplate =
    $(go.Node, 'Auto',  // the Shape will go around the TextBlock
      new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
      $(go.Shape, 'RoundedRectangle',
        {name: 'SHAPE', fill: 'white', strokeWidth: 0},
        // Shape.fill is bound to Node.data.color
        new go.Binding('fill', 'color')),
      $(go.TextBlock,
        {margin: 8, editable: true},  // some room around the text
        new go.Binding('text').makeTwoWay()
      )
    );

  return diagram;
};

const initPalette = () => {
  const $ = go.GraphObject.make;
  const palette = $(go.Palette, {
    contentAlignment: go.Spot.Center,
    layout: $(go.GridLayout, {wrappingColumn: 1, cellSize: new go.Size(2, 2)}),
  });

  palette.nodeTemplate =
    $(go.Node, 'Auto',  // the Shape will go around the TextBlock
      new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
      $(go.Shape, 'RoundedRectangle',
        {name: 'SHAPE', fill: 'white', strokeWidth: 0},
        // Shape.fill is bound to Node.data.color
        new go.Binding('fill', 'color')),
      $(go.TextBlock,
        {margin: 8, editable: true},  // some room around the text
        new go.Binding('text').makeTwoWay()
      )
    );
  return palette;
};

const App = () => {
  return (
    <div style={{display: 'flex'}}>
      <ReactDiagram
        initDiagram={initPalette}
        divClassName='diagram-component'
        nodeDataArray={[
          {key: 0, text: 'Alpha', color: 'lightblue'},
          {key: 1, text: 'Beta', color: 'orange'},
          {key: 2, text: 'Gamma', color: 'lightgreen'},
          {key: 3, text: 'Delta', color: 'pink'}
        ]}
      />
      <ReactDiagram
        initDiagram={initDiagram}
        divClassName='diagram-component'
        nodeDataArray={[
          {key: 0, text: 'Alpha', color: 'lightblue', loc: '0 0'},
          {key: 1, text: 'Beta', color: 'orange', loc: '150 0'},
          {key: 2, text: 'Gamma', color: 'lightgreen', loc: '0 150'},
          {key: 3, text: 'Delta', color: 'pink', loc: '150 150'}
        ]}
        linkDataArray={[
          {key: -1, from: 0, to: 1},
          {key: -2, from: 0, to: 2},
          {key: -3, from: 1, to: 1},
          {key: -4, from: 2, to: 3},
          {key: -5, from: 3, to: 0}
        ]}
      />
    </div>
  );
};

export default App;
