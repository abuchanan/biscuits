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

export {start};

function valueProvider(token, value) {
  var fn = function() { return value; };
  fn.annotations = [new Provide(token)];
  return fn;
}

@Provide(BackgroundGrid)
function getBackgroundGrid() {
  // TODO clean up
  var tex = PIXI.Texture.fromImage('media/tmw_desert_spacing.png');
  var parts = [];

  for (var i = 0; i < 6; i++) {
    for (var j = 0; j < 6; j++) {
      var x = 1 * i + i * 32 + 1;
      var y = 1 * j + j * 32 + 1;

      var r = new PIXI.Rectangle(x, y, 32, 32);
      var part = new PIXI.Texture(tex, r);
      parts.push(part);
    }
  }

  var grid = [];
  for (var j = -20; j < 20; j++) {
    for (var i = -20; i < 20; i++) {
      var x = Math.floor(Math.random() * parts.length);
      var spr = new PIXI.Sprite(parts[x]);
      spr.x = i * 32;
      spr.y = j * 32;
      grid.push(spr);
    }
  }
  return grid;
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
  var mockWorld = WorldScene([
    valueProvider(WorldConfig, worldConfig),
    getBackgroundGrid,
  ], [

    {
      ID: 'player-1',
      providers: [
        // TODO get rid of this syntax
        valueProvider(BodyConfig, new BodyConfig(256, 256, 32, 32)),
        // TODO kinda sucks that I have to provide this also.
        //      unless maybe I provide it as a value?
        PlayerBody
      ],
      deps: [PlayerBody, PlayerDriver, PlayerRenderer, CoinPurse, PlayerUseAction]
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
