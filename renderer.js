'use strict';

function Tile(row, column, value) {
  this.row = row;
  this.column = column;
  this.value = value;
  this.block = false;
}

function Grid(numRows, numColumns, Tile) {
  this.numRows = numRows;
  this.numColumns = numColumns;
  this.Tile = Tile;
  this._items = [];

  for (var row_i = 0; row_i < this.numRows; row_i++) {
    var row = [];
    this._items.push(row);

    for (var col_i = 0; col_i < this.numColumns; col_i++) {
      var tile = new this.Tile(row_i, col_i, undefined);
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


function SpriteTileRenderer(grid, sprites, tileHeight, tileWidth) {
  this.grid = grid;
  this.tileHeight = tileHeight;
  this.tileWidth = tileWidth;
  this.sprites = sprites;
}

SpriteTileRenderer.prototype = {
  render: function(ctx) {
    var renderer = this;

    this.grid.forEach(function(tile, row, column) {

      var x = column * renderer.tileWidth;
      var y = row * renderer.tileHeight;

      if (tile) {
        ctx.fillStyle = tile.value;
        ctx.fillRect(x, y, renderer.tileWidth, renderer.tileHeight);

      } else {
        renderer.drawBlank(ctx, x, y);
      }

      // TODO hack
      if (row == 1 && column == 1) {
        ctx.drawImage(renderer.sprites[1].image, 
                      // source image x, y
                      0, 0,
                      // source image width, height
                      30, 30,
                      // destination x, y
                      x, y,
                      // destination width, height
                      renderer.tileWidth, renderer.tileHeight);
      }
    });
  },

  drawBlank: function(ctx, x, y) {
    ctx.fillStyle = 'black';
    ctx.fillRect(x, y, this.tileWidth, this.tileHeight);
  },
};

function TileCoordinateDebugRenderer(grid) {
  this.grid = grid;
}
TileCoordinateDebugRenderer.prototype = {
  render: function(ctx) {
    // TODO be careful about using "this" in forEach
    this.grid.forEach(function(tile, row, column) {
      var x = column * this.tileWidth;
      var y = row * this.tileHeight;
      var str = tile.row + ',' + tile.column
      ctx.fillStyle = 'black';
      //ctx.font = '16px serif';
      ctx.fillText(str, x + 7, y + 13);
    });
  },
};


function PlayerRenderer(player, playerSprite, tileHeight, tileWidth) {
  this.tileHeight = tileHeight;
  this.tileWidth = tileWidth;
  this.player = player;
  this.playerSprite = playerSprite;
}

PlayerRenderer.prototype = {
  render: function(ctx) {
    var x = this.player.position.column * this.tileWidth;
    var y = this.player.position.row * this.tileHeight;

    if (this.player.direction == 'up') {
      ctx.drawImage(this.playerSprite.image,
                    // source image x, y
                    5, 175,
                    // source image width, height
                    80, 80,
                    // destination x, y
                    x, y,
                    // destination width, height
                    this.tileWidth, this.tileHeight);

    } else if (this.player.direction == 'down') {
      ctx.drawImage(this.playerSprite.image,
                    // source image x, y
                    5, 275,
                    // source image width, height
                    80, 80,
                    // destination x, y
                    x, y,
                    // destination width, height
                    this.tileWidth, this.tileHeight);

    } else if (this.player.direction == 'left') {
      ctx.drawImage(this.playerSprite.image,
                    // source image x, y
                    0, 0,
                    // source image width, height
                    80, 80,
                    // destination x, y
                    x, y,
                    // destination width, height
                    this.tileWidth, this.tileHeight);

    } else if (this.player.direction == 'right') {
      ctx.drawImage(this.playerSprite.image,
                    // source image x, y
                    375, 95,
                    // source image width, height
                    80, 80,
                    // destination x, y
                    x, y,
                    // destination width, height
                    this.tileWidth, this.tileHeight);
    }
  },
};


function Sprite(image) {
  this.image = image;
}

function loadSprite(src) {
  var deferred = Q.defer();

  var img = new Image();

  img.onload = function() {
    var sprite = new Sprite(img);
    deferred.resolve(sprite);
  }
  img.src = src;
  
  return deferred.promise;
}

function makeTestGrid() {
  var grid = new Grid(100, 100, Tile);

  grid.forEach(function(tile) {
    if (tile.row == 0 || tile.column == 0 ||
        tile.row == grid.numRows - 1 ||
        tile.column == grid.numColumns - 1) {

      tile.value = 'black';
      tile.block = true;
    } else {
      tile.value = 'gray';
    }

  });
  return grid;
}


function WorldView(world, numRows, numColumns) {
  this.world = world;
  this.numRows = numRows;
  this.numColumns = numColumns;
  this.offset = {
    row: 0,
    column: 0,
  };
}

WorldView.prototype = {
  forEach: function(callback) {
    for (var i = 0; i < this.numRows; i++) {
      for (var j = 0; j < this.numColumns; j++) {
        var tile = this.getTile(i, j);
        callback(tile, i, j);
      }
    }
  },
  getTile: function(i, j) {
    var row_i = this.offset.row + i;
    var col_i = this.offset.column + j;
    return this.world.getTile(row_i, col_i);
  },

  // TODO need to be careful about shifting out of bounds
  shiftRight: function() {
    this.offset.column += this.numColumns - 2;
  },
  shiftLeft: function() {
    this.offset.column -= this.numColumns - 2;
  },
  shiftUp: function() {
    this.offset.row -= this.numRows - 2;
  },
  shiftDown: function() {
    this.offset.row += this.numRows - 2;
  },
};


function startBiscuits(canvas) {

  Q.all([
    loadSprite('playerSprites.png'),
    loadSprite('Monster-squirrel.png'),

  ]).then(function(sprites) {

    var playerSprite = sprites[0];
    var squirrelSprite = sprites[1];

    var world = makeTestGrid();
    var worldview = new WorldView(world, 20, 20);

    var tileWidth = canvas.width / worldview.numColumns;
    var tileHeight = canvas.height / worldview.numRows;
    
    var player = {
      position: {row: 2, column: 1},
      direction: 'down',
    };

    // TODO i don't like having to pass document around
    var keybindings = new KeyBindings(document);
    var movementHandler = new MovementHandler(keybindings, player, worldview);

    startRender(canvas, [
      new SpriteTileRenderer(worldview, sprites, tileWidth, tileHeight),
      new PlayerRenderer(player, playerSprite, tileWidth, tileHeight),
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


function MovementHandler(keybindings, player, grid) {

  function move(rowDelta, columnDelta) {
    var nextRow = player.position.row + rowDelta;
    var nextCol = player.position.column + columnDelta;

    var nextTile = grid.getTile(nextRow, nextCol);

    if (nextTile && !nextTile.block) {

      if (nextTile.column == grid.offset.column + grid.numColumns - 1) {
        player.position.column = 1;
        grid.shiftRight();
      } else if (nextTile.column == grid.offset.column) {
        grid.shiftLeft();
        player.position.column = grid.numColumns - 2;

      } else if (nextTile.row == grid.offset.row + grid.numRows - 1) {
        grid.shiftDown();
        player.position.row = 1;

      } else if (nextTile.row == grid.offset.row) {
        grid.shiftUp();
        player.position.row = grid.numRows - 2;

      } else {
        player.position.row = nextRow;
        player.position.column = nextCol;
      }
      
    }
  }

  function makeCallback(rowDelta, columnDelta) {
    return function(direction) {
      move(rowDelta, columnDelta);
      player.direction = direction;
    }
  }

  keybindings.on('up', makeCallback(-1, 0));
  keybindings.on('down', makeCallback(1, 0));
  keybindings.on('left', makeCallback(0, -1));
  keybindings.on('right', makeCallback(0, 1));
}


function KeyBindings(document) {

  var keybindings = this;

  document.addEventListener('keypress', function(event) {

    var keyCodeMap = {
      38: 'up',
      40: 'down',
      37: 'left',
      39: 'right',
    };

    var eventName = keyCodeMap[event.keyCode];
    if (eventName) {
      keybindings._fire(eventName);
      event.preventDefault();
    }

  }, true);

  this.listeners = {};
}

KeyBindings.prototype = {
  _fire: function(name) {
    var listeners = this.listeners[name] || [];
    for (var i = 0, ii = listeners.length; i < ii; i++) {
      listeners[i](name);
    }
  },
  on: function(name, callback) {
    var listeners = this.listeners[name];

    if (!listeners) {
      var listeners = [];
      this.listeners[name] = listeners;
    }

    this.listeners[name].push(callback);
  },
};
