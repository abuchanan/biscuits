function Player() {
	// create a texture from an image path
	var texture = PIXI.Texture.fromImage("media/playerSprites.png");

  var upTexture = new PIXI.Texture(texture, new PIXI.Rectangle(5, 175, 80, 80));
  var downTexture = new PIXI.Texture(texture, new PIXI.Rectangle(5, 275, 80, 80));
  var leftTexture = new PIXI.Texture(texture, new PIXI.Rectangle(0, 0, 80, 80));
  var rightTexture = new PIXI.Texture(texture, new PIXI.Rectangle(370, 95, 80, 80));
  //return loadSpriteSheet('media/playerSprites.png')
  //.then(function(spritesheet) {

    var sprites = {
        'up': new PIXI.Sprite(upTexture),
        'down': new PIXI.Sprite(downTexture),
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

function PlayerCollider(world, player) {

  return function(position) {
    var x = position.getX();
    var y = position.getY();
    var items = world.query(x, y);

    for (var i = 0, ii = items.length; i < ii; i++) {
      
      var obj = items[i][4];
      if (obj.handlePlayerCollision) {
        obj.handlePlayerCollision(player);
      }
    }
  }
}
