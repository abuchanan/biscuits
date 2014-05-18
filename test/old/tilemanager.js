suite('TileManager', function() {

/*
  Simply testing that TileManager exists and can be created without error.
*/
test('basic create', function() {
  TileManager(10, 10, 10, function() {});
});

/*
  TODO describe difference in units between tile, grid, and buffer.

  TileManager basically tracks a point (the player) in a grid of tiles.
  It's given:
  * the tile size (assumed to be square, currently),
  * the dimensions of the grid (width and height), 
  * the buffer dimensions
  * a "loadTile" callback function, which is used to load new tiles.

  When TileManager.setPosition() is called (i.e. when the player moves),
  TileManager checks whether that position is near the edge of the grid.
  If it is near the edge of the grid, the loadTile callback is invoked
  with the positions of the new tiles that need to be loaded.

  In order to be useful, the tiles needed to be loaded *before* the player
  reaches the end of the grid. So, we need a buffer, i.e. a distance that
  describes just exactly how far the player is to the "edge of the grid".

  For example, the player walks near the edge of the grid of visible
  background tiles, and tile manager triggers a callback that loads
  new background tiles to be rendered.
*/
test('general functionality', function() {
  var loader = sinon.spy();
  // So, we're creating a grid of square tiles, each tile is 10 x 10,
  // and the grid is 3 x 3. The buffer is 5 units from each edge.
  // The "loadTile" callback is loader.
  var manager = TileManager(10, 3, 3, 5, 5, loader);

  // We have to initialize the manager by calling setPosition.
  // TODO test that init within the buffer load appropriately
  //      OR player should be in initialized in the center of the grid
  //      OR what if the player isn't really in the middle of the grid?
  manager.setPosition(0, 0);

  assert(loader.called, 'init calls loader');
  // Loader was called during initialization once for each of the tiles
  // in the 3 x 3 grid, so 9 times
  assert.equal(loader.callCount, 9, 'init loads tiles for whole grid')

  loader.reset();

  // If the player moves around within the loaded grid without touching
  // the buffer, no extra tiles are loaded.
  manager.setPosition(7, 7);
  assert(loader.notCalled, 'loader not called when player moves within grid');

  // TODO should be hitting buffer
  manager.setPosition(24, 0);
  assert(loader.notCalled);

  // Now the player enters the buffer, so new tiles are loaded.
  // 3 tiles are loaded because we crossed the east edge of the grid.
  // TODO actually this should load both buffers
  manager.setPosition(25, 0);
  assert.equal(loader.callCount, 6);
  assert(loader.calledWith(3, 0));
  assert(loader.calledWith(3, 1));
  assert(loader.calledWith(3, 2));

  loader.reset();

  // Now we test every edge of the buffer
  manager.setPosition(0, 25);
  assert.equal(loader.callCount, 3);
  assert(loader.calledWith(0, 3));
  assert(loader.calledWith(1, 3));
  assert(loader.calledWith(2, 3));

  loader.reset();

  manager.setPosition(0, 4);
  /*
  assert.equal(loader.callCount, 3);
  assert(loader.calledWith(0, -1));
  assert(loader.calledWith(1, -1));
  assert(loader.calledWith(2, -1));
  */
});


/*
  Currently, a TileManager instance must be initialized by calling setPosition.
  That might be improved in the future.
*/
test('init', function() {
  var loader = sinon.spy();
  var manager = TileManager(10, 3, 3, loader);
  assert(loader.notCalled);
});

});
