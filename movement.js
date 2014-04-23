function MovementHandler(body, options) {

  function noop() {}

  var startCallback = options.onStart || noop;
  var endCallback = options.onEnd || noop;
  var speed = options.speed || 0.5;

  var current = noop;

  function makeHandler(direction, deltaX, deltaY) {
    return function() {
      startCallback(direction);

      // TODO am I losing anything major by setting linear velocity directly?
      //      I thought it'd be interesting to use the physics engine to do
      //      something like put the player on ice and have movement change,
      //      but I'm not sure if I'm losing that ability here. Anyway, maybe
      //      ice movement would be a separate MovementHandler class, e.g.
      //      IceMovementHandler
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
