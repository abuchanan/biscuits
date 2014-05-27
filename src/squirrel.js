'use strict';

define(function(WorldLoader, SquirrelRenderer) {

  // TODO maybe addFactory is better, that would allow the loader
  //      to do some configuration, such as change the "life" value
  WorldLoader.addHandler('squirrel', function(world, obj, container) {
    create(obj.x, obj.y, obj.w, obj.h, world, container);
  });

  // TODO
  var Actions = ActionsService();

  // TODO this is all one big hack!
  function Pathfinder(squirrel) {
      var movement = squirrel.getMovementHandler();
      var checkInterval;
      var maxPath = 10;

      function nextMove() {

        var pos = squirrel.getPosition();

        // TODO query world for nearest player then use that to make the path
        //var playerPos = player.getPosition();
        var path = world.findPath(pos.x, pos.y, playerPos.x, playerPos.y);

        if (path.length > 1 && path.length < maxPath) {
          clearInterval(checkInterval);
          checkInterval = false;

          var dx = path[1][0] - pos.x;
          var dy = path[1][1] - pos.y;

          // TODO need to figure out how to integrate this cleanly with MovementHandler
          if (dy == -1) {
            movement.start(squirrel.moveUp);
          } else if (dy == 1) {
            movement.start(squirrel.moveDown);
          } else if (dx == -1) {
            movement.start(squirrel.moveLeft);
          } else if (dx == 1) {
            movement.start(squirrel.moveRight);
          }

        } else {
            movement.stopAll();

            if (!checkInterval) {
              checkInterval = setInterval(nextMove, 500);
            }
        }
      }

      // TODO
      squirrel.moveUp.endCallback = nextMove;
      squirrel.moveDown.endCallback = nextMove;
      squirrel.moveLeft.endCallback = nextMove;
      squirrel.moveRight.endCallback = nextMove;

      return {
        enable: function() {
          nextMove();
        },
        disable: function() {
          movement.stopAll();
          if (checkInterval) {
            clearInterval(checkInterval);
          }
        },
      };
  }

  var squirrels = [];

  function create(x, y, w, h, world, container) {
    var life = 10;
    var direction = 'down';

    var squirrel = {
      w: w,
      h: h,

      hittable: true,
      hit: function(damage) {
        life -= 1;
        console.log('hit', damage, life, body.getID());

        if (life == 0) {
          console.log('dead');
          this.destroy();
        }
      },
      getDirection: function() {
        return direction;
      },

      setDirection: function(value) {
        direction = value;
      },

      getPosition: function() {
        return body.getPosition();
      },

      setPosition: function(x, y) {
        body.setPosition(x, y);
      },
      getMovementState: function() {
        return movement.getState();
      },
      getMovementHandler: function() {
        return movement;
      },
      start: function() {
        pathfinder.start();
      },
      destroy: function() {
        body.remove();
        destroyRenderer();
        pathfinder.stop();
        var idx = squirrels.indexOf(this);
        squirrels.splice(idx, 1);
      },
    };
    var destroyRenderer = SquirrelRenderer.create(squirrel);

    var body = world.add(x, y, w, h);
    body.data = squirrel;

    // TODO inconsistent naming, activate/deactivate, start/stop, etc
    body.on('activate', function() {
      squirrel.start();
      // TODO renderer, etc
    });

    body.on('deactivate', function() {
      squirrel.stop();
      // TODO renderer, etc
    });

    // TODO these shouldn't be instance specific?
    squirrel.moveUp = Actions.makeMovement(squirrel, 'move', 'up', 0, -1, 250);
    squirrel.moveDown = Actions.makeMovement(squirrel, 'move', 'down', 0, 1, 250);
    squirrel.moveLeft = Actions.makeMovement(squirrel, 'move', 'left', -1, 0, 250);
    squirrel.moveRight = Actions.makeMovement(squirrel, 'move', 'right', 1, 0, 250);

    var movement = Actions.makeStateHandler();

    var pathfinder = Pathfinder(squirrel);

    squirrels.push(squirrel);
  }

  // TODO sporadic animation. a squirrel isn't a fluid animation loop.
  return {

    // TODO needed? create: function(x, y, w, h) {

    // TODO but this needs to be scene/world specific. hmmmm....
    start: function() {
      for (var i = 0; i < squirrels.length; i++) {
        squirrels[i].start();
      }
    },
  };
}
