import {Injector, Provide} from 'di';
import {RenderConfig, Renderer} from 'src/render';
import {SceneManager} from 'src/scenemanager';
import {WorldScene} from 'src/worldscene';
import {KeyboardInput} from 'src/input';
import {WorldConfig, BodyConfig, Body} from 'src/world';

import {PlayerBody, PlayerDriver, PlayerRenderer, PlayerUseAction, CoinPurse} from 'src/plugins/Player';
import {CoinConfig, CoinRenderer, CoinCollision} from 'src/plugins/Coin';
import {ChestConfig, ChestRenderer, ChestUseable} from 'src/plugins/Chest';
import {SquirrelBody, SquirrelDriver, SquirrelRenderer} from 'src/plugins/squirrel';
import {BackgroundRenderer, BackgroundGrid} from 'src/background';
import {HUD} from 'src/hud';
import {FPSMeterPlugin} from 'src/plugins/FPSMeter';
import PIXI from 'lib/pixi';
import {loadMapSync} from 'src/maploader';
import {valueProvider} from 'src/utils';

export {start};


function start() {

  var map = loadMapSync('maps/foo9.json');

  @Provide(BackgroundGrid)
  function getLoadedBackground() {
    var grid = [];
    map.tilelayers.forEach((layer) => {
      layer.forEach((sprite) => {
        grid.push(sprite);
      });
    });
    return grid;
  }

  var getRenderConfig = valueProvider(RenderConfig, {});
  
  // TODO submit a patch to di.js allowing me to provide values to a new injector
  //      without a wrapper
  var injector = new Injector([getRenderConfig]);
  var renderer = injector.get(Renderer);
  var manager = injector.get(SceneManager);

  manager.plugins.push(FPSMeterPlugin);

  injector.get(KeyboardInput);

  var worldConfig = new WorldConfig(0, 0, map.mapData.width * map.mapData.tilewidth, map.mapData.height * map.mapData.tileheight);

  console.log(map);
  var objects = [
    {
      ID: 'player-1',
      providers: [
        // TODO get rid of this syntax
        valueProvider(BodyConfig, new BodyConfig(256, 64, 32, 32)),
        // TODO kinda sucks that I have to provide this also.
        //      unless maybe I provide it as a value?
        PlayerBody
      ],
      deps: [PlayerBody, PlayerDriver, PlayerRenderer, CoinPurse, PlayerUseAction]
    }
  ];

  map.objectlayers.forEach((layer) => {
    layer.forEach((def) => {

      if (def.type == 'squirrel') {
        objects.push({
          ID: def.name, //'squirrel-1',
          providers: [
            valueProvider(BodyConfig, new BodyConfig(def.x, def.y, def.w, def.h)),
            SquirrelBody
          ],
          deps: [SquirrelBody, SquirrelDriver, SquirrelRenderer]
        });

      } else if (def.type == 'coin') {
        var value = def.value || 1;
        objects.push({
          ID: def.name, //'coin-1', 
          providers: [
            valueProvider(BodyConfig, new BodyConfig(def.x, def.y, def.w, def.h)),
            valueProvider(CoinConfig, new CoinConfig(value))
          ], 
          deps: [Body, CoinRenderer, CoinCollision]
        });

      } else if (def.type == 'chest') {
        var value = def.value || 1;
        objects.push({
          ID: def.name,
          providers: [
            valueProvider(BodyConfig, new BodyConfig(def.x, def.y, def.w, def.h, true)),
            valueProvider(ChestConfig, new ChestConfig(value))
            // TODO ChestBody?
          ],
          deps: [Body, ChestRenderer, ChestUseable]
        });

      } else if (def.type == 'wall') {
        objects.push({
          ID: def.name,
          providers: [
            valueProvider(BodyConfig, new BodyConfig(def.x, def.y, def.w, def.h, true)),
          ],
          deps: [Body]
        });
      }

    });
  });

  // TODO mock world for debugging only
  var mockWorld = WorldScene([
    valueProvider(WorldConfig, worldConfig),
    getLoadedBackground,
  ], objects, [HUD, BackgroundRenderer]);

  manager.register('mock', mockWorld);
  manager.load('mock');

  // TODO rename to just "tick"
  function loop() {
    requestAnimationFrame(loop);
    manager.scene.events.trigger('scene tick', [Date.now()]);
    renderer.render();
  }
  // TODO inject this so that the frame rate can be mocked for testing
  requestAnimationFrame(loop);

  return renderer.getViewDOM();
}
