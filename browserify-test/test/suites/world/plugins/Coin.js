// TODO do I really need to put these everywhere? Wouldn't jslint be enough?
'use strict';

var Coin = require('src/world/plugins/Coin');
var PluginTestHelper = require('test/utils/PluginTestHelper');

var helper, obj;

setup(function() {
  obj = {x: 1, y: 2, w: 3, h: 4};
  helper = PluginTestHelper(Coin);
});


test('load coin listener', function() {
  helper.expectLoadEventListener('coin');
  helper.verify();
});

test('adds coin to world', function() {
  helper.expectAddedToWorld(obj)
    .once()
    .withArgs(1, 2, 3, 4);

  helper.load('coin', obj);
  helper.verify();
});

test('pickup coin, default value is 1', function() {
  helper.worldObj.mock
    .expects('remove')
    .once();

  // TODO ugh, it's still tricky to get this whole process correct.
  helper.expectAddedToWorld(obj);
  helper.load('coin', obj);
  helper.playerCollision();
  helper.verify();
  assert.equal(helper.player.coins, 1);
});

test('pickup coin, use coinValue attribute', function() {
  obj.coinValue = 10;

  helper.worldObj.mock
    .expects('remove')
    .once();

  helper.expectAddedToWorld(obj);
  helper.load('coin', obj);
  helper.playerCollision();
  helper.verify();
  assert.equal(helper.player.coins, 10);
});
