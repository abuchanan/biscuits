

var sprites = {};

function Tile(row, column, value) {
  this.row = row;
  this.column = column;
  this.value = value;
}

function Grid(numRows, numColumns) {
  this.numRows = numRows;
  this.numColumns = numColumns;
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

  setTile: function(row, column, value) {
    var idx = row * this.numColumns + column;
    this._items[idx] = new Tile(row, column, value);
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


function PlayerRenderer(player, tileHeight, tileWidth) {
  this.tileHeight = tileHeight;
  this.tileWidth = tileWidth;
  this.player = player;
}

PlayerRenderer.prototype = {
  render: function(ctx) {
    var x = this.player.position.column * this.tileWidth;
    var y = this.player.position.row * this.tileHeight;
    ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
    ctx.fillRect(x, y, this.tileWidth, this.tileHeight);
  },
};


function startBiscuits(canvas) {

  var grid = new Grid(20, 20);

  grid.forEach(function(tile) {
    tile.value = 'gray';
  });

  tileWidth = canvas.width / grid.numColumns;
  tileHeight = canvas.height / grid.numRows;
  
  var ctx = canvas.getContext('2d');

  var player = {
    position: {row: 2, column: 1},
  };

  var renderers = [
    new SpriteTileRenderer(grid, sprites, tileWidth, tileHeight),
    new PlayerRenderer(player, tileWidth, tileHeight),
  ];

  document.addEventListener('keypress', function(event) {
    var keyCodeMap = {
      38: 'UP',
      40: 'DOWN',
      37: 'LEFT',
      39: 'RIGHT',
    };

    if (event.keyCode == 38) {
      player.position.row -= 1;
    } else if (event.keyCode == 40) {
      player.position.row += 1;
    } else if (event.keyCode == 37) {
      player.position.column -= 1;
    } else if (event.keyCode == 39) {
      player.position.column += 1;
    }
  }, true);

  function masterRender() {
    for (var i = 0, ii = renderers.length; i < ii; i++) {
      ctx.save();
      renderers[i].render(ctx);
      ctx.restore();
    }
    requestAnimationFrame(masterRender);
  }

  requestAnimationFrame(masterRender);
}
