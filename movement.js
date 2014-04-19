function MovementHandler(position, options) {

  function noop() {}

  var startCallback = options.onStart || noop;
  var endCallback = options.onEnd || noop;
  var canMove = options.canMove || function() { return true; };

  var moving = false;
  var movingIdx = 0;
  var duration = options.duration || 10;

  function makeCallback(direction, deltaX, deltaY) {
    return function() {
      if (!moving) {

        var nextX = position.getX() + deltaX
        var nextY = position.getY() + deltaY;

        if (canMove(nextX, nextY)) {
          position.set(nextX, nextY);

          moving = true;
          movingIdx = 0;

          startCallback(direction);
        }
      }
    }
  }

  return {
    up: makeCallback('up', 0, -1),
    down: makeCallback('down', 0, 1),
    left: makeCallback('left', -1, 0),
    right: makeCallback('right', 1, 0),

    tick: function() {
      if (moving) {
        if (movingIdx == duration) {
          moving = false;
          endCallback();
        } else {
          movingIdx += 1;
        }
      }
    }
  };
}
