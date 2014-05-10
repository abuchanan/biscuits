function loadSpriteSheet(imageSrc, jsonSrc) {
  var deferred = Q.defer();

  // create a texture from an image path
  var texture = PIXI.Texture.fromImage(imageSrc);

  var req = new XMLHttpRequest();
  req.onload = function() {
    var d = JSON.parse(this.responseText);
    var data = {};

    for (var i = 0; i < d.frames.length; i++) {
      var frame = d.frames[i];
      var x = frame.frame.x * -1;
      var y = frame.frame.y * -1;
      var w = frame.frame.w;
      var h = frame.frame.h;

      var r = new PIXI.Rectangle(x, y, w, h);
      var part = new PIXI.Texture(texture, r);
      var name = frame.filename.replace('.png', '');
      data[name] = part;
    }

    deferred.resolve(data);
  };
  // TODO if this request fails, the whole app will hang
  req.responseType = 'application/json';
  req.overrideMimeType('application/json');
  req.open('get', jsonSrc, true);
  req.send();

  return deferred.promise;
}


function loadPlayerTextures() {
    var imgSrc = "media/player-sprite-glued/player-sprite-pieces.png";
    var jsonSrc = "media/player-sprite-glued/player-sprite-pieces.json";

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
      };
    });
}

// TODO should be a singleton?
function Player(world, keybindings, w, h) {

    var body = world.add(0, 0, w, h);

    // TODO
    var Actions = ActionsService();

    var direction = 'down';

    var player = {
      // TODO getters
      w: w,
      h: h,

      coins: 0,

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
        var objs = world.query(x, y, w, h);
        var blocked = false;
        for (var i = 0; i < objs.length; i++) {
          if (objs[i] !== body && objs[i].isBlock) {
            blocked = true;
            break;
          }
        }

        if (!blocked) {
          body.setPosition(x, y);
        }
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

    var walkUp = Actions.makeMovement(player, 'up', 0, -1);
    var walkDown = Actions.makeMovement(player, 'down', 0, 1);
    var walkLeft = Actions.makeMovement(player, 'left', -1, 0);
    var walkRight = Actions.makeMovement(player, 'right', 1, 0);

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
        var pos = state.moveDef.getPositionAt(percentComplete);
        clip.position.x = pos.x;
        clip.position.y = pos.y;

        var textureName = state.moveDef.direction;
        clip.textures = textures[textureName];

        var i = Math.floor(percentComplete * clip.textures.length);
        clip.play();

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
