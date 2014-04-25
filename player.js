// TODO should be a singleton
// TODO this is a mess. position is a hodgepodge between the world and
//      the clip renderable, not to mention PlayerRenderable

function Player(world, container, keybindings, w, h) {

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

    var clip = new PIXI.MovieClip(textures['down']);

    // TODO scale player sprite images in actual image file
    clip.width = w;
    clip.height = h;
    clip.animationSpeed = 0.1;


    var direction = 'down';

    var player = {
      coins: 0,

      getDirection: function() {
        return direction;
      },

      setDirection: function(value) {
        direction = value;
      },

      getPosition: function() {
        return {x: clip.position.x, y: clip.position.y};
      },

      setPosition: function(x, y) {
          clip.position.x = x;
          clip.position.y = y;

          // TODO need a better way to set transform
          var worldX = world.scale(x) + world.scale(w) / 2;
          var worldY = world.scale(y) + world.scale(h) / 2;

          body.SetTransform(new Box2D.b2Vec2(worldX, worldY), body.GetAngle());
      },
    };


    var playerFixture = world.addDynamic(player, 0, 0, w, h);
    var body = playerFixture.GetBody();


    function updateClip() {
        var pos = body.GetPosition();
        // TODO need a cleaner way to get position
        var x = world.unscale(pos.get_x());
        var y = world.unscale(pos.get_y());
        clip.position.x = x - h / 2;
        clip.position.y = y - h / 2;
        clip.textures = textures[direction];
    }

    // http://www.goodboydigital.com/pixijs/docs/files/src_pixi_extras_CustomRenderable.js.html#
    function PlayerRenderable(clip) {
      PIXI.DisplayObjectContainer.call(this);
      this.renderable = true;
      this.addChild(clip);
    }
    PlayerRenderable.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
    PlayerRenderable.prototype.constructor = PlayerRenderable;
    PlayerRenderable.prototype._renderCanvas = function(renderer) {
      updateClip();
      clip._renderCanvas(renderer);
    };
    PlayerRenderable.prototype._initWebGL = function(renderer) {
      updateClip();
      clip._initWebGL(renderer);
    };
    PlayerRenderable.prototype._renderWebGL = function(renderer) {
      updateClip();
      clip._renderWebGL(renderer);
    };


    var renderable = new PlayerRenderable(clip);
    container.addChild(renderable);


    var movement = MovementHandler(body, {
      onStart: function(direction) {
        player.setDirection(direction);
        clip.play();
      },
      onEnd: function() {
        clip.gotoAndStop(0);
      },
    });

    keybindings.listen(movement);

    return player;
}
