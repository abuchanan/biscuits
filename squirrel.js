'use strict';

function loadSquirrelTextures() {

    var imgSrc = "media/squirrel-glued/squirrel-pieces.png";
    var jsonSrc = "media/squirrel-glued/squirrel-pieces.json";

    return loadSpriteSheet(imgSrc, jsonSrc).then(function(parts) {

      function getSequence(prefix, length) {
        var seq = [];
        for (var i = 0; i < length; i++) {
          var name = prefix + '-' + i;
          seq.push(parts[name]);
        }
        return seq;
      }

      return {
        'idle-up': getSequence('idle-up', 8),
        'idle-down': getSequence('idle-down', 8),
        'idle-left': getSequence('idle-left', 8),
        'idle-right': getSequence('idle-right', 8),
        'move-up': getSequence('move-up', 3),
        'move-down': getSequence('move-down', 3),
        'move-left': getSequence('move-left', 3),
        'move-right': getSequence('move-right', 3),
      };
    });
}

function SquirrelService(world, player, container) {

  // TODO
  var Actions = ActionsService();

  // TODO need to figure out async loading in services
  var texturesLoader = loadSquirrelTextures();

  function Renderer(squirrel) {
    texturesLoader.then(function(textures) {
        var clip = new PIXI.MovieClip(textures['idle-left']);
        clip.width = squirrel.w;
        clip.height = squirrel.h;
        clip.animationSpeed = 0.07;
        clip.play();
        container.addChild(clip);

        // TODO need deregistration function
        container.addFrameListener(function() {
          var state = squirrel.getMovementState();

          if (state) {
            // TODO s/direction/name/
            var percentComplete = state.getPercentComplete();
            var pos = state.moveDef.getPositionAt(percentComplete);
            clip.position.x = pos.x;
            clip.position.y = pos.y;

            var textureName = 'move-' + state.moveDef.direction;
            clip.textures = textures[textureName];

            var i = Math.floor(percentComplete * clip.textures.length);
            //clip.gotoAndStop(i);

          } else {
            var pos = squirrel.getPosition();
            clip.position.x = pos.x;
            clip.position.y = pos.y;

            var textureName = 'idle-' + squirrel.getDirection();
            clip.textures = textures[textureName];
            clip.play();
          }

        });
    });

    // TODO this doesn't play nice with async
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
