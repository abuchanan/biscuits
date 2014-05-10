// TODO should be a singleton
// TODO this is a mess. position is a hodgepodge between the world and
//      the clip renderable, not to mention PlayerRenderable
function loadPlayerTextures() {
    // create a texture from an image path
    var texture = PIXI.Texture.fromImage("media/playerSprites.png");

    var parts = [];
    var size = 90;

    for (var y = 0; y < 4; y++) {
      for (var x = 0; x < 5; x++) {

        var r = new PIXI.Rectangle(x * size, y * size, size, size);
        var part = new PIXI.Texture(texture, r);
        parts.push(part);
      }
    }

    // TODO a better way to import all this that isn't hard-coded.
    //      some sort of asset packing + json definition
    var textures = {
      'left': parts.slice(0, 5),
      'right': parts.slice(5, 10).reverse(),
      'up': parts.slice(10, 15),
      'down': parts.slice(15, 20),
    };
    
    return textures;
}

function Player(world, keybindings, w, h) {

    var body = world.add(0, 0, w, h);

    var direction = 'down';

    var player = {
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
    };

    var movement = MovementHandler(player);

    keybindings.listen(function(eventname) {
      movement.handleEvent(eventname);
    });

    return player;
}


function PlayerRenderable(player) {
  var textures = this.textures = loadPlayerTextures();

  PIXI.DisplayObjectContainer.call(this);

  // TODO needed?
  this.renderable = true;

  var clip = new PIXI.MovieClip(textures['down']);
  // TODO scale player sprite images in actual image file
  clip.width = player.w;
  clip.height = player.h;
  clip.animationSpeed = 0.1;

  this.addChild(clip);

  this.clip = clip;
  this.player = player;
}
// TODO a downside of subclassing the PIXI code is that it's easy
//      to accidentally clobber one of the PIXI attributes in a subclass,
//      leading to a very mysterious bug. is there a better way?
PlayerRenderable.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
PlayerRenderable.prototype.constructor = PlayerRenderable;
PlayerRenderable.prototype.walk = function() {
  this.clip.play();
};
PlayerRenderable.prototype.stop = function() {
  this.clip.gotoAndStop(0);
};
PlayerRenderable.prototype.updatePosition = function() {
    var state = this.player.getMovementState();
    var percentComplete = state.getPercentComplete();
    var pos = state.getPositionAt(percentComplete);
    this.clip.position.x = pos.x;
    this.clip.position.y = pos.y;

    // TODO s/direction/name/
    var textureName = state.direction || this.player.getDirection();
    this.clip.textures = this.textures[textureName];

    // TODO
    var i = Math.floor(percentComplete * this.clip.textures.length);
    this.clip.gotoAndStop(i);
}
PlayerRenderable.prototype._renderCanvas = function(renderer) {
  this.updatePosition();
  PIXI.DisplayObjectContainer.prototype._renderCanvas.call(this, renderer);
};
PlayerRenderable.prototype._initWebGL = function(renderer) {
  this.updatePosition();
  PIXI.DisplayObjectContainer.prototype._initWebGL.call(this, renderer);
};
PlayerRenderable.prototype._renderWebGL = function(renderer) {
  this.updatePosition();
  PIXI.DisplayObjectContainer.prototype._renderWebGL.call(this, renderer);
};
