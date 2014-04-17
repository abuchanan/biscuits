function MovementHandler(keybindings, world, player) {

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

  function makeCallback(deltaX, deltaY) {
    return function(direction) {

      var nextX = player.position.getX() + deltaX
      var nextY = player.position.getY() + deltaY;

      player.direction = direction;

      if (canMoveTo(nextX, nextY)) {
        player.position.set(nextX, nextY);
      }
    }
  }

  keybindings.on('up', makeCallback(0, -1));
  keybindings.on('down', makeCallback(0, 1));
  keybindings.on('left', makeCallback(-1, 0));
  keybindings.on('right', makeCallback(1, 0));
}
