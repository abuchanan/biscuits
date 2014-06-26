import {Injector} from 'di';
import {Renderer} from 'src/render';
import {SceneManager} from 'src/scenemanager';
import {WorldScene} from 'src/worldscene';
import {KeyboardInput} from 'src/input';

import {FPSMeterPlugin} from 'src/plugins/FPSMeter';

export {start};


function start() {

  var injector = new Injector();
  var renderer = injector.get(Renderer);
  var manager = injector.get(SceneManager);

  manager.plugins.push(FPSMeterPlugin);

  injector.get(KeyboardInput);

  // TODO mock world for debugging only
  var mockWorld = WorldScene('maps/foo10.json');
  
  manager.register('mock', mockWorld);
  manager.load('mock');

  // TODO rename to just "tick"
  function loop() {
    requestAnimationFrame(loop);
    manager.scene.events.trigger('scene tick', [Date.now()]);
    // TODO renderer should hook itself into the ticker.
    renderer.render();
  }
  // TODO inject this so that the frame rate can be mocked for testing
  requestAnimationFrame(loop);

  return renderer.getViewDOM();
}
