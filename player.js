// TODO should be a singleton
function Player() {
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
    clip.width = 32;
    clip.height = 32;
    clip.animationSpeed = 0.1;

    var direction = 'down';

    return {
      clip: clip,

      getDirection: function() {
        return direction;
      },

      setDirection: function(value) {
        direction = value;
        clip.textures = textures[direction];
      },
    };
}
