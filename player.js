function Player() {
  return loadSpriteSheet('media/playerSprites.png')
  .then(function(spritesheet) {

    var sprites = {
        'up': spritesheet.slice(5, 175, 80, 80),
        'down': spritesheet.slice(5, 275, 80, 80),
        'left': spritesheet.slice(0, 0, 80, 80),
        'right': spritesheet.slice(375, 95, 80, 80),
    };

    return {
      direction: 'down',
      isBlock: true,

      render: function(ctx, x, y, w, h) {
          var sprite = sprites[this.direction]
          sprite.render(ctx, x, y, w, h);
      },
    };
  });
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
