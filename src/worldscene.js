import {Injector, Provide} from 'di';
import {Scene, SceneObject, SceneLoader} from 'src/scene';
import {Renderer, RendererConfig} from 'src/render';
import {ObjectScope, SceneScope} from 'src/scope';
import {Loader} from 'src/utils';
import {HUD} from 'src/hud';
import {BackgroundRenderer, BackgroundGrid} from 'src/background';
import {WorldConfig, BodyConfig, Body} from 'src/world';
import {MapConfig, Map, MapLoader} from 'src/maploader';
import {BiscuitsConfig, ObjectConfig} from 'src/config';

// TODO this is a great example of a problem with both ES6 and di.js
//      This import was undefined. Some code below has a dependency on Loadpoint
//      so it was depending on a token of "undefined". di.js can easily catch that.
//
//      but, javascript should error when a token can't be imported. this might
//      be related to require.js
//import {Loadpoint} from 'src/scenemanager';

import {Loadpoint} from 'src/loadpoints';


export {
  WorldSceneLoader,
  Types,
};

class ObjectConfigs {};


var Types = {};

// TODO if a requested type is undefined, the error message (from di.js?) is
//      difficult to interpret

class WorldMap {}

@SceneScope
@Provide(WorldConfig)
function provideWorldConfig(map: WorldMap) {
  console.log('provide world config');
  var w = map.mapData.width * map.mapData.tilewidth;
  var h = map.mapData.height * map.mapData.tileheight;
  // TODO using "new"?
  return new WorldConfig(0, 0, w, h);
}

@SceneScope
@Provide(WorldMap)
function provideWorldMap(loadpoint: Loadpoint, mapLoader: MapLoader) {
  return mapLoader.load(loadpoint.mapID);
}

function setupRendererConfig(biscuitsConfig: BiscuitsConfig,
                             rendererConfig: RendererConfig) {

  rendererConfig.container = biscuitsConfig.container;
  Array.prototype.push.apply(rendererConfig.layers, [
    'background',
    'objects',
    'player',
    'hud'
  ]);
}


@SceneScope
@Provide(ObjectConfigs)
function provideObjectConfigs(map: Map) {
  var configs = [];

  // TODO have a compile-time checker that ensures every object
  //      in a large map can be loaded properly
  // TODO replace forEach() with for..of
  map.objectlayers.forEach((layer) => {
    layer.forEach((config) => {

      var types = config.type.split(/[, ]+/);
      config.loaders = [];

      types.forEach((type) => {
        var loader = Types[type];

        // TODO maybe don't crash when an object is unrecognized
        //      just log a warning and skip it.
        if (!loader) {
          throw 'Unknown object type: ' + type;
        }

        config.loaders.push(loader);
      });

      configs.push(config);
    });
  });

  // TODO handle error when no player type is registered
  configs.push({
    ID: 'player',
    loaders: [Types['player']],
  });

  return configs;
}


class RegionScope {}

@RegionScope
function loadObjects(injector: Injector, configs: ObjectConfigs) {

  for (var config of configs) {

    for (var loader of config.loaders) {

      var bodyConfig = new BodyConfig(config.x, config.y, config.w, config.h,
                                      config.isBlock || false);

      loader = loader
        .hasScope(ObjectScope)
        .binds(BodyConfig, bodyConfig, ObjectScope)
        .binds(ObjectConfig, config, ObjectScope);

      injector.get(loader.Injector);
    }
  }
}


@RegionScope
@Provide(Renderer)
class RegionRenderer {
}


@SceneScope
function loadRegions(map: WorldMap) {

  console.log(map);
  // TODO index all background and objects

  function getItemsInRegion(region) {
    var items = [];

    function inRegion(item) {
      var iw = item.w || item.width;
      var ih = item.h || item.height;
      var ix1 = item.x;
      var iy1 = item.y;
      var ix2 = ix1 + iw;
      var iy2 = iy1 + ih;

      var rw = region.w;
      var rh = region.h;
      var rx1 = region.x;
      var ry1 = region.y;
      var rx2 = rx1 + rw;
      var ry2 = ry1 + rh;

      return ix2 >= rx1 && ix1 <= rx2 && iy2 >= ry1 && iy1 <= ry2;
    }

    map.objectlayers.forEach(function(layer) {
      layer.forEach(function(object) {
        if (object.type != 'region') {
          items.push(object);
        }
      });
    });

    map.tilelayers.forEach(function(layer) {
      layer.forEach(function(tile) {
        if (inRegion(tile)) {
          items.push(tile);
        }
      });
    });

    return items;
  }

  map.objectlayers.forEach(function(layer) {
    layer.forEach(function(object) {
      if (object.type == 'region') {

        var regionObjects = getItemsInRegion(object);
      }
    });
  });
}


@SceneScope
function triggerLoadedEvent(scene: Scene) {
  scene.events.trigger('loaded');
}


var WorldSceneLoader = new Loader()
  .provides([
    // TODO move these to setupFoo like I did for renderer config
    provideWorldConfig,
    provideWorldMap,
    provideObjectConfigs
  ])
  .runs([
    setupRendererConfig,
    loadRegions,
    //HUD,
    //triggerLoadedEvent
  ]);

// TODO test that render layers are removed from renderer when scene is unloaded
// TODO maybe renderer should be scene scoped? object scoped?
