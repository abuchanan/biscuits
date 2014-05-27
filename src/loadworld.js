'use strict';

function createLoadpoint(name, x, y, playerDirection) {
  playerDirection = obj.playerDirection || 'down';

  return {
    name: name,
    x: x,
    y: y,
    playerDirection: playerDirection,
  };
}

// TODO loadpoints are a special case. we need to preprocess all maps
//      so we can get a concise list of loadpoints and map them to
//      load functions
// TODO get a mapping of loadpoint names to a unique set of scene loaders
for (var i = 0; i < loadpoints.length; i++) {
  var loadpoint = loadpoints[i];
  scenes.addScene(loadpoint.name, loaders[loadpoint.name]);
}

function lazy(func) {
  var called = false;
  var value;

  var func = function() {
    if (!called) {
      value = func.apply({}, arguments);
    }
    return value;
  }

  func.clear = function() {
    called = false;
    value = undefined;
  };
  return func;
}

function sceneLoader(mapfile) {
  // TODO
  // TODO maybe ScaledWorld() would be useful
  var scale = 16;

  function initialize(map) {
    var container = renderer.newLayer();
    var worldViewLayer = container.newLayer();
    var backgroundLayer = worldViewLayer.newLayer();
    // TODO maybe loadpoint from Tiled should determine layer?
    var objectLayer = worldViewLayer.newLayer();
    var playerLayer = worldViewLayer.newLayer();
    var hudLayer = container.newLayer();

    objectLayer.scale.x = scale;
    objectLayer.scale.y = scale;
    playerLayer.scale.x = scale;
    playerLayer.scale.y = scale;

    // TODO
    var size = 32 / scale * map.mapData.width;
    // TODO should world be a singleton?
    var world = World(size, size);

    // TODO should player w/h be dynamic?
    //      at least 32 should not be hard-coded
    // TODO should be a singleton?
    var player = Player(world, 32 / scale, 32 / scale, container);

    // TODO HUD is duplicated for every scene? seems inefficient
    //      good because it allows scene specific hud elements, such as
    //      world mini map?
    // TODO these calls probably aren't right
    var hud = HUD(player, hudLayer);
    var useable = Useable(player, world);

    // TODO move to map loader
    //var backgroundTilesDef = BackgroundTilesDef('test-scene', 256, 256);
    //var backgroundTiles = BackgroundTiles(map.backgroundTiles);

    var background = BackgroundRenderer(map.backgroundTiles, backgroundLayer);
    background.region.setAnchor(0.5, 0.5);

    // TODO make player pass this data (x, y) with event
    player.addListener('position change', function(x, y) {
      // TODO scale is always hindering things
      background.region.setPosition(pos.x * scale, pos.y * scale);
    });

    container.addListener('renderFrame', function() {
      var pos = player.getContinuousPosition();
      // TODO hardcoded dimensions. give layers a setAnchor or something
      // TODO why is it 320 *minus* the position? shouldn't it be the
      //      position minus 320?
      worldViewLayer.x = 320 - Math.floor(pos.x * scale);
      worldViewLayer.y = 320 - Math.floor(pos.y * scale);
    });

    scene.add(container, hud, player, world);

    map.forEachObject(function(object, layerIdx) {
      // TODO implement forEachType
      object.forEachType(function(type) {
        loader.events.trigger('load ' + type, [object, scene]);
      });
    });

    return {
      // This is async. Returns a promise
      load: function(loadpoint) {
        return services.start().then(function() {
          player.setDirection(loadpoint.playerDirection);
          player.setPosition(loadpoint.x, loadpoint.y);
        });
      },

      // This is async. Returns a promise
      unload: function() {
        return services.stop();
      },

      // TODO async?
      // TODO what manages calling destroy?
      destroy: function() {
        return services.stop().then(function() {
          renderer.removeChild(container);
        });
      },
    };
  }

  var getScene = Q.fbind(function(loadpoint) {
    // TODO maploader can keep a cached copy of the map if needed
    var map = MapLoader.loadMap(mapfile, scale);
    var serviceSet = map.then(initialize);
    return serviceSet;
  });

  // TODO some sort of scene cache might be more clear
  getScene = lazy(getScene);

  return {
    load: function(loadpoint) {
      var scene = getScene();
      return scene.load(loadpoint);
    },
    unload: function() {
      // TODO if load hasn't been called, this will load the scene just to
      //      unload it
      var scene = getScene();
      return scene.unload();
    },
    destroy: function() {
      // TODO this is very incomplete
      //      the renderer container needs to be destroyed
      //      this.unload() should be called first
      scene.destroy();
      getScene.clear();
    },
  };
}
