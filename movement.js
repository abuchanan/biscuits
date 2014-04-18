function MovementHandler(world, player, position) {

  function canMoveTo(x, y) {
    var items = world.query(x, y);

    for (var i = 0, ii = items.length; i < ii; i++) {
      // TODO handling query results is a little clunky
      var obj = items[i][4];

      if (obj.isBlock) {
        return false;
      }
    }
    return true;
  }

  function makeCallback(direction, deltaX, deltaY) {
    return function() {

      var nextX = position.getX() + deltaX
      var nextY = position.getY() + deltaY;

      player.direction = direction;

      if (canMoveTo(nextX, nextY)) {
        position.set(nextX, nextY);
      }
    }
  }

  return {
    up: makeCallback('up', 0, -1),
    down: makeCallback('down', 0, 1),
    left: makeCallback('left', -1, 0),
    right: makeCallback('right', 1, 0),
  };
}
