define(['ActiveBackgroundRegion'], function(ActiveBackgroundRegion) {
  suite('ActiveBackgroundRegion', function() {

    var region, tilesMock, callback;

    setup(function() {
      callback = sinon.spy();
      tilesMock = {
        prefetch: sinon.spy(),
        query: sinon.spy(),
      };
      region = ActiveBackgroundRegion(10, 10, tilesMock);
    });


    /* It does not prefetch any tiles upon init. */
    test('init', function() {
      assert(tilesMock.prefetch.notCalled);
      assert(tilesMock.query.notCalled);
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
});
