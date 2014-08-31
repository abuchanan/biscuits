import {Injector, Provide} from 'di';
import {Scene, SceneObject, SceneLoader} from 'src/scene';
import {Renderer, RendererConfig} from 'src/render';
import {ObjectScope, SceneScope} from 'src/scope';
import {Loader} from 'src/utils';
import {HUD} from 'src/hud';
import {BackgroundRenderer, BackgroundGrid} from 'src/background';
import {WorldConfig, BodyConfig, Body} from 'src/world';
import {MapLoader} from 'src/maploader';
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
class MapConfig {};
class Map {};


var Types = {};

// TODO if a requested type is undefined, the error message (from di.js?) is
//      difficult to interpret


@SceneScope
@Provide(WorldConfig)
function provideWorldConfig(map: Map) {
  console.log('provide world config');
  var w = map.mapData.width * map.mapData.tilewidth;
  var h = map.mapData.height * map.mapData.tileheight;
  // TODO using "new"?
  return new WorldConfig(0, 0, w, h);
}

@SceneScope
@Provide(Map)
function provideMap(loadpoint: Loadpoint, mapLoader: MapLoader) {
  return mapLoader.load(loadpoint.mapID);
}

function setupRendererConfig(biscuitsConfig: BiscuitsConfig,
                             rendererConfig: RendererConfig) {

  rendererConfig.container = biscuitsConfig.container;
  // TODO extend, not overwrite
  rendererConfig.layers = ['background', 'objects', 'player', 'hud'];
}

@SceneScope
@Provide(BackgroundGrid)
function provideBackgroundGrid(map: Map) {
  var grid = [];

  map.tilelayers.forEach((layer) => {
    layer.forEach((sprite) => {
      grid.push(sprite);
    });
  });

  return grid;
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


@SceneScope
function loadObjects(injector: Injector, configs: ObjectConfigs) {

  for (var config of configs) {

    for (var loader of config.loaders) {

      var bodyConfig = new BodyConfig(config.x, config.y, config.w, config.h,
                                      config.isBlock || false);

      loader = loader
        .hasScope(ObjectScope)
        .binds(BodyConfig, bodyConfig, ObjectScope)
        .binds(ObjectConfig, config, ObjectScope)
        .runs(addToScene);

      injector.get(loader.Injector);
    }
  }
}

@ObjectScope
function addToScene(object: SceneObject, scene: Scene) {
  scene.addObject(object);
}


@SceneScope
function triggerLoadedEvent(scene: Scene) {
  scene.events.trigger('loaded');
}

var WorldSceneLoader = new Loader()
  .provides([
    // TODO move these to setupFoo like I did for renderer config
    provideWorldConfig,
    provideMap,
    provideBackgroundGrid,
    provideObjectConfigs,
  ])
  .runs([
    setupRendererConfig,
    loadObjects,
    HUD,
    BackgroundRenderer,
    triggerLoadedEvent
  ]);

// TODO test that render layers are removed from renderer when scene is unloaded
// TODO maybe renderer should be scene scoped? object scoped?
