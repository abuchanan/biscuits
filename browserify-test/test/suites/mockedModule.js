var ctrl, callCount;

setup(function() {
  callCount = 0;

  // TODO it's easy to mess this up because it's easy to forget the "exports"
  //      layer
  require('../src/ctrlDep', {
    exports: {
      use: function() {
        callCount += 1;
      }
    }
  });

  ctrl = require('../src/ctrl');
});

test('mocked module', function() {
  ctrl.useDep();
  ctrl.useDep();
  assert.equal(callCount, 2);
});
