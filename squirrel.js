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

  function Renderer(squirrel) {
    var textures = loadSquirrelTextures();
    var layer = container.newLayer();

    var clip = new PIXI.MovieClip(textures);
    clip.width = squirrel.w;
    clip.height = squirrel.h;
    clip.animationSpeed = 0.07;
    clip.gotoAndPlay(0);
    clip.play();
    layer.addChild(clip);

    layer.addFrameListener(function() {
      var state = squirrel.getMovementState();
      var percentComplete = state.getPercentComplete();
      var pos = state.getPositionAt(percentComplete);
      this.position.x = pos.x;
      this.position.y = pos.y;
    });
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
          console.log('hit', damage, life);

          if (life == 0) {
            body.remove();
            container.removeChild(renderable);
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
      };
      Renderer(squirrel);

      var body = world.add(x, y, w, h);
      body.data = squirrel;

      var movement = MovementHandler(squirrel)
      // TODO these shouldn't be instance specific
      squirrel.walkUp = movement.makeMovement('up', 0, -1, 250);
      squirrel.walkDown = movement.makeMovement('down', 0, 1, 250);
      squirrel.walkLeft = movement.makeMovement('left', -1, 0, 250);
      squirrel.walkRight = movement.makeMovement('right', 1, 0, 250);

      squirrels.push(squirrel);
    },

    start: function() {
      // TODO this is all one big hack!
      for (var i = 0; i < squirrels.length; i++) {
        var squirrel = squirrels[i];
        var movement = squirrel.getMovementHandler();
        var checkInterval;

        function nextMove() {

          var pos = squirrel.getPosition();
          var playerPos = player.getPosition();
          var path = world.findPath(pos.x, pos.y, playerPos.x, playerPos.y);

          if (path.length > 1) {
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
        nextMove();

        squirrel.walkUp.onEnd = nextMove;
        squirrel.walkDown.onEnd = nextMove;
        squirrel.walkLeft.onEnd = nextMove;
        squirrel.walkRight.onEnd = nextMove;
      }
    },
  };
}
