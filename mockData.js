
function makeTestWorld() {
  return Q.all([
    loadSpriteSheet('media/playerSprites.png'),
    loadSpriteSheet('media/Monster-squirrel.png'),

  ]).then(function(spritesheets) {

    var playerSpriteSheet = spritesheets[0];

    //var roomGrid = makeRoomTestGrid();

    // TODO a simple list doesn't give fine grained control over each
    //      frame (such as frame duraction). imploy a addFrame method
    /*
    var squirrelSpriteAnim = new SpriteAnimation([
      spritesheets[1].slice(0, 0, 30, 30),
      spritesheets[1].slice(30, 30, 30, 30),
      spritesheets[1].slice(0, 0, 30, 30),
    ]);
    */

    var player = {
      position: new Position(2, 2),
      direction: 'down',

      sprites: {
        'up': playerSpriteSheet.slice(5, 175, 80, 80),
        'down': playerSpriteSheet.slice(5, 275, 80, 80),
        'left': playerSpriteSheet.slice(0, 0, 80, 80),
        'right': playerSpriteSheet.slice(375, 95, 80, 80),
      },

      render: function(ctx, x, y, w, h) {
        var sprite = this.sprites[this.direction]

        if (!sprite) {
          throw 'Error: missing player sprite';
        }

        sprite.render(ctx, x, y, w, h);
      },
    };

    var world = new World(player, 2);

    makeMainTestGrid(world, 50);

    return world;
  });
}

function Area(w, h, color) {
  this.w = w;
  this.h = h;
  this.color = color;
}
Area.prototype = {
  render: function(ctx, x, y, tileWidth, tileHeight) {
    ctx.save();
    ctx.fillStyle = this.color;
    // TODO not a big deal in this simple test case,
    // and unlikely to be a problem in real data, but this is drawing
    // the entire area, even the pixels outside the viewable area,
    // which is inefficient.
    ctx.fillRect(x, y, this.w * tileWidth, this.h * tileHeight);
    ctx.restore();
  }
}

function makeMainTestGrid(world, size) {

  var horizontalEdge = new Area(size, 1, 'black');
  var verticalEdge = new Area(1, size, 'black');

  // TODO in real data, the background should be seperate from blocks
  //      so that movement can query less data (exclude the background tiles)
  horizontalEdge.isBlock = true;
  verticalEdge.isBlock = true;

  // top edge
  world.add(horizontalEdge, 0, new Position(0, 0),
            horizontalEdge.w - 1, 0);

  // bottom edge
  world.add(horizontalEdge, 0, new Position(0, size - 1),
            horizontalEdge.w - 1, size - 1);

  // left edge
  world.add(verticalEdge, 0, new Position(0, 0), 0, verticalEdge.h - 1);

  // right edge
  world.add(verticalEdge, 0, new Position(size - 1, 0), size - 1, verticalEdge.h - 1);

  var walkable = new Area(size - 1, size - 1, 'gray');
  world.add(walkable, 0, new Position(1, 1), walkable.w, walkable.h);

  /*
  var portal = grid.getTile(10, 10);
  portal.portal = 'main';
  portal.layers = [new SolidColor('green')];
  */
}
