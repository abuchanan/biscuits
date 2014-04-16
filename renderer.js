'use strict';

function Tile(row, column) {
  this.row = row;
  this.column = column;
  this.layers = [];
  this.block = false;
  this.portal = false;
}


function SolidColor(color) {
  this.color = color;
}
SolidColor.prototype = {
  render: function(ctx, x, y, w, h) {
      ctx.fillStyle = this.color;
      ctx.fillRect(x, y, w, h);
  }
}


function Grid(numRows, numColumns) {
  this.numRows = numRows;
  this.numColumns = numColumns;
  this._items = [];

  for (var row_i = 0; row_i < this.numRows; row_i++) {
    var row = [];
    this._items.push(row);

    for (var col_i = 0; col_i < this.numColumns; col_i++) {
      var tile = new Tile(row_i, col_i);
      row.push(tile);
    }
  }
}

Grid.prototype = {
  forEach: function(callback) {
    for (var row_i = 0; row_i < this.numRows; row_i++) {
      for (var col_i = 0; col_i < this.numColumns; col_i++) {
        var item = this._items[row_i][col_i];
        callback(item);
      }
    }
  },

  getTile: function(row, column) {
    if (row < this.numRows && column < this.numColumns) {
      return this._items[row][column];
    }
  },
};


function GridRenderer(grid, blankTile, tileHeight, tileWidth) {
  this.grid = grid;
  this.tileHeight = tileHeight;
  this.tileWidth = tileWidth;
  this.blankTile = blankTile;
}

GridRenderer.prototype = {
  render: function(ctx) {
    var renderer = this;

    this.grid.forEach(function(tile, row, column) {

      var x = column * renderer.tileWidth;
      var y = row * renderer.tileHeight;

      if (tile) {
        for (var layer_i = 0; layer_i < tile.layers.length; layer_i++) {
          var layer = tile.layers[layer_i];
          layer.render(ctx, x, y, renderer.tileWidth, renderer.tileHeight);
        }
      } else {
        renderer.blankTile.render(ctx, x, y, renderer.tileWidth, renderer.tileHeight);
      }
    });
  },
};


function PlayerRenderer(player, sprites, tileHeight, tileWidth) {
  this.tileHeight = tileHeight;
  this.tileWidth = tileWidth;
  this.player = player;
  this.sprites = sprites;
}

PlayerRenderer.prototype = {
  render: function(ctx) {
    var x = this.player.position.column * this.tileWidth;
    var y = this.player.position.row * this.tileHeight;

    var sprite = this.sprites[this.player.direction]

    if (!sprite) {
      throw 'Error: missing sprite';
    }

    sprite.render(ctx, x, y, this.tileWidth, this.tileHeight);
  },
};


function World() {
  this.maps = {};
}
World.prototype = {

  registerMap: function(name, grid) {
    this.maps[name] = grid;
  },

  getTile: function(map, row, column) {
    // TODO handle missing map
    return this.maps[map].getTile(row, column);
  },
};


function makeTestWorld() {
  var mainGrid = makeMainTestGrid();
  var roomGrid = makeRoomTestGrid();

  var world = new World();
  world.registerMap('main', mainGrid);
  world.registerMap('room', roomGrid);

  return world;
}

function makeRoomTestGrid() {
  var grid = new Grid(50, 50);
  var blackTile = new SolidColor('black');
  var blueTile = new SolidColor('blue');

  grid.forEach(function(tile) {
    if (tile.row == 0 || tile.column == 0 ||
        tile.row == grid.numRows - 1 ||
        tile.column == grid.numColumns - 1) {

      tile.layers.push(blackTile);
      tile.block = true;
    } else {
      tile.layers.push(blueTile);
    }
  });

  var portal = grid.getTile(10, 10);
  portal.portal = 'main';
  portal.layers = [new SolidColor('green')];

  return grid;
}


function makeMainTestGrid() {
  var grid = new Grid(100, 100);
  var blackTile = new SolidColor('black');
  var grayTile = new SolidColor('gray');

  grid.forEach(function(tile) {
    if (tile.row == 0 || tile.column == 0 ||
        tile.row == grid.numRows - 1 ||
        tile.column == grid.numColumns - 1) {

      tile.layers.push(blackTile);
      tile.block = true;
    } else {
      tile.layers.push(grayTile);
    }
  });

  var portal = grid.getTile(10, 10);
  portal.portal = 'room';
  portal.layers = [new SolidColor('green')];

  return grid;
}


function ViewpointLoader(world, view, player) {
  this.world = world;
  this.view = view;
  this.player = player;

  // TODO hard-codeded
  this.viewpoints = {
    'main': {
      viewPosition: {
        map: 'main',
        row: 0,
        column: 0,
      },
      playerPosition: {
        map: 'main',
        row: 2,
        column: 2,
      },
    },
    'room': {
      viewPosition: {
        map: 'room',
        row: 0,
        column: 0,
      },
      playerPosition: {
        map: 'room',
        row: 2,
        column: 2,
      },
    },
  };
}

ViewpointLoader.prototype = {
  load: function(name) {
    var viewpoint = this.viewpoints[name];
    this.view.setPosition(viewpoint.viewPosition);
    this.player.setPosition(viewpoint.playerPosition);
  },
};


function WorldView(world, numRows, numColumns) {
  this.world = world;
  this.numRows = numRows;
  this.numColumns = numColumns;
  // TODO or map is an instance of Map instead of a string (map name)?
  this.position = {
    map: false,
    row: 0,
    column: 0,
  };
}

WorldView.prototype = {

  setPosition: function(pos) {
    this.position.map = pos.map;
    this.position.row = pos.row;
    this.position.column = pos.column;
  },

  forEach: function(callback) {
    for (var i = 0; i < this.numRows; i++) {
      for (var j = 0; j < this.numColumns; j++) {
        var tile = this.getTile(i, j);
        callback(tile, i, j);
      }
    }
  },

  getTile: function(i, j) {
    var row_i = this.position.row + i;
    var col_i = this.position.column + j;
    return this.world.getTile(this.position.map, row_i, col_i);
  },

  // TODO need to be careful about shifting out of bounds
  shiftRight: function() {
    this.position.column += this.numColumns - 2;
  },
  shiftLeft: function() {
    this.position.column -= this.numColumns - 2;
  },
  shiftUp: function() {
    this.position.row -= this.numRows - 2;
  },
  shiftDown: function() {
    this.position.row += this.numRows - 2;
  },
};


function startBiscuits(canvas) {

  Q.all([
    loadSpriteSheet('playerSprites.png'),
    loadSpriteSheet('Monster-squirrel.png'),

  ]).then(function(spritesheets) {

    var playerSpriteSheet = spritesheets[0];

    var playerSprites = {
      'up': playerSpriteSheet.slice(5, 175, 80, 80),
      'down': playerSpriteSheet.slice(5, 275, 80, 80),
      'left': playerSpriteSheet.slice(0, 0, 80, 80),
      'right': playerSpriteSheet.slice(375, 95, 80, 80),
    };

    var player = {
      position: {map: false, row: 0, column: 0},
      direction: 'down',
      setPosition: function(pos) {
        this.position.map = pos.map;
        this.position.row = pos.row;
        this.position.column = pos.column;
      },
    };


    var world = makeTestWorld();
  
    var worldview = new WorldView(world, 20, 20);

    var viewpointLoader = new ViewpointLoader(world, worldview, player);
    viewpointLoader.load('main');

    var blankTile = new SolidColor('black');

    // TODO a simple list doesn't give fine grained control over each
    //      frame (such as frame duraction). imploy a addFrame method
    var squirrelSpriteAnim = new SpriteAnimation([
      spritesheets[1].slice(0, 0, 30, 30),
      spritesheets[1].slice(30, 30, 30, 30),
      spritesheets[1].slice(0, 0, 30, 30),
    ]);

    var squirrelTile = world.getTile('main', 5, 5);
    squirrelTile.layers.push(squirrelSpriteAnim);
    squirrelTile.block = true;

    var tileWidth = canvas.width / worldview.numColumns;
    var tileHeight = canvas.height / worldview.numRows;
    

    // TODO i don't like having to pass document around
    var keybindings = new KeyBindings(document);
    var movementHandler = new MovementHandler(keybindings, player, worldview, viewpointLoader);

    startRender(canvas, [
      new GridRenderer(worldview, blankTile, tileWidth, tileHeight),
      new PlayerRenderer(player, playerSprites, tileWidth, tileHeight),
      //new TileCoordinateDebugRenderer(worldview),
    ]);
  }).fail(function(error) {
    console.log(error);
  });
}


function startRender(canvas, renderers) {
  var ctx = canvas.getContext('2d');

  function masterRender() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (var i = 0, ii = renderers.length; i < ii; i++) {
      ctx.save();
      renderers[i].render(ctx);
      ctx.restore();
    }
    requestAnimationFrame(masterRender);
  }
  requestAnimationFrame(masterRender);
}
