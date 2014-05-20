function createContext(stubs) {

  /**
   * create a new map which will override the path to a given dependencies
   * so if we have a module in m1, requiresjs will look now unter   
   * stub_m1
   **/
  var map = {};

  _.each(stubs, function (value, key) {
    var stubname = 'stub_' + key;
    map[key] = stubname;
  });

  /**
   * create a new context with the new dependency paths
   **/
  var context =  require.config({
    context: Math.floor(Math.random() * 1000000),
    map: {
      "*": map
    }
  });

  /**
   * create new definitions that will return our passed stubs or mocks
   **/
  _.each(stubs, function (value, key) {
    var stubname = 'stub_' + key;

    define(stubname, function () {
      return value;
    });
  });

  return context;

}

define('m1', ['app'], function (app) {
  app.start('test');
});

(function () {
  //create stubs
  var stubs = {
    app: {start: jasmine.createSpy()}
  };
  //get context
  var context = createContext(stubs);
  //start test in the context
  context(['m1'], function (m1) {

    describe("m1", function () {

      it("start the app with the string 'test'", function () {
        expect(stubs.app.start).toHaveBeenCalledWith('test');
      });

    });
  });
})();
