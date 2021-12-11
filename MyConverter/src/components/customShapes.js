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

  go.Shape.defineFigureGenerator("AssociativeRectangle", function (shape, w, h) {
    var geo = new go.Geometry();
    var fig = new go.PathFigure();  // clockwise
    geo.add(fig);
    fig.add(new go.PathSegment(go.PathSegment.Line, 100, 0));
    fig.add(new go.PathSegment(go.PathSegment.Line, 100, 60));
    fig.add(new go.PathSegment(go.PathSegment.Line, 0, 60));
    fig.add(new go.PathSegment(go.PathSegment.Line, 0, 0));
    fig.add(new go.PathSegment(go.PathSegment.Move, 0, 30));
    // Inner shape
    fig.add(new go.PathSegment(go.PathSegment.Line, 50, 0));
    fig.add(new go.PathSegment(go.PathSegment.Line, 100, 30));
    fig.add(new go.PathSegment(go.PathSegment.Line, 50, 60));
    fig.add(new go.PathSegment(go.PathSegment.Line, 0, 30));

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

  go.Shape.defineFigureGenerator("Ring", function (shape, w, h) {
    var param1 = shape ? shape.parameter1 : NaN;
    if (isNaN(param1) || param1 < 0) param1 = 4;

    w = 90;
    h = 50;

    var rad = w / 2;
    var geo = new go.Geometry();
    var fig = new go.PathFigure(w, h / 2, true);  // clockwise
    geo.add(fig);
    fig.add(new go.PathSegment(go.PathSegment.Arc, 0, 360, w / 2, h / 2, rad, rad / 1.9));


    fig.add(new go.PathSegment(go.PathSegment.Move, w - 4, h / 2));
    fig.add(new go.PathSegment(go.PathSegment.Arc, 0, 360, w / 2, h / 2, rad / 1.1, rad / 2.2));
    geo.spot1 = new go.Spot(0.156, 0.156);
    geo.spot2 = new go.Spot(0.844, 0.844);
    geo.defaultStretch = go.GraphObject.Uniform;
    return geo;
  });
}