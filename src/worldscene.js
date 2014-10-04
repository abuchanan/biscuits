import {Injector, Provide} from 'di';
import {Scene, SceneObject, SceneLoader} from 'src/scene';
import {Renderer, RendererConfig} from 'src/render';
import {ObjectScope, SceneScope} from 'src/scope';
import {Loader} from 'src/utils';
import {HUD} from 'src/hud';
import {WorldConfig, BodyConfig, Body} from 'src/world';
import {MapConfig, Map, MapLoader} from 'src/maploader';
import {BiscuitsConfig, ObjectConfig} from 'src/config';
import {ActiveRegion} from 'src/plugins/Region';
import {WorldMap} from 'src/worldmap';
import {Types} from 'src/types';
import {BackgroundRenderer} from 'src/background';

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
};


// TODO if a requested type is undefined, the error message (from di.js?) is
//      difficult to interpret


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
function triggerLoadedEvent(scene: Scene) {
  scene.events.trigger('loaded');
}


var WorldSceneLoader = new Loader()
  .provides([
    // TODO move these to setupFoo like I did for renderer config
    provideWorldConfig,
    provideWorldMap,
  ])
  .runs([
    setupRendererConfig,
    ActiveRegion,
    BackgroundRenderer
    //HUD,
    //triggerLoadedEvent
  ]);

// TODO test that render layers are removed from renderer when scene is unloaded
// TODO maybe renderer should be scene scoped? object scoped?
