'use strict';

var Player = require('src/world/plugins/Player');
var PluginTestHelper = require('test/utils/PluginTestHelper');

var helper, obj;

setup(function() {
  obj = {x: 1, y: 2, w: 3, h: 4};
  helper = PluginTestHelper(Player);
});


test('load player listener', function() {
  helper.expectLoadEventListener('player');
  helper.verify();
});

test('adds player to world', function() {
  helper.expectAddedToWorld(obj)
    .once()
    .withArgs(1, 2, 3, 4);

  helper.load('player', obj);
  helper.verify();
});
