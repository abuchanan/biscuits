var Portal = require('src/world/plugins/Portal');
var PluginTestHelper = require('test/utils/PluginTestHelper');

var obj, helper;

setup(function() {
  obj = {x: 1, y: 2, w: 3, h: 4};
  helper = PluginTestHelper(Portal);
});


test('load portal listener', function() {
  helper.expectLoadEventListener('portal');
  helper.verify();
});

test('add portal to world', function() {
  helper.expectAddedToWorld(obj)
    .once()
    .withArgs(1, 2, 3, 4);

  helper.load('portal', obj);
  helper.verify();
});

test('player collision, scene load', function() {
  obj.portalDestination = 'dest-foo';

  helper.scene.mock.expects('load').once().withArgs('dest-foo');
  helper.expectAddedToWorld(obj);
  helper.load('portal', obj);
  helper.playerCollision();
  helper.verify();
});
