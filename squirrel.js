
function SquirrelService(world, container) {
  var texture = PIXI.Texture.fromImage('media/Monster-squirrel.png');

  var textures = [];

  for (var i = 0; i < 8; i++) {
    var x = i * 32;
    var t = new PIXI.Texture(texture, new PIXI.Rectangle(x, 0, 32, 32));
    textures.push(t);
  }

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

      var life = 10;

      var squirrel = {
        hittable: true,
        hit: function(damage) {
          life -= 1;
          console.log('hit', damage, life);
          if (life == 0) {
            world.remove(fixture);
            container.removeChild(clip);
          }
        },
      };

      var fixture = world.addStatic(squirrel, x, y, w, h);

      container.addChild(clip);

    },
  };
}
