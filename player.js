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




    function Renderable(clip, fixture, w, h) {
      PIXI.DisplayObjectContainer.call(this);
      this.renderable = true;
      this.addChild(clip);
      this.fixture = fixture;
      this.clip = clip;
      this.w = w;
      this.h = h;
    }
    Renderable.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
    Renderable.prototype.constructor = Renderable;
    Renderable.prototype.updatePosition = function() {
        var pos = this.fixture.GetBody().GetPosition();
        // TODO need a cleaner way to get position
        var x = world.unscale(pos.get_x());
        var y = world.unscale(pos.get_y());
        this.clip.position.x = x - this.w / 2;
        this.clip.position.y = y - this.h / 2;

        this.clip.textures = textures[direction];
    }
    Renderable.prototype._renderCanvas = function(renderer) {
      this.updatePosition();
      PIXI.DisplayObjectContainer.prototype._renderCanvas.call(this, renderer);
    };
    Renderable.prototype._initWebGL = function(renderer) {
      this.updatePosition();
      PIXI.DisplayObjectContainer.prototype._initWebGL.call(this, renderer);
    };
    Renderable.prototype._renderWebGL = function(renderer) {
      this.updatePosition();
      PIXI.DisplayObjectContainer.prototype._renderWebGL.call(this, renderer);
    };


    var playerFixture = world.addBox(0, 0, w, h, player, {
      collisionCategories: ['player'],
    });
    var body = playerFixture.GetBody();

    var renderable = new Renderable(clip, playerFixture, w, h);
    container.addChild(renderable);


    var movement = MovementHandler(body, {
      onStart: function(direction) {
        player.setDirection(direction);
        clip.play();
      },
      onEnd: function() {
        clip.gotoAndStop(0);
      },
      speed: 3,
    });

    keybindings.listen(movement);

    return player;
}
