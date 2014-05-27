var EventEmitter = require('../../../../lib/EventEmitter');

var Block = require('src/world/plugins/Block');
var PluginTestHelper = require('test/utils/PluginTestHelper');

var helper, obj;

setup(function() {
  obj = {x: 1, y: 2, w: 3, h: 4};
  helper = PluginTestHelper(Block);
});

test('load block listener', function() {
  helper.expectLoadEventListener('block');
  helper.verify();
});

test('adds block to world with isBlock = true', function() {
  helper.expectAddedToWorld(obj)
    .once()
    .withArgs(1, 2, 3, 4);

  helper.load('block', obj);
  helper.verify();
  assert.equal(helper.worldObj.isBlock, true);
});
