'use strict';

define(function(Keybindings) {
});

function loadPlayerTextures() {
    var imgSrc = "media/player-glued/player-pieces.png";
    var jsonSrc = "media/player-glued/player-pieces.json";

    return loadSpriteSheet(imgSrc, jsonSrc).then(function(parts) {

      return {
        'up': [
          parts['up-0'],
          parts['up-1'],
          parts['up-2'],
          parts['up-3'],
          parts['up-4'],
        ],
        'down': [
          parts['down-0'],
          parts['down-1'],
          parts['down-2'],
          parts['down-3'],
          parts['down-4'],
        ],
        'right': [
          parts['right-0'],
          parts['right-1'],
          parts['right-2'],
          parts['right-1'],
          parts['right-3'],
        ],
        'left': [
          parts['left-0'],
          parts['left-1'],
          parts['left-2'],
          parts['left-1'],
          parts['left-3'],
        ],
        'sword-up': [
          parts['sword-up-0'],
        ],
        'sword-down': [
          parts['sword-down-0'],
        ],
        'sword-left': [
          parts['sword-left-0'],
        ],
        'sword-right': [
          parts['sword-right-0'],
        ],
      };
    });
}

// TODO should be a singleton?
function Player(world, w, h, container) {

    // TODO 
    PlayerRenderer(player, playerLayer);

    var body = world.add(0, 0, w, h);

    // TODO
    var Actions = ActionsService();
    var events = EventManager();

    var direction = 'down';

    var player = {
      // TODO getters
      w: w,
      h: h,

      coins: 0,

      addListener: events.addListener,

      getDirection: function() {
        return direction;
      },

      setDirection: function(value) {
        direction = value;
      },

      getContinuousPosition: function() {
        var state = movement.getState();
        if (state && state.moveDef.isMoving) {
          var percentComplete = state.getPercentComplete();
          return state.moveDef.getPositionAt(percentComplete);
        } else {
          return this.getDiscretePosition();
        }
      },

      getDiscretePosition: function() {
        return body.getPosition();
      },

      setPosition: function(x, y) {
        var objs = world.query(x, y, w, h);

        // Check if the next tile is blocked.
        var blocked = false;
        for (var i = 0; i < objs.length; i++) {
          if (objs[i] !== body && objs[i].isBlock) {
            blocked = true;
            break;
          }
        }

        if (!blocked) {
          body.setPosition(x, y);
          // TODO include position in event data
          events.fire('position changed');
        }

        // TODO implement player collision event
      },

      getMovementState: function() {
        return movement.getState();
      },

      getRect: function() {
        var pos = body.getPosition();
        return [pos.x, pos.y, w, h];
      },

      // TODO extract from player. this is useful for anything
      immediateFrontRect: function(distance) {
        distance = distance || 1;
        var pos = body.getPosition();

        switch (direction) {
          case 'up':
            var x1 = pos.x;
            var y1 = pos.y - distance;
            var w1 = w;
            var h1 = distance;
            break;

          case 'down':
            var x1 = pos.x;
            var y1 = pos.y + h;
            var w1 = w;
            var h1 = distance;
            break;

          case 'left':
            var x1 = pos.x - distance;
            var y1 = pos.y;
            var w1 = distance;
            var h1 = h;
            break;

          case 'right':
            var x1 = pos.x + w;
            var y1 = pos.y;
            var w1 = distance;
            var h1 = h;
            break;
        }
        return [x1, y1, w1, h1];
      },
    };
    body.data = player;


    // TODO for firing "position change" event
    /*
    */

    var walkUp = Actions.makeMovement(player, 'walk', 'up', 0, -1);
    var walkDown = Actions.makeMovement(player, 'walk', 'down', 0, 1);
    var walkLeft = Actions.makeMovement(player, 'walk', 'left', -1, 0);
    var walkRight = Actions.makeMovement(player, 'walk', 'right', 1, 0);

    // TODO holding down button should swing sword repeatedly?
    var swordCombat = SwordCombat(player, world);
    var swingSword = Actions.makeAction('sword', 350, swordCombat);

    var movement = Actions.makeStateHandler();

    var keymap = {};

    function bindMove(keyName, move) {
      keymap[keyName + ' keydown'] = movement.start.bind(movement, move);
      keymap[keyName + ' keyup'] = movement.stop.bind(movement, move);
    }

    // TODO when keyup event happens during a different window
    //      e.g. keydown, cmd+tab away, let go of key, then cmd+tab back
    //      window focus/blur events?

    bindMove('Up', walkUp);
    bindMove('Down', walkDown);
    bindMove('Left', walkLeft);
    bindMove('Right', walkRight);
    bindMove('Sword', swingSword);

    keybindings.listen(function(eventname) {
      var handler = keymap[eventname];
      if (handler) {
        handler();
      }
    });

    return player;
}


function PlayerRenderer(player, container) {
  // TODO really need to figure out async usage convention
  loadPlayerTextures().then(function(textures) {

    var clip = new PIXI.MovieClip(textures['down']);
    // TODO scale player sprite images in actual image file
    clip.width = player.w;
    clip.height = player.h;
    clip.animationSpeed = 0.1;
    container.addChild(clip);

    container.addFrameListener(function() {
      var state = player.getMovementState();

      if (state) {
        // TODO s/direction/name/
        var percentComplete = state.getPercentComplete();

        if (state.moveDef.isMoving) {
          var pos = state.moveDef.getPositionAt(percentComplete);
          clip.position.x = pos.x;
          clip.position.y = pos.y;

          var textureName = state.moveDef.direction;
          clip.textures = textures[textureName];
          clip.play();

        } else {
          var textureName = state.moveDef.name + '-' + player.getDirection();
          clip.textures = textures[textureName];
          clip.play();
        }

      } else {
        var pos = player.getPosition();
        clip.position.x = pos.x;
        clip.position.y = pos.y;

        var textureName = player.getDirection();
        clip.textures = textures[textureName];
        clip.gotoAndStop(0);
      }
    });
  });
}
