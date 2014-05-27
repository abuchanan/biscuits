'use strict';

var WorldObjectMock = require('test/mocks/WorldObject');
var LoaderMock = require('test/mocks/WorldLoader');
var SceneMock = require('test/mocks/SceneMock');
var PlayerMock = require('test/mocks/PlayerMock');


module.exports = function(pluginModule) {

  var loader = LoaderMock();
  var scene = SceneMock();
  var world = scene.world;
  var worldObj = WorldObjectMock();
  var player = PlayerMock();

  var actions = [];

  actions.push(function() {
    pluginModule.registerWorldLoaderPlugin(loader);
  });

  var API = {
    loader: loader,
    scene: scene,
    worldObj: worldObj,
    player: player,
  };

  API.expectLoadEventListener = function(typeName) {
    loader.events.mock
      .expects('addListener')
      .once()
      .withArgs('load ' + typeName);
  };

  API.expectAddedToWorld = function() {
    return world.mock.expects('add').returns(worldObj);
  };

  API.load = function(typeName, obj) {
    actions.push(function() {
      loader.events.trigger('load ' + typeName, [obj, scene]);
    });
  };
  
  API.playerCollision = function() {
    actions.push(function() {
      worldObj.events.trigger('player collision', [player]);
    });
  };

  API.playerUse = function() {
    actions.push(function() {
      worldObj.events.trigger('use', [player]);
    });
  };

  API.verify = function() {
    actions.forEach(function(func) { func(); });
    loader.events.mock.verify();
    world.mock.verify();
    worldObj.mock.verify();
  };

  return API;
};
