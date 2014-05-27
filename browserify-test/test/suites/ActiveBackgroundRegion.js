var ActiveBackgroundRegion = require('../../src/ActiveBackgroundRegion');

var tiles, callback;

setup(function() {
  callback = sinon.spy();

  tiles = {
    prefetch: function() {},
    query: function() {},
  };
  tiles.mock = sinon.mock(tiles);
});


/* It does not prefetch any tiles upon init. */
test('init', function() {
  tiles.mock.expects('prefetch').never();
  tiles.mock.expects('query').never();

  ActiveBackgroundRegion(10, 10, tiles);
  tiles.mock.verify();
});

/*
  ActiveBackgroundRegion is a fairly simple helper for representing the region
  of background tiles that are currently visible.

  This region follows the player around. When the player moves,
  ActiveBackgroundRegion.setPosition() is called. The tiles in this area are 
  prefetched, i.e. loaded ahead of time, in preparation for rendering.

  Actually, the background region is slightly bigger than the visible area,
  which allows tiles just outside the visible area to be prefetched.
*/
test('setPosition', function() {
  tiles.mock.expects('prefetch').once().withArgs(12, 12, 10, 10);

  var region = ActiveBackgroundRegion(10, 10, tiles);
  region.setPosition(12, 12);

  tiles.mock.verify();
});

test('forEachTile default position', function() {
  tiles.mock.expects('query').once().withArgs(0, 0, 10, 10);

  var region = ActiveBackgroundRegion(10, 10, tiles);
  region.forEachTile(callback);

  tiles.mock.verify();
});

test('forEachTile + setPosition', function() {
  tiles.mock.expects('query').once().withArgs(15, 15, 10, 10);

  var region = ActiveBackgroundRegion(10, 10, tiles);
  region.setPosition(15, 15);
  region.forEachTile(callback);

  tiles.mock.verify();
});

test('forEachTile + resize', function() {
  tiles.mock.expects('query').once().withArgs(0, 0, 5, 5, callback);

  var region = ActiveBackgroundRegion(10, 10, tiles);
  region.resize(5, 5);
  region.forEachTile(callback);

  tiles.mock.verify();
});

test('resize', function() {
  tiles.mock.expects('prefetch').once().withArgs(0, 0, 5, 5);

  var region = ActiveBackgroundRegion(10, 10, tiles);
  region.resize(5, 5);

  tiles.mock.verify();
});
