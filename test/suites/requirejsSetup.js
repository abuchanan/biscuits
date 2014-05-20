define(['test/suites/fakeapp'], function(fakeapp) {

  suite('RequireJS Setup', function() {
    test('requirejs test works', function() {
      assert(true);
      assert.equal(fakeapp.name, 'fakeapp');
    });
  });

});
