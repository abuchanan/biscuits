import {Injector, Provide} from 'di';
import {RenderConfig, Renderer} from 'src/render';
import {SceneManager} from 'src/scenemanager';
import {WorldScene} from 'src/scene';
import {KeyboardInput} from 'src/input';

import {CoinLoader} from 'src/plugins/Coin';
import {PlayerLoader} from 'src/plugins/Player';
import {ChestLoader} from 'src/plugins/Chest';
import {BlockLoader} from 'src/plugins/Block';
import {BackgroundLoader} from 'src/background';
import {HUD} from 'src/hud';

export {start};


function start() {

  @Provide(RenderConfig)
  function getRenderConfig() {
    return {};
  }

  var injector = new Injector([getRenderConfig]);
  var renderer = injector.get(Renderer);
  var manager = injector.get(SceneManager);

  injector.get(KeyboardInput);

  // TODO mock world for debugging only
  var mockWorld = WorldScene({x: 0, y: 0, w: 400, h: 400}, [
    {ID: 'player-1', x: 256, y: 256, w: 32, h: 32, type: PlayerLoader},
    {ID: 'background', type: BackgroundLoader},
    {ID: 'coin-1', x: 20, y: 20, w: 10, h: 10, type: CoinLoader},
    {ID: 'coin-2', x: 50, y: 10, w: 10, h: 10, type: CoinLoader, coinValue: 10},
    //{ID: 'block-1', x: 3, y: 2, w: 2, h: 1, type: BlockLoader},
    {ID: 'chest-1', x: 40, y: 40, w: 10, h: 10, type: ChestLoader},
  ], [HUD]);

  manager.register('mock', mockWorld);
  manager.load('mock');

  // TODO rename to just "tick"
  function loop() {
    requestAnimationFrame(loop);
    manager.scene.events.trigger('scene tick', [Date.now()]);
    renderer.render();
  }
  requestAnimationFrame(loop);

  return renderer.getViewDOM();
}
