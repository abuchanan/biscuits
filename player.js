function Player() {
    // create a texture from an image path
    var texture = PIXI.Texture.fromImage("media/playerSprites.png");

    var upTextures = [
      new PIXI.Texture(texture, new PIXI.Rectangle(5, 175, 80, 80)),
    ];

    var downTextures = [
      new PIXI.Texture(texture, new PIXI.Rectangle(5, 275, 80, 80)),
    ];

    var leftTextures = [
      new PIXI.Texture(texture, new PIXI.Rectangle(0, 0, 80, 80)),
    ];

    var rightTextures = [
      new PIXI.Texture(texture, new PIXI.Rectangle(370, 95, 80, 80)),
    ];

    var clip = new PIXI.MovieClip(downTextures);

    // TODO scale player sprite images in actual image file
    clip.scale.x = 32 / 80;
    clip.scale.y = 32 / 80;

    var direction = 'down';

    return {
      clip: clip,

      setDirection: function(value) {
        direction = value;

        if (direction == 'up') {
          clip.textures = upTextures;
        } else if (direction == 'down') {
          clip.textures = downTextures;
        } else if (direction == 'left') {
          clip.textures = leftTextures;
        } else if (direction == 'right') {
          clip.textures = rightTextures;
        }

        clip.gotoAndStop(0);
      },
    };
}
