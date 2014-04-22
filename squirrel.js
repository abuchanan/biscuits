
function SquirrelService() {
  var texture = PIXI.Texture.fromImage('media/Monster-squirrel.png');

  var textures = [];

  for (var i = 0; i < 8; i++) {
    var x = i * 32;
    var t = new PIXI.Texture(texture, new PIXI.Rectangle(x, 0, 32, 32));
    textures.push(t);
  }

  // TODO sporadic animation. a squirrel isn't a fluid animation loop.
  return {
    create: function() {

      var clip = new PIXI.MovieClip(textures);
      clip.animationSpeed = 0.07;
      clip.play();

      return {
        clip: clip,
      }
    },
  };
}
