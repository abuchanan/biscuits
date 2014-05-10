'use strict';

function loadSquirrelTextures() {
  var texture = PIXI.Texture.fromImage('media/Monster-squirrel.png');
  var textures = [];

  for (var i = 0; i < 8; i++) {
    var x = i * 32;
    var t = new PIXI.Texture(texture, new PIXI.Rectangle(x, 0, 32, 32));
    textures.push(t);
  }
  return textures;
}

function SquirrelService(world, player, container) {

  var textures = loadSquirrelTextures();

  // TODO
  var Actions = ActionsService();


  function Renderer(squirrel) {
    var clip = new PIXI.MovieClip(textures);
    clip.width = squirrel.w;
    clip.height = squirrel.h;
    clip.animationSpeed = 0.07;
    clip.play();
    container.addChild(clip);

    // TODO need deregistration function
    container.addFrameListener(function() {
      var state = squirrel.getMovementState();
      if (state) {
        var percentComplete = state.getPercentComplete();
        var pos = state.moveDef.getPositionAt(percentComplete);
      } else {
        var pos = squirrel.getPosition();
      }

      clip.position.x = pos.x;
      clip.position.y = pos.y;
    });

    return function() {
      container.removeChild(clip);
    };
  }

      // TODO this is all one big hack!
  function Pathfinder(squirrel) {
      var movement = squirrel.getMovementHandler();
      var checkInterval;
      var maxPath = 10;

      function nextMove() {

        var pos = squirrel.getPosition();
        var playerPos = player.getPosition();
        var path = world.findPath(pos.x, pos.y, playerPos.x, playerPos.y);

        if (path.length > 1 && path.length < maxPath) {
          clearInterval(checkInterval);
          checkInterval = false;

          var dx = path[1][0] - pos.x;
          var dy = path[1][1] - pos.y;

          // TODO need to figure out how to integrate this cleanly with MovementHandler
          if (dy == -1) {
            movement.start(squirrel.walkUp);
          } else if (dy == 1) {
            movement.start(squirrel.walkDown);
          } else if (dx == -1) {
            movement.start(squirrel.walkLeft);
          } else if (dx == 1) {
            movement.start(squirrel.walkRight);
          }

        } else {
            movement.stopAll();

            if (!checkInterval) {
              checkInterval = setInterval(nextMove, 500);
            }
        }
      }

      // TODO
      squirrel.walkUp.endCallback = nextMove;
      squirrel.walkDown.endCallback = nextMove;
      squirrel.walkLeft.endCallback = nextMove;
      squirrel.walkRight.endCallback = nextMove;

      return {
        start: function() {
          nextMove();
        },
        stop: function() {
          movement.stopAll();
          if (checkInterval) {
            clearInterval(checkInterval);
          }
        },
      };
  }


  var squirrels = [];

  // TODO sporadic animation. a squirrel isn't a fluid animation loop.
  return {

    create: function(x, y, w, h) {

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
      var destroyRenderer = Renderer(squirrel);

      var body = world.add(x, y, w, h);
      body.data = squirrel;

      // TODO these shouldn't be instance specific?
      squirrel.walkUp = Actions.makeMovement(squirrel, 'up', 0, -1, 250);
      squirrel.walkDown = Actions.makeMovement(squirrel, 'down', 0, 1, 250);
      squirrel.walkLeft = Actions.makeMovement(squirrel, 'left', -1, 0, 250);
      squirrel.walkRight = Actions.makeMovement(squirrel, 'right', 1, 0, 250);

      var movement = Actions.makeStateHandler();

      var pathfinder = Pathfinder(squirrel);

      squirrels.push(squirrel);
    },

    start: function() {
      for (var i = 0; i < squirrels.length; i++) {
        squirrels[i].start();
      }
    },
  };
}
