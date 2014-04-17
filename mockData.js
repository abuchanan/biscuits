function PortalManager(load) {
    return {
      _portals: {},

      handlePlayerPositionChange: function(playerPosition) {
        var x = playerPosition.getX();
        var y = playerPosition.getY();

        var key = [x, y];
        var portal = this._portals[key];
        if (portal) {
          load(portal);
        }
      },

      addPortal: function(name, x, y) {
        var key = [x, y];
        this._portals[key] = name;
      },
    }
}

function makeTestWorld(sceneManager) {

  Q.all([
    loadSpriteSheet('media/playerSprites.png'),
    loadSpriteSheet('media/Monster-squirrel.png'),

  ]).then(function(spritesheets) {

    var playerSpriteSheet = spritesheets[0];

    // TODO a simple list doesn't give fine grained control over each
    //      frame (such as frame duraction). imploy a addFrame method
    var squirrelSpriteAnim = new SpriteAnimation([
      spritesheets[1].slice(0, 0, 30, 30),
      spritesheets[1].slice(30, 30, 30, 30),
      spritesheets[1].slice(0, 0, 30, 30),
    ]);
    squirrelSpriteAnim.isBlock = true;

    
    var load = sceneManager.load.bind(sceneManager);
    var portals = PortalManager(load);
    portals.addPortal('room', 8, 8);

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

    var world = new World(player);

    makeMainTestGrid(world, 50);
    world.add(squirrelSpriteAnim, 1, new Position(5, 5));

    player.position.onChange(portals.handlePlayerPositionChange.bind(portals));

    var keybindings = new KeyBindings(document);
    // TODO don't use new
    new MovementHandler(keybindings, world, world.player);

    var view = world.view(20, 20);

    sceneManager.render = WorldViewRenderer(view);

    // TODO it's very important to fully unload/clean up a scene
    // when another is loaded. I sense this could be an easy thing to get
    // wrong, creating subtle bugs. How to make this foolproof?
  });
}


function makeRoomTestWorld(sceneManager) {

  Q.all([
    loadSpriteSheet('media/playerSprites.png'),

  ]).then(function(spritesheets) {

    var playerSpriteSheet = spritesheets[0];

    var load = sceneManager.load.bind(sceneManager);
    var portals = PortalManager(load);
    portals.addPortal('main', 8, 8);

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

    var world = new World(player);

    makeMainTestGrid(world, 50, 'purple');

    player.position.onChange(portals.handlePlayerPositionChange.bind(portals));

    var keybindings = new KeyBindings(document);
    // TODO don't use new
    new MovementHandler(keybindings, world, world.player);

    var view = world.view(20, 20);

    sceneManager.render = WorldViewRenderer(view);

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
