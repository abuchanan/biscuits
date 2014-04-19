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

      render: function(ctx, x, y, w, h) {
          var sprite = sprites[this.direction]
          sprite.render(ctx, x, y, w, h);
      },
    };
  });
}


function SquirrelService() {
  return loadSpriteSheet('media/Monster-squirrel.png')
  .then(function(spritesheet) {

    return {
      create: function() {
        // TODO a simple list doesn't give fine grained control over each
        //      frame (such as frame duraction). imploy a addFrame method
        var squirrelSpriteAnim = new SpriteAnimation([
          spritesheet.slice(0, 0, 30, 30),
          spritesheet.slice(30, 30, 30, 30),
          spritesheet.slice(0, 0, 30, 30),
        ]);
        squirrelSpriteAnim.isBlock = true;

        return squirrelSpriteAnim;
      },
    };
  });
}


function Portal(load) {
  return {
    handlePlayerCollision: function(player) {
      load();
    },
  }
}

function Collider(world, player) {

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


function makeTestWorld(sceneManager) {

  var reqs = [Player(), SquirrelService()];

  return Q.spread(reqs, function(player, Squirrel) {

    var world = new World();
    var playerPosition = new Position(0, 0);

    world.add(player, 2, playerPosition);

    //makeMainTestGrid(world, 50);

    var mapData = fooData2;

    parseMap(mapData).then(function(layers) {
      // TODO number of layers in world needs to be set  here

        for (var layer_i = 0; layer_i < layers.length; layer_i++) {
          for (var obj_i = 0; obj_i < layers[layer_i].length; obj_i++) {
            var obj = layers[layer_i][obj_i];
            world.add(obj, layer_i, new Position(obj.x, obj.y), obj.maxX, obj.maxY);
          }
        }
    });

    var squirrel = Squirrel.create();
    world.add(squirrel, 1, new Position(5, 5));

    //var portal = Portal(sceneManager.load.bind(sceneManager, 'main-b'));
    //world.add(portal, 1, new Position(8, 8));

    var movement = MovementHandler(world, player, playerPosition);
    var collider = Collider(world, player);

    var keybindings = KeyBindingsService(document);

    var view = new WorldView(world, 20, 20);

    playerPosition.onChange(collider);
    playerPosition.onChange(view.handlePlayerPositionChange.bind(view));

    sceneManager.addScene('main', function() {
      // TODO not only set position, but direction
      playerPosition.set(2, 2);
      view.position.set(0, 0);
      sceneManager.render = view.render.bind(view);

      var deregisterKeybindings = keybindings.listen(function(name) {
        movement[name]();
      });

      // return unload function
      return function() {
        deregisterKeybindings();
      }

    });

    sceneManager.addScene('main-b', function() {
      playerPosition.set(2, 10);
      view.position.set(0, 0);
      sceneManager.render = view.render.bind(view);

      var deregisterKeybindings = keybindings.listen(function(name) {
        movement[name]();
      });

      // return unload function
      return function() {
        deregisterKeybindings();
      }
    });

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
