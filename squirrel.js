
function SquirrelService(world, container) {
  var texture = PIXI.Texture.fromImage('media/Monster-squirrel.png');

  var textures = [];

  for (var i = 0; i < 8; i++) {
    var x = i * 32;
    var t = new PIXI.Texture(texture, new PIXI.Rectangle(x, 0, 32, 32));
    textures.push(t);
  }


  // http://www.goodboydigital.com/pixijs/docs/files/src_pixi_extras_CustomRenderable.js.html#
  function Renderable(clip, fixture) {
    PIXI.DisplayObjectContainer.call(this);
    this.renderable = true;
    this.addChild(clip);
    this.fixture = fixture;
    this.clip = clip;
  }
  Renderable.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
  Renderable.prototype.constructor = Renderable;
  Renderable.prototype.updatePosition = function() {
      var pos = this.fixture.GetBody().GetPosition();
      // TODO need a cleaner way to get position
      var x = world.unscale(pos.get_x());
      var y = world.unscale(pos.get_y());
      this.clip.position.x = x;
      this.clip.position.y = y;
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

  // TODO sporadic animation. a squirrel isn't a fluid animation loop.
  return {
    create: function(x, y, w, h) {

      var clip = new PIXI.MovieClip(textures);
      clip.animationSpeed = 0.07;
      clip.play();

      clip.position.x = x;
      clip.position.y = y;
      clip.width = w;
      clip.height = h;
      clip.anchor.x = 0.5;
      clip.anchor.y = 0.5;

      var life = 10;

      var squirrel = {
        hittable: true,
        hit: function(damage) {
          life -= 1;
          console.log('hit', damage, life);

          fixture.GetBody().SetLinearVelocity(new Box2D.b2Vec2(1, 0));

          if (life == 0) {
            world.remove(fixture);
            container.removeChild(renderable);
          }
        },
      };

      var fixture = world.addBox(x, y, w, h, squirrel, {
        collisionCategories: ['NPC'],
      });

      // TODO can an NPC only have one movement going at a time?

      world.onPreStep(function(timestep) {
        if (destination) {
        }
      });

      var g = new PIXI.Graphics();
      g.beginFill(0x00ffaa);
      g.drawRect(0, 0, w, h);
      g.endFill();
      g.position.x = x + 250 - (w / 2);
      g.position.y = y - (h / 2);

      container.addChild(g);

      var renderable = new Renderable(clip, fixture, w, h);
      container.addChild(renderable);

    },
  };
}
