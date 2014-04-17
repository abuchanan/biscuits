
function Squirrel() {
  return loadSpriteSheet('media/Monster-squirrel.png')
  .then(function(spritesheet) {

    // TODO a simple list doesn't give fine grained control over each
    //      frame (such as frame duraction). imploy a addFrame method
    var squirrelSpriteAnim = new SpriteAnimation([
      spritesheet.slice(0, 0, 30, 30),
      spritesheet.slice(30, 30, 30, 30),
      spritesheet.slice(0, 0, 30, 30),
    ]);
    squirrelSpriteAnim.isBlock = true;

    return squirrelSpriteAnim;
  });
}

function Portal(name, load) {
  return {
    handlePlayerCollision: function(player) {
      console.log('portal', name);
      load();
    },
  }
}

function collide(world, player) {

  function handlePlayerPositionChange(position) {
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

  player.position.onChange(handlePlayerPositionChange);
}


function makeTestWorld(sceneManager) {

  var reqs = [Player(), Squirrel()];

  return Q.spread(reqs, function(player, squirrel) {

    var world = new World(player);

    makeMainTestGrid(world, 50);
    world.add(squirrel, 1, new Position(5, 5));

    var portal = Portal('main-b', sceneManager.load.bind(sceneManager, 'main-b'));
    world.add(portal, 1, new Position(8, 8));

    var keybindings = new KeyBindings(document);
    // TODO don't use new
    new MovementHandler(keybindings, world, world.player);

    collide(world, player);

    var view = world.view(20, 20);

    sceneManager.addScene('main', function() {
      player.position.set(2, 2);
      view.position.set(0, 0);
      sceneManager.render = view.render.bind(view);
    });

    sceneManager.addScene('main-b', function() {
      player.position.set(2, 10);
      view.position.set(0, 0);
      sceneManager.render = view.render.bind(view);
    });

    // TODO it's very important to fully unload/clean up a scene
    // when another is loaded. I sense this could be an easy thing to get
    // wrong, creating subtle bugs. How to make this foolproof?
  });
}


function makeRoomTestWorld(sceneManager) {

  return Player().then(function(player) {

    var world = new World(player);

    makeMainTestGrid(world, 50, 'purple');

    var keybindings = new KeyBindings(document);
    // TODO don't use new
    new MovementHandler(keybindings, world, world.player);

    var view = world.view(20, 20);

    sceneManager.addScene('room', function() {
      player.position.set(2, 2);
      view.position.set(0, 0);
      sceneManager.render = view.render.bind(view);
    });

    // TODO it's very important to fully unload/clean up a scene
    // when another is loaded. I sense this could be an easy thing to get
    // wrong, creating subtle bugs. How to make this foolproof?
  });
}

function Player() {
  return loadSpriteSheet('media/playerSprites.png')
  .then(function(playerSpriteSheet) {

    return {
      position: new Position(0, 0),
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


function makeMainTestGrid(world, size, color) {
  var color = color || 'gray';

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

  var walkable = new Area(size - 1, size - 1, color);
  world.add(walkable, 0, new Position(1, 1), walkable.w, walkable.h);

  var portal = new Area(1, 1, 'blue');
  world.add(portal, 1, new Position(8, 8));
}
