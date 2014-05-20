define(['EventEmitter', 'injector'], function(EventEmitter, injector) {

  var WorldLoaderMock = {
    events: {
      addListener: sinon.spy(),
    }
    //new EventEmitter(),
  };

  injector.mock('WorldLoader', WorldLoaderMock);

  suite('world/plugins/portal', function() {

    var Portal;

    // TODO ugh. ugly. also, it's easy to accidentally put setup()
    //      outside of suite and have it run for _everything_.
    setup(function(done) {
      injector.require(['world/plugins/portal'], function(_Portal) {
        Portal = _Portal;
        done();
      });
    });

    test('registers listener', function() {
      assert(WorldLoaderMock.events.addListener.calledOnce);
    });
  });
});
