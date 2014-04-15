

var sprites = {};

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

  for (var row_i = 0; row_i < numRows; row_i++) {
    for (var col_i = 0; col_i < numColumns; col_i++) {
      this.setTile(row_i, col_i, undefined);
    }
  }
}

Grid.prototype = {
  forEach: function(callback) {
    for (var i = 0, ii = this.numRows; i < ii; i++) {
      for (var j = 0, jj = this.numColumns; j < jj; j++) {
        var idx = i * this.numColumns + j;
        callback(this._items[idx]);
      }
    }
  },

  getTile: function(row, column) {
    var idx = row * this.numColumns + column;
    return this._items[idx];
  },

  setTile: function(row, column, value) {
    var idx = row * this.numColumns + column;
    this._items[idx] = new this.Tile(row, column, value);
  },
};


function SpriteTileRenderer(grid, sprites, tileHeight, tileWidth) {
  this.grid = grid;
  this.tileHeight = tileHeight;
  this.tileWidth = tileWidth;
}

SpriteTileRenderer.prototype = {
  render: function(ctx) {
    this.grid.forEach(function(tile) {
      var x = tile.column * this.tileWidth;
      var y = tile.row * this.tileHeight;
      ctx.fillStyle = tile.value;
      ctx.fillRect(x, y, this.tileWidth, this.tileHeight)
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
    //ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
    //ctx.fillRect(x, y, this.tileWidth, this.tileHeight);

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
  var grid = new Grid(20, 20, Tile);

  grid.forEach(function(tile) {
    if (tile.row == 0 || tile.column == 0) {
      tile.value = 'black';
      tile.block = true;
    } else {
      tile.value = 'gray';
    }
  });
  return grid;
}

function startBiscuits(canvas) {

  loadSprite('playerSprites.png').then(function(playerSprite) {

    var grid = makeTestGrid();

    tileWidth = canvas.width / grid.numColumns;
    tileHeight = canvas.height / grid.numRows;
    
    var player = {
      position: {row: 2, column: 1},
      direction: 'down',
    };

    // TODO i don't like having to pass document around
    var keybindings = new KeyBindings(document);
    var movementHandler = new MovementHandler(keybindings, player, grid);

    startRender(canvas, [
      new SpriteTileRenderer(grid, sprites, tileWidth, tileHeight),
      new PlayerRenderer(player, playerSprite, tileWidth, tileHeight),
    ]);
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
      player.position.row = nextRow;
      player.position.column = nextCol;
      
      // TODO handle loading next screen
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
