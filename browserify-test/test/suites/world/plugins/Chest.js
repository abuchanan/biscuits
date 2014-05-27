// TODO do I really need to put these everywhere? Wouldn't jslint be enough?
'use strict';

var Chest = require('src/world/plugins/Chest');
var PluginTestHelper = require('test/utils/PluginTestHelper');

var helper, obj;

setup(function() {
  obj = {x: 1, y: 2, w: 3, h: 4};
  helper = PluginTestHelper(Chest);
});


test('load chest listener', function() {
  helper.expectLoadEventListener('chest');
  helper.verify();
});

test('adds chest to world', function() {
  helper.expectAddedToWorld(obj)
    .once()
    .withArgs(1, 2, 3, 4);

  helper.load('chest', obj);
  helper.verify();
});

test('pickup chest, default value is 1', function() {
  // TODO ugh, it's still tricky to get this whole process correct.
  helper.expectAddedToWorld(obj);
  helper.load('chest', obj);
  helper.playerUse();
  helper.verify();
  assert.equal(helper.player.coins, 1);
});

test('pickup chest, use coinValue attribute', function() {
  obj.coinValue = 10;

  helper.expectAddedToWorld(obj);
  helper.load('chest', obj);
  helper.playerUse();
  helper.verify();
  assert.equal(helper.player.coins, 10);
});
