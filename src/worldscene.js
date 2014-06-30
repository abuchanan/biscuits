import {Injector, Provide} from 'di';
import {Scene, SceneObject, SceneLoader} from 'src/scene';
import {Renderer, RendererConfig} from 'src/render';
import {ObjectScope, SceneScope} from 'src/scope';
import {valueProvider, loader, provideBodyConfig} from 'src/utils';
import {HUD} from 'src/hud';
import {BackgroundRenderer, BackgroundGrid} from 'src/background';
import {WorldConfig, BodyConfig, Body} from 'src/world';
import {loadMapSync} from 'src/maploader';
import {BiscuitsConfig, ObjectConfig} from 'src/config';

// TODO this is a great example of a problem with both ES6 and di.js
//      This import was undefined. Some code below has a dependency on Loadpoint
//      so it was depending on a token of "undefined". di.js can easily catch that.
//
//      but, javascript should error when a token can't be imported. this might
//      be related to require.js
//import {Loadpoint} from 'src/scenemanager';
import {Loadpoint} from 'src/loadpoints';

import {PlayerBody, PlayerDriver, PlayerRenderer, PlayerUseAction, CoinPurse} from 'src/plugins/Player';
import {ChestLoader} from 'src/plugins/Chest';
import {CoinLoader} from 'src/plugins/Coin';

import {SquirrelBody, SquirrelDriver, SquirrelRenderer} from 'src/plugins/squirrel';


class ObjectConfigs {};
class MapConfig {};
class Map {};


var SquirrelLoader = loader()
  .provides(provideBodyConfig, SquirrelBody)
  .dependsOn(SquirrelBody, SquirrelDriver, SquirrelRenderer);


// TODO don't hard code player position and dimensions
var PlayerLoader = loader()
  .provides(
    valueProvider(BodyConfig, new BodyConfig(256, 64, 32, 32)),
    PlayerBody
  )
  .dependsOn(
    PlayerBody,
    PlayerDriver,
    PlayerRenderer,
    CoinPurse,
    PlayerUseAction
  );

// TODO if a requested type is undefined, the error message (from di.js?) is
//      difficult to interpret

var WallLoader = loader([provideBodyConfig], [Body]);


@SceneScope
@Provide(WorldConfig)
function provideWorldConfig(map: Map) {
  var w = map.mapData.width * map.mapData.tilewidth;
  var h = map.mapData.height * map.mapData.tileheight;
  // TODO using "new"?
  return new WorldConfig(0, 0, w, h);
}

@SceneScope
@Provide(Map)
function provideMap(mapConfig: MapConfig) {
  // TODO integrate this with loadMapSync better
  //      in the future it will have pluggable loaders that can recognize different
  //      file types/paths
  var path = `maps/${mapConfig.mapID}.json`;
  return loadMapSync(path);
}

// TODO needed? loadpoint covers this.
@SceneScope
@Provide(MapConfig)
function provideMapConfig(loadpoint: Loadpoint) {
  return {mapID: loadpoint.mapID};
}

@SceneScope
@Provide(RendererConfig)
function provideRendererConfig(biscuitsConfig: BiscuitsConfig) {
  return {
    container: biscuitsConfig.container,
    layers: ['background', 'objects', 'player', 'hud'],
  }
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

var typeLoaderMap = {
  'squirrel': SquirrelLoader,
  'coin': CoinLoader,
  'chest': ChestLoader,
  'wall': WallLoader
};


@SceneScope
@Provide(ObjectConfigs)
function provideObjectConfigs(map: Map) {
  var configs = [];

  map.objectlayers.forEach((layer) => {
    layer.forEach((config) => {
      // TODO error handling for unknown type
      config.loader = typeLoaderMap[config.type];
      configs.push(config);
    });
  });

  return configs;
}


@SceneScope
function loadScene(sceneInjector: Injector, scene: Scene, objectConfigs: ObjectConfigs) {
  objectConfigs.forEach((objectConfig) => {

    var loader = sceneInjector.get(objectConfig.loader);
    var provideObjectConfig = valueProvider(ObjectConfig, objectConfig);
    loader.providers.push(provideObjectConfig);

    var objectInjector = sceneInjector.createChild(loader.providers, [ObjectScope]);

    // TODO the error message from this probably sucks. how to improve?
    //      that is, if dep is undefined.
    loader.deps.forEach((dep) => {
      try {
        objectInjector.get(dep);
      } catch (e) {
        console.log(dep);
        throw e;
      }
    });

    var obj = objectInjector.get(SceneObject);
    // TODO don't want "ID || name". just ID
    // TODO object loaders should add themselves to scene?
    scene.addObject(objectConfig.ID || objectConfig.name, obj);

  });

  // TODO
  var playerLoader = sceneInjector.get(PlayerLoader);
  var objectInjector = sceneInjector.createChild(playerLoader.providers, [ObjectScope]);
  playerLoader.deps.forEach((dep) => {
    objectInjector.get(dep);
  });
  var playerObj = objectInjector.get(SceneObject);
  scene.addObject('player', playerObj);
}

var WorldSceneLoader = loader()
  .provides(
    provideWorldConfig,
    provideMapConfig,
    provideRendererConfig,
    provideMap,
    provideBackgroundGrid,
    provideObjectConfigs
  )
  .dependsOn(
    loadScene,
    HUD,
    BackgroundRenderer
  );

// TODO this is at the bottom only in this file?
export {WorldSceneLoader};

// TODO test that render layers are removed from renderer when scene is unloaded
// TODO maybe renderer should be scene scoped? object scoped?
