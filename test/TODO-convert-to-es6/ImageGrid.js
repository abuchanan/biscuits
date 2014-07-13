export var skip = true;

var ImageGrid = require('../../src/ImageGrid');

/*
  Simply testing the ImageGrid can be created without error.
  It doesn't depend on the tilesDef during init.
*/
test('basic creation', function() {
  ImageGrid({});
});


/*
  Set up a grid of mock tiles.
  Each tile method is a sinon spy.
*/
// TODO there might be a better way to do this with sinon stub/mock
function mockTilesDef(w, h, tileW, tileH) {
  var tiles = [];

  for (var x = 0; x < 10; x++) {
    var row = [];
    tiles.push(row);
    for (var y = 0; y < 100; y++) {
      var tileMock = {
        load: sinon.spy(),
      };
      row.push(tileMock);
    }
  }

  var mockTilesDef = {
    _grid: tiles,
    tileWidth: tileW,
    tileHeight: tileH,
    getTile: function(x, y) {
      if (x >= 0 && x < tiles[0].length && y >= 0 && y < tiles.length) {
        return tiles[y][x];
      }
    },
  };
  return mockTilesDef;
}


/*
  ImageGrid is a fairly simple helper for managing a grid of
  background image tiles.

  ImageGrid.query(x, y, w, h) is used to retrieve the tiles
  overlapped by the given rectangle. The given rectange is in world
  units, e.g. the area around the player, not tile grid coordinates.
*/
test('query', function() {

  // Create a 10 x 10 grid of tiles which are 10 x 10.
  var mockDef = mockTilesDef(10, 10, 10, 10);
  var tiles = mockDef._grid;

  var backgroundTiles = ImageGrid(mockDef);

  var callback = sinon.spy();
  backgroundTiles.query(2, 2, 1, 1, callback);

  assert(callback.calledOnce, 'expected callback to be called');
  assert.deepEqual(callback.args[0], [tiles[0][0]]);

  callback.reset();

  backgroundTiles.query(12, 12, 10, 10, callback);

  assert.equal(callback.callCount, 4);
  assert.deepEqual(callback.args[0], [tiles[1][1]]);
  assert.deepEqual(callback.args[1], [tiles[1][2]]);
  assert.deepEqual(callback.args[2], [tiles[2][1]]);
  assert.deepEqual(callback.args[3], [tiles[2][2]]);
});


/*
  Queries outside the bounds of existing tiles will run but the callback
  won't be called.
*/
test('query out of bounds', function() {
  // Create a 10 x 10 grid of tiles which are 10 x 10.
  var mockDef = mockTilesDef(10, 10, 10, 10);
  var backgroundTiles = ImageGrid(mockDef);
  var callback = sinon.spy();
  backgroundTiles.query(150, 150, 1, 1, callback);
  assert.equal(callback.callCount, 0);
});


/*
  ImageGrid.prefetch() can be used to load a region of tiles,
  i.e. it calls tile.load() for every tile in region.
*/
test('prefetch', function() {
  // Create a 10 x 10 grid of tiles which are 10 x 10.
  var mockDef = mockTilesDef(10, 10, 10, 10);
  var tiles = mockDef._grid;
  var backgroundTiles = ImageGrid(mockDef);
  backgroundTiles.prefetch(12, 12, 10, 10);
  assert.equal(tiles[1][1].load.callCount, 1);
  assert.equal(tiles[1][2].load.callCount, 1);
  assert.equal(tiles[2][1].load.callCount, 1);
  assert.equal(tiles[2][2].load.callCount, 1);
});
