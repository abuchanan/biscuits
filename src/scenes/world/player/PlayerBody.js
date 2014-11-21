define(['../Body', 'utils'], function(Body, utils) {

  function PlayerBody(s, x, y) {

    s.mixin(Body, x, y, 1, 1, false);
    s.isPlayer = true;
    var originalSetPosition = s.setPosition;

    s.setPosition = function(x, y) {
        var blocks = isBlocked(x, y);

        if (blocks.length == 0) {
          originalSetPosition(x, y);
          triggerCollisions();

        } else {
          for (var i = 0, ii = blocks.length; i < ii; i++) {
            blocks[i].trigger('player collision', [s]);
          }
          throw 'blocked';
        }
    };

    function isBlocked(x, y) {
        // TODO extract to world.containsBlock()?
        var rect = s.getRectangle();
        rect.x = x;
        rect.y = y;
        var bodies = s.world.query(rect);
        var blocks = [];

        // Check if the next tile is blocked.
        for (var i = 0, ii = bodies.length; i < ii; i++) {
          if (bodies[i].getID() !== s.getID() && bodies[i].isBlock()) {
            blocks.push(bodies[i]);
          }
        }

        return blocks;
    }

    function triggerCollisions() {
        var rect = s.getRectangle();
        var bodies = s.world.query(rect);

        for (var i = 0, ii = bodies.length; i < ii; i++) {
          if (bodies[i].getID() !== s.getID()) {
            // TODO trigger events on body or body.obj?
            bodies[i].trigger('player collision', [s]);
          }
        }
    }
  }

  // Module exports
  return PlayerBody;

});
