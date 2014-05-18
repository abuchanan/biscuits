suite('BackgroundTiles', function() {

/*
  Simply testing the BackgroundTiles can be created without error.
  It doesn't depend on the tilesDef during init.
*/
test('basic creation', function() {
  BackgroundTiles({});
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
  BackgroundTiles is a fairly simple helper for managing a grid of
  background image tiles.

  BackgroundTiles.query(x, y, w, h) is used to retrieve the tiles
  overlapped by the given rectangle. The given rectange is in world
  units, e.g. the area around the player, not tile grid coordinates.
*/
test('query', function() {

  // Create a 10 x 10 grid of tiles which are 10 x 10.
  var mockDef = mockTilesDef(10, 10, 10, 10);
  var tiles = mockDef._grid;

  var backgroundTiles = BackgroundTiles(mockDef);

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
  var backgroundTiles = BackgroundTiles(mockDef);
  var callback = sinon.spy();
  backgroundTiles.query(150, 150, 1, 1, callback);
  assert.equal(callback.callCount, 0);
});


/*
  BackgroundTiles.prefetch() can be used to load a region of tiles,
  i.e. it calls tile.load() for every tile in region.
*/
test('prefetch', function() {
  // Create a 10 x 10 grid of tiles which are 10 x 10.
  var mockDef = mockTilesDef(10, 10, 10, 10);
  var tiles = mockDef._grid;
  var backgroundTiles = BackgroundTiles(mockDef);
  backgroundTiles.prefetch(12, 12, 10, 10);
  assert.equal(tiles[1][1].load.callCount, 1);
  assert.equal(tiles[1][2].load.callCount, 1);
  assert.equal(tiles[2][1].load.callCount, 1);
  assert.equal(tiles[2][2].load.callCount, 1);
});

});


suite('BackgroundRegion', function() {

var region, tilesMock, callback;

setup(function() {
  callback = sinon.spy();
  tilesMock = {
    prefetch: sinon.spy(),
    query: sinon.spy(),
  };
  region = BackgroundRegion(10, 10, tilesMock);
});


/* It does not prefetch any tiles upon init. */
test('init', function() {
  assert(tilesMock.prefetch.notCalled);
  assert(tilesMock.query.notCalled);
});

/*
  BackgroundRegion is a fairly simple helper for representing the region
  of background tiles that are currently visible.

  This region follows the player around. When the player moves,
  BackgroundRegion.setPosition() is called. The tiles in this area are 
  prefetched, i.e. loaded ahead of time, in preparation for rendering.

  Actually, the background region is slightly bigger than the visible area,
  which allows tiles just outside the visible area to be prefetched.
*/
test('setPosition', function() {
  region.setPosition(12, 12);
  assert(tilesMock.prefetch.calledOnce);
  assert(tilesMock.prefetch.calledWith(12, 12, 10, 10));
});

test('forEachTile default position', function() {
  region.forEachTile(callback);
  assert(tilesMock.query.calledWith(0, 0, 10, 10));
});

test('forEachTile + setPosition', function() {
  region.setPosition(15, 15);
  region.forEachTile(callback);
  assert(tilesMock.query.calledWith(15, 15, 10, 10));
});

test('forEachTile + resize', function() {
  region.resize(5, 5);
  region.forEachTile(callback);
  assert.deepEqual(tilesMock.query.args[0], [0, 0, 5, 5, callback]);
});

test('resize', function() {
  region.resize(5, 5);
  assert(tilesMock.prefetch.calledOnce);
  assert.deepEqual(tilesMock.prefetch.args[0], [0, 0, 5, 5]);
});

});
