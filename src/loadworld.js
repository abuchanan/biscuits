'use strict';

// TODO consistent captalization scheme
define(['renderer', 'scenes', 'MapLoader', 'World',
        'Background', 'Player', 'HUD', 'Useable', 'Coins', 'Chests',
        'Squirrels'],
  function(renderer, scenes, MapLoader, World) {


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

  return function() {
    if (!called) {
      value = func.apply({}, arguments);
    }
    return value;
  }
}

function sceneLoader(mapfile) {
  // TODO
  var scale = 16;

  // TODO ok, getting better, but how do multiple loadpoints in one map
  //      share the same world data?
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
    // TODO create world on every load? or only on the first?
    // TODO this would reset every NPC's position and state on every load
    //      e.g. if you went into a house and then out really quick,
    //      everything would reset
    //      BUT, on the flipside, when want to destroy some worlds, e.g.
    //      you go from one map to another in a very linear path, and are
    //      very unlikely to return to the previous maps. something needs
    //      to manage destroying those resources.
    var world = World(size, size);

    // TODO should player w/h be dynamic?
    //      at least 32 should no be hard-coded
    // TODO should be a singleton? but it's specific to the world data structure
    //      of every world
    var player = Player(world, 32 / scale, 32 / scale, container);

    // TODO HUD is duplicated for every scene? seems inefficient
    HUD(player, hudLayer);
    Useable(player, world);

    var backgroundTilesDef = BackgroundTilesDef('test-scene', 256, 256);
    var backgroundTiles = BackgroundTiles(backgroundTilesDef);
    // TODO hardcoded 640
    var backgroundRegion = BackgroundRegion(640, 640, backgroundTiles);
    BackgroundRenderer(backgroundRegion, backgroundLayer);

    player.addListener('position change', function() {
      var pos = player.getDiscretePosition();
      backgroundRegion.setPosition(Math.floor(pos.x * scale) - 320,
                                   Math.floor(pos.y * scale) - 320);
    });

    container.addListener('renderFrame', function() {
      var pos = player.getContinuousPosition();
      // TODO hardcoded dimensions
      worldViewLayer.x = 320 - Math.floor(pos.x * scale);
      worldViewLayer.y = 320 - Math.floor(pos.y * scale);
    });

    map.forEachObject(function(object, layerIdx) {
      // TODO split multiple types on comma
      var handler = handlers[obj.type];
      if (handler) {
        handler(obj, world, objectLayer, player);
      }
    });

    // TODO possibly i could make this implicit using some tricks with
    //      the dependency injection system
    var services = ServiceSet([
      container,
      Chests,
      Coins,
      Squirrels,
      HUD,
    ]);

    return {
      load: function(loadpoint) {
        return services.start().then(function() {
          player.setDirection(loadpoint.playerDirection);
          player.setPosition(loadpoint.x, loadpoint.y);
        });
      },
      unload: function() {
        return services.stop();
      },
    };
  }

  var getScene = Q.fbind(function(loadpoint) {
    // TODO maploader can keep a cached copy of the map if needed
    var map = MapLoader.loadMap(mapfile, scale);
    var serviceSet = map.then(initialize);
    return serviceSet;
  });
  getScene = lazy(getScene);

  return {
    load: function(loadpoint) {
      var scene = getScene();
      return scene.load(loadpoint);
    },
    unload: function() {
      var scene = getScene();
      return scene.unload();
    },
  };
}

function ServiceSet(services) {
  return {
    start: function() {
      var promises = [];

      for (var i = 0; i < services.length; i++) {
        var started = Q(services[i].start());
        promises.push(started);
      }
      return Q.all(promises);
    },

    // TODO what if stop is called before start finishes?!
    //      and vice versa
    // TODO what if stop is called but start was never called?
    stop: function() {
      var promises = [];
      for (var i = 0; i < services.length; i++) {
        var stopped = Q(services[i].stop());
        promises.push(stopped);
      }
      return Q.all(promises);
    },
  };
}
