import {Injector, Provide} from 'di';
import {valueProvider} from 'src/utils';
import {SceneManager} from 'src/scenemanager';
import {Loadpoints} from 'src/loadpoints';
import {KeyboardInput} from 'src/input';
import {FPSMeterPlugin} from 'src/plugins/FPSMeter';
import {WorldSceneLoader} from 'src/worldscene';
import {BiscuitsConfig} from 'src/config';

export {start};

// TODO mock world for debugging only
@Provide(Loadpoints)
class MockLoadpoints {
  get(ID) {
    return {mapID: 'foo10', loader: WorldSceneLoader};
  }
}

// TODO make this into a Loader convention or something
//      so that it's easy to plug in something like MockLoadpoints
function start(container) {

  var provideBiscuitsConfig = valueProvider(BiscuitsConfig, {container});
  var injector = new Injector([provideBiscuitsConfig, MockLoadpoints]);
  injector.get(KeyboardInput);

  var manager = injector.get(SceneManager);
  manager.plugins.push(FPSMeterPlugin);
  manager.load('default');
}
