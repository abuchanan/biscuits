var mod;

setup(function() {
  mod = require('../src/testResetMod');
});

// TODO module cache should reset after each test?
test('module cache is reset for each test', function() {
  mod.count += 1;
  assert.equal(mod.count, 1);
});

test('module cache is reset for each test 2', function() {
  mod.count += 1;
  assert.equal(mod.count, 1);
});
