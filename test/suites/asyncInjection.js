define('Bar', ['Foo'], function(Foo) {
  return {
    getFoo: function() {
      return Foo.value;
    }
  };
});


/*
  Basically testing that injector.require is async, and demonstrating
  how to write a test using it.
*/
define(['injector'], function(injector) {

  // Define a module "Bar" that depends on "Foo" which will be mocked
  // in the test below.
  injector.mock('Bar', ['

  // TODO tests shouldn't have to manually clear the injector every time
  // We have some module we want to mock for testing...
  injector.mock('Foo', {value: 'foo'});

  suite('asyncInjector', function() {

    // Here we require the "Bar" module, which depends on "Foo",
    // which we have mocked.
    var Bar;

    // TODO using a promise would be a much nicer way
    setup(function(done) {
      injector.require(['Bar'], function(_Bar) {
        Bar = _Bar;
        // Module loading is asynchronous, which is unfortunately
        // easy to get tripped up on. If you don't use done(), the
        // test will run before the module has loaded.
        done();
      });
    });

    test('Bar', function() {
      assert.equal(Bar.getFoo(), 'foo');
    });

  });
});
