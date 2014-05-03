function MovementHandler(body, options) {

  function noop() {}

  var startCallback = options.onStart || noop;
  var endCallback = options.onEnd || noop;
  var speed = options.speed || 0.5;

  var current = noop;

  function makeHandler(direction, deltaX, deltaY) {
    return function() {
      startCallback(direction);
      body.SetLinearVelocity(new Box2D.b2Vec2(deltaX * speed, deltaY * speed));
    }
  }

  function stop() {
    body.SetLinearVelocity(new Box2D.b2Vec2(0, 0));
  }

  var up = makeHandler('up', 0, -1);
  var down = makeHandler('down', 0, 1);
  var left = makeHandler('left', -1, 0);
  var right = makeHandler('right', 1, 0);

  function keyup(d) {
    if (current === d) {
      current = stop;
      endCallback();
    }
  }

  return function(eventname) {
    switch (eventname) {
      case 'Up keydown':
        current = up;
        break;

      // TODO ugh....another bug here when keyup event happens during a different window
      //      e.g. keydown, cmd+tab away, let go of key, then cmd+tab back
      case 'Up keyup':
        keyup(up);
        break;

      case 'Down keydown':
        current = down;
        break;

      case 'Down keyup':
        keyup(down)
        break;

      case 'Left keydown':
        current = left;
        break;

      case 'Left keyup':
        keyup(left);
        break;

      case 'Right keydown':
        current = right;
        break;

      case 'Right keyup':
        keyup(right);
        break;
    }

    current();
  }
}
