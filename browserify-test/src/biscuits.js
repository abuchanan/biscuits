import {Injector, Provide} from 'di';
import {RenderConfig, Renderer} from 'src/render';
import {SceneManager} from 'src/scenemanager';
import {WorldScene} from 'src/scene';
import {KeyboardInput} from 'src/input';

import {CoinLoader} from 'src/plugins/Coin';
import {PlayerLoader} from 'src/plugins/Player';
import {ChestLoader} from 'src/plugins/Chest';
import {BlockLoader} from 'src/plugins/Block';

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
  var mockWorld = WorldScene({x: 0, y: 0, w: 40, h: 40}, [
    {ID: 'player-1', x: 1, y: 1, w: 10, h: 10, type: PlayerLoader},
    //{ID: 'coin-1', x: 4, y: 1, w: 1, h: 1, type: CoinLoader},
    //{ID: 'coin-2', x: 5, y: 1, w: 1, h: 1, type: CoinLoader, coinValue: 10},
    //{ID: 'block-1', x: 3, y: 2, w: 2, h: 1, type: BlockLoader},
    //{ID: 'chest-1', x: 2, y: 2, w: 1, h: 1, type: ChestLoader},
    //{ID: 'chest-2', x: 2, y: 3, w: 1, h: 1, type: ChestLoader, coinValue: 10},
  ]);

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
