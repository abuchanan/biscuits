function WorldView(world, container, player, viewW, viewH, scale) {

  // TODO do I really need world (Box2d physics) collisions for this?
  //      could just check the player position.

  // TODO still not sure if I want the player to stay centered in the view or not
  //      Zelda used a combination of both. 

  // TODO use chain? that way I can move the whole chain
  var edges = [];

  // Top
  var o = {dx: 0, dy: -1 * (viewH - 33)};
  var e = world.addEdge(0, 0, viewW, 0, o, {sensor: true});
  edges.push(e);

  // Bottom
  var o = {dx: 0, dy: viewH - 33}
  var e = world.addEdge(0, viewH, viewW, viewH, o, {sensor: true});
  edges.push(e);

  // Left
  var o = {dx: -1 * (viewW - 33), dy: 0};
  var e = world.addEdge(0, 0, 0, viewH, o, {sensor: true});
  edges.push(e);

  // Right
  var o = {dx: viewW - 33, dy: 0};
  var e = world.addEdge(viewW, 0, viewW, viewH, o, {sensor: true});
  edges.push(e);


  world.contactListener(player, function(fixture) {

    var dx, dy;

    for (var i = 0; i < edges.length; i++) {
      var edge = edges[i];

      if (fixture === edge) {
        dx = edge.objectData.dx;
        dy = edge.objectData.dy;

        container.x += dx * -1;
        container.y += dy * -1;

        break;
      }
    }

    if (dx || dy) {
      world.scheduleUpdate(function() {
        for (var i = 0; i < edges.length; i++) {
            var body = edges[i].GetBody();
            var pos = body.GetTransform().get_p();
            var x = pos.get_x() + (dx / scale);
            var y = pos.get_y() + (dy / scale);
            body.SetTransform(new Box2D.b2Vec2(x, y), body.GetAngle());
        }
      });
    }
  });
}
