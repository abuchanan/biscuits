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
