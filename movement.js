function MovementHandler(body, options) {

  body.SetLinearDamping(2);

  function noop() {}

  // TODO
  var startCallback = options.onStart || noop;
  var endCallback = options.onEnd || noop;

  function makeCallback(direction, deltaX, deltaY) {
    return function() {

      var vel = body.GetLinearVelocity();
      var speed = vel.Length();

      if (speed < 0.5) {
        var x = body.GetMass();
        var impulse = new Box2D.b2Vec2(x * deltaX, x * deltaY)
        body.ApplyLinearImpulse(impulse, body.GetWorldCenter());
        startCallback(direction);
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
