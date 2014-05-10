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

function SquirrelService(world, container) {

  function Renderable(squirrel) {
    PIXI.DisplayObjectContainer.call(this);
    this.renderable = true;
    this.textures = loadSquirrelTextures();

    var clip = new PIXI.MovieClip(this.textures);
    clip.width = squirrel.w;
    clip.height = squirrel.h;
    clip.animationSpeed = 0.07;
    clip.gotoAndPlay(0);
    clip.play();

    this.addChild(clip);
    this.squirrel = squirrel;
  }
  Renderable.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
  Renderable.prototype.constructor = Renderable;
  Renderable.prototype.updatePosition = function() {
      var state = this.squirrel.getMovementState();
      var percentComplete = state.getPercentComplete();
      var pos = state.getPositionAt(percentComplete);
      this.position.x = pos.x;
      this.position.y = pos.y;
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
      };

      var body = world.add(x, y, w, h);
      body.data = squirrel;

      var movement = MovementHandler(squirrel)
      var walkUp = movement.makeMovement('up', 0, -1);
      var walkDown = movement.makeMovement('down', 0, 1);
      var walkLeft = movement.makeMovement('left', -1, 0);
      var walkRight = movement.makeMovement('right', 1, 0);

      var walkCount = 0;
      function walkTest() {
        movement.start(walkRight);
        walkCount++;

        setTimeout(function() {
          movement.stop(walkRight);
          if (walkCount < 5) {
            setTimeout(walkTest, 700);
          }
        }, 300);
      }
      setTimeout(walkTest, 700);

      var renderable = new Renderable(squirrel);
      container.addChild(renderable);
    },
  };
}
