import {Injector, Provide} from 'di';
import {RenderConfig, Renderer} from 'src/render';
import {SceneManager} from 'src/scenemanager';
import {WorldScene} from 'src/worldscene';
import {KeyboardInput} from 'src/input';
import {WorldConfig, BodyConfig, Body} from 'src/world';

import {PlayerBody, PlayerDriver, PlayerRenderer, CoinPurse} from 'src/plugins/Player';
import {CoinConfig, CoinRenderer, CoinCollision} from 'src/plugins/Coin';
import {ChestConfig, ChestRenderer, ChestUseable} from 'src/plugins/Chest';
import {SquirrelBody, SquirrelDriver, SquirrelRenderer} from 'src/plugins/squirrel';
import {BackgroundRenderer} from 'src/background';
import {HUD} from 'src/hud';
import {FPSMeterPlugin} from 'src/plugins/FPSMeter';

export {start};

function valueProvider(token, value) {
  var fn = function() { return value; };
  fn.annotations = [new Provide(token)];
  return fn;
}

function start() {

  var getRenderConfig = valueProvider(RenderConfig, {});
  
  // TODO submit a patch to di.js allowing me to provide values to a new injector
  //      without a wrapper
  var injector = new Injector([getRenderConfig]);
  var renderer = injector.get(Renderer);
  var manager = injector.get(SceneManager);

  manager.plugins.push(FPSMeterPlugin);

  injector.get(KeyboardInput);

  var worldConfig = new WorldConfig(-4000, -4000, 8000, 8000);

  // TODO mock world for debugging only
  var mockWorld = WorldScene(worldConfig, [

    {
      ID: 'player-1',
      providers: [
        // TODO get rid of this syntax
        valueProvider(BodyConfig, new BodyConfig(256, 256, 32, 32)),
        // TODO kinda sucks that I have to provide this also.
        //      unless maybe I provide it as a value?
        PlayerBody
      ],
      deps: [PlayerBody, PlayerDriver, PlayerRenderer, CoinPurse]
    },

    {
      ID: 'block-1',
      providers: [
        valueProvider(BodyConfig, new BodyConfig(64, 64, 32, 32, true))
      ],
      deps: [Body]
    },

    {
      ID: 'chest-1',
      providers: [
        valueProvider(BodyConfig, new BodyConfig(128, 128, 32, 32, true)),
        valueProvider(ChestConfig, new ChestConfig(10))
        // TODO ChestBody?
      ],
      deps: [Body, ChestRenderer, ChestUseable]
    },

    {
      ID: 'coin-1', 
      providers: [
        valueProvider(BodyConfig, new BodyConfig(128, 0, 32, 32)),
        valueProvider(CoinConfig, new CoinConfig(10))
      ], 
      deps: [Body, CoinRenderer, CoinCollision]
    },

    {
      ID: 'coin-1',
      providers: [
        valueProvider(BodyConfig, new BodyConfig(128, 64, 32, 32)),
        valueProvider(CoinConfig, new CoinConfig(5))
      ],
      deps: [Body, CoinRenderer, CoinCollision]
    },

    {
      ID: 'squirrel-1',
      providers: [
        valueProvider(BodyConfig, new BodyConfig(128, 256, 32, 32)),
        SquirrelBody
      ],
      deps: [SquirrelBody, SquirrelDriver, SquirrelRenderer]
    },

     // TODO background config
  ], [HUD, BackgroundRenderer]);

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
