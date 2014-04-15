

var sprites = {};

function Tile(row, column, value) {
  this.row = row;
  this.column = column;
  this.value = value;
}

function TileCollection(numRows, numColumns) {
  this.numRows = numRows;
  this.numColumns = numColumns;
  this._items = [];
}
TileCollection.prototype = {
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

function SpriteTileRenderer(collection, sprites, tileHeight, tileWidth) {
  this.collection = collection;
  this.tileHeight = tileHeight;
  this.tileWidth = tileWidth;
}

SpriteTileRenderer.prototype = {
  render: function(ctx) {
    this.collection.forEach(function(tile) {
      var x = tile.column * this.tileWidth;
      var y = tile.row * this.tileHeight;
      ctx.fillStyle = tile.value;
      ctx.fillRect(x, y, this.tileWidth, this.tileHeight)
    });
  },
};


function PlayerRenderer(tileHeight, tileWidth) {
  this.tileHeight = tileHeight;
  this.tileWidth = tileWidth;
  this.position = {row: 2, column: 1};
}

PlayerRenderer.prototype = {
  render: function(ctx) {
    var x = this.position.column * this.tileWidth;
    var y = this.position.row * this.tileHeight;
    ctx.fillStyle = 'purple';
    ctx.fillRect(x, y, this.tileWidth, this.tileHeight);
  },
};


function startBiscuits(canvas) {
  var rows = 20;
  var columns = 20;

  var tiles = new TileCollection(rows, columns);

  for (var row_i = 0; row_i < rows; row_i++) {
    for (var col_i = 0; col_i < columns; col_i++) {
      tiles.setTile(row_i, col_i, 'gray');
    }
  }


  tileWidth = canvas.width / tiles.numColumns;
  tileHeight = canvas.height / tiles.numRows;
  
  var ctx = canvas.getContext('2d');

  var renderers = [
    new SpriteTileRenderer(tiles, sprites, tileWidth, tileHeight),
    new PlayerRenderer(tileWidth, tileHeight),
  ];

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
