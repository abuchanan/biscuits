import {Injector, Provide, TransientScope} from 'di';
import {WorldConfig} from 'src/world';
import {Scene, SceneObject, SceneLoader} from 'src/scene';
import {Renderer} from 'src/render';
import {ObjectScope, SceneScope} from 'src/scope';
import {valueProvider} from 'src/utils';
import {loadMapSync} from 'src/maploader';
import {HUD} from 'src/hud';
import {BackgroundRenderer, BackgroundGrid} from 'src/background';
import {WorldConfig, BodyConfig, Body} from 'src/world';

import {PlayerBody, PlayerDriver, PlayerRenderer, PlayerUseAction, CoinPurse} from 'src/plugins/Player';
import {CoinConfig, CoinRenderer, CoinCollision} from 'src/plugins/Coin';
import {ChestConfig, ChestRenderer, ChestUseable} from 'src/plugins/Chest';
import {SquirrelBody, SquirrelDriver, SquirrelRenderer} from 'src/plugins/squirrel';

export {WorldScene};


class ObjectDef {};
class MapDef {};

class PlayerLoader {
  
  constructor() {
    this.providers = [PlayerBody];
    this.deps = [PlayerBody, PlayerDriver, PlayerRenderer, CoinPurse, PlayerUseAction];
  }

  // TODO ugh....I have to scope all these...
  @TransientScope
  config(injector: Injector, def: ObjectDef, bodyConfig: BodyConfig) {
    bodyConfig.x = 256;
    bodyConfig.y = 64;
    bodyConfig.w = 32;
    bodyConfig.h = 32;
  }
}

class WallLoader {
  constructor() {
    this.providers = [];
    this.deps = [Body];
  }

  // TODO if one of these types is undefined, the error message (from di.js?) is
  //      difficult to interpret
  @TransientScope
  config(def: ObjectDef, bodyConfig: BodyConfig) {
    // TODO very frequent pattern, helper? 
    bodyConfig.x = def.x;
    bodyConfig.y = def.y;
    bodyConfig.w = def.w;
    bodyConfig.h = def.h;
  }
}

class CoinLoader {
  constructor() {
    this.providers = [];
    this.deps = [Body, CoinRenderer, CoinCollision];
  }

  @TransientScope
  config(def: ObjectDef, bodyConfig: BodyConfig, coinConfig: CoinConfig) {
    bodyConfig.x = def.x;
    bodyConfig.y = def.y;
    bodyConfig.w = def.w;
    bodyConfig.h = def.h;
    coinConfig.value = def.coinValue;
  }
}

class ChestLoader {
  constructor() {
    this.providers = [];
    this.deps = [Body, ChestRenderer, ChestUseable];
  }

  @TransientScope
  config(def: ObjectDef, bodyConfig: BodyConfig, chestConfig: ChestConfig) {
    bodyConfig.x = def.x;
    bodyConfig.y = def.y;
    bodyConfig.w = def.w;
    bodyConfig.h = def.h;
    bodyConfig.isBlock = true;
    chestConfig.value = def.chestValue;
    // TODO ChestBody?
  }
}

class SquirrelLoader {
  
  constructor() {
    this.providers = [SquirrelBody];
    this.deps = [SquirrelBody, SquirrelDriver, SquirrelRenderer];
  }

  @TransientScope
  config(def: ObjectDef, bodyConfig: BodyConfig) {
    bodyConfig.x = def.x;
    bodyConfig.y = def.y;
    bodyConfig.w = def.w;
    bodyConfig.h = def.h;
  }
          //ID: def.name, //'squirrel-1',
}

class WorldLoader {

  @TransientScope
  config(mapDef: MapDef, worldConfig: WorldConfig) {
    worldConfig.x = 0;
    worldConfig.y = 0;
    worldConfig.w = mapDef.mapData.width * mapDef.mapData.tilewidth;
    worldConfig.h = mapDef.mapData.height * mapDef.mapData.tileheight;
  }
}


class BackgroundLoader {

  @TransientScope
  config(mapDef: MapDef, grid: BackgroundGrid) {
    mapDef.tilelayers.forEach((layer) => {
      layer.forEach((sprite) => {
        grid.sprites.push(sprite);
      });
    });
  }
}

var typeLoaderMap = {
  "squirrel": new SquirrelLoader(),
  "coin": new CoinLoader(),
  "chest": new ChestLoader(),
  "wall": new WallLoader(),
  "player": new PlayerLoader()
};

var worldLoader = new WorldLoader();
var backgroundLoader = new BackgroundLoader();


function WorldScene(mapPath) {
  var extras = [HUD, BackgroundRenderer];

  // TODO test that render layers are removed from renderer when scene is unloaded
  // TODO maybe renderer should be scene scoped? object scoped?

  @Provide(SceneLoader)
  function loadScene(sceneInjector: Injector, scene: Scene, renderer: Renderer) {

    var map = loadMapSync(mapPath);
    var provideMapDef = valueProvider(MapDef, map, new SceneScope());

    renderer.getLayer('background');
    renderer.getLayer('objects');
    renderer.getLayer('player');
    renderer.getLayer('hud');

    // TODO there's probably a better way
    var worldInjector = sceneInjector.createChild([provideMapDef]);
    worldInjector.get(worldLoader.config);

    var backgroundInjector = sceneInjector.createChild([provideMapDef]);
    backgroundInjector.get(backgroundLoader.config);


    var objectDefs = [];

    // TODO optimize
    map.objectlayers.forEach((layer) => {
      layer.forEach((def) => {
        objectDefs.push(def);
      });
    });

    objectDefs.push({
      type: 'player',
      ID: 'player',
    });


    objectDefs.forEach((def) => {
        var loader = typeLoaderMap[def.type];

        if (!loader) {
          // TODO
          throw `Error: no loader found for type "${def.type}"`;
        }

        var provideObjectDef = valueProvider(ObjectDef, def);
        var providers = [provideMapDef, provideObjectDef];

        if (loader.providers) {
          providers.push.apply(providers, loader.providers);
        }

        var objectInjector = sceneInjector.createChild(providers, [ObjectScope]);
        objectInjector.get(loader.config);

        // TODO the error message from this probably sucks. how to improve?
        //      that is, if dep is undefined.
        // TODO move this to Loader base class?
        loader.deps.forEach((dep) => {
          objectInjector.get(dep);
        });

        var obj = objectInjector.get(SceneObject);
        // TODO don't want "ID || name". just ID
        scene.addObject(def.ID || def.name, obj);
    });

    // TODO the error message from this sucks. how to improve?
    //      that is, if extra is undefined.
    extras.forEach((extra) => {
      sceneInjector.get(extra);
    });
  }

  return [loadScene];
}
