/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

function renderCustomShapes() {
  go.Shape.defineFigureGenerator("DoubleRectangle", function (shape, w, h) {
    var geo = new go.Geometry();
    var fig = new go.PathFigure();  // clockwise
    geo.add(fig);
    fig.add(new go.PathSegment(go.PathSegment.Line, 90, 0));
    fig.add(new go.PathSegment(go.PathSegment.Line, 90, 50));
    fig.add(new go.PathSegment(go.PathSegment.Line, 0, 50));
    fig.add(new go.PathSegment(go.PathSegment.Line, 0, 0));
    fig.add(new go.PathSegment(go.PathSegment.Move, 4, 4));
    // Inner shape
    fig.add(new go.PathSegment(go.PathSegment.Line, 86, 4));
    fig.add(new go.PathSegment(go.PathSegment.Line, 86, 46));
    fig.add(new go.PathSegment(go.PathSegment.Line, 4, 46));
    fig.add(new go.PathSegment(go.PathSegment.Line, 4, 4));

    geo.spot1 = new go.Spot(0.156, 0.156);
    geo.spot2 = new go.Spot(0.844, 0.844);
    geo.defaultStretch = go.GraphObject.Uniform;
    return geo;
  });

  go.Shape.defineFigureGenerator("DoubleDiamond", function (shape, w, h) {
    var geo = new go.Geometry();
    var fig = new go.PathFigure(0, 25);  // clockwise
    geo.add(fig);
    fig.add(new go.PathSegment(go.PathSegment.Line, 60, 0));
    fig.add(new go.PathSegment(go.PathSegment.Line, 120, 25));
    fig.add(new go.PathSegment(go.PathSegment.Line, 60, 50));
    fig.add(new go.PathSegment(go.PathSegment.Line, 0, 25));
    fig.add(new go.PathSegment(go.PathSegment.Move, 5, 25));
    // Inner shape
    fig.add(new go.PathSegment(go.PathSegment.Line, 60, 3));
    fig.add(new go.PathSegment(go.PathSegment.Line, 115, 25));
    fig.add(new go.PathSegment(go.PathSegment.Line, 60, 47));
    fig.add(new go.PathSegment(go.PathSegment.Line, 5, 25));

    geo.spot1 = new go.Spot(0.156, 0.156);
    geo.spot2 = new go.Spot(0.844, 0.844);
    geo.defaultStretch = go.GraphObject.Uniform;
    return geo;
  });
}