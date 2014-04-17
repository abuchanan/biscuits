function Grid(width, height) {
  this.width = width;
  this.height = height;
  this._items = [];

  for (var y = 0; y < this.height; y++) {
    var row = [];
    this._items.push(row);

    for (var x = 0; x < this.width; x++) {
      var tile = new Tile(x, y);
      row.push(tile);
    }
  }
}

Grid.prototype = {
  forEach: function(callback) {
    for (var y = 0; y < this.height; y++) {
      for (var x = 0; x < this.width; x++) {
        var item = this._items[y][x];
        callback(item);
      }
    }
  },

  getTile: function(x, y) {
    if (x < this.width && y < this.height) {
      return this._items[y][x];
    }
  },
};
