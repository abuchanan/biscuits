import {Injector} from 'di';
import {Renderer, RenderConfig} from 'src/render';
import {SceneManager} from 'src/scenemanager';
import {WorldScene} from 'src/worldscene';
import {KeyboardInput} from 'src/input';

import {FPSMeterPlugin} from 'src/plugins/FPSMeter';

export {start};


function start(container) {

  var injector = new Injector();

  // TODO find the appropriate place for this
  //      probably WorldScene?
  var renderConfig = injector.get(RenderConfig);
  renderConfig.container = container;

  var manager = injector.get(SceneManager);

  manager.plugins.push(FPSMeterPlugin);

  injector.get(KeyboardInput);

  // TODO mock world for debugging only
  var mockWorld = WorldScene('maps/foo10.json');
  
  manager.register('mock', mockWorld);
  manager.load('mock');
}
