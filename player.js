function Player() {
    // create a texture from an image path
    var texture = PIXI.Texture.fromImage("media/playerSprites.png");

    // TODO scale player sprite images in actual image file
    var upTexture = new PIXI.Texture(texture, new PIXI.Rectangle(5, 175, 80, 80));
    var downTexture = new PIXI.Texture(texture, new PIXI.Rectangle(5, 275, 80, 80));
    var leftTexture = new PIXI.Texture(texture, new PIXI.Rectangle(0, 0, 80, 80));
    var rightTexture = new PIXI.Texture(texture, new PIXI.Rectangle(370, 95, 80, 80));

    // TODO
    var g = new PIXI.Graphics();
    g.beginFill(0x000000);
    g.drawRect(0, 0, 32, 32);
    g.endFill();

    var sprites = {
        'up': new PIXI.Sprite(upTexture),
        'down': g, //new PIXI.Sprite(downTexture),
        'left': new PIXI.Sprite(leftTexture),
        'right': new PIXI.Sprite(rightTexture),
    };

    return {
      direction: 'down',
      isBlock: true,
      sprites: sprites,

      render: function(ctx, x, y, w, h) {
          var sprite = sprites[this.direction]
          sprite.render(ctx, x, y, w, h);
      },
    };
}
