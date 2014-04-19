function MovementHandler(position, options) {

  function noop() {}

  var startCallback = options.onStart || noop;
  var endCallback = options.onEnd || noop;
  var canMove = options.canMove || function() { return true; };

  var currentMovement = false;
  var currentMovementIdx = 0;
  var movementDuration = options.duration || 10;

  function makeCallback(direction, deltaX, deltaY) {
    return function() {
      if (!currentMovement) {

        var nextX = position.getX() + deltaX
        var nextY = position.getY() + deltaY;

        if (canMove(nextX, nextY)) {
          position.set(nextX, nextY);

          currentMovement = true;
          currentMovementIdx = 0;

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
      if (currentMovement) {
        if (currentMovementIdx == movementDuration) {
          currentMovement = false;
          endCallback();
        } else {
          currentMovementIdx += 1;
        }
      }
    }
  };
}
