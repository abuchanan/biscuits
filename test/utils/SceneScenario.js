import {Injector, Provide} from 'di';
import {SceneManager} from 'src/scenemanager';
import {Input} from 'src/input';
import {Loadpoints} from 'src/loadpoints';
import {MapLoader} from 'src/maploader';
import {WorldSceneLoader} from 'src/worldscene';
import {MockLoadpoints} from 'src/dev';
import {RendererConfig} from 'src/render';
import {BiscuitsConfig} from 'src/config';
import {valueProvider} from 'src/utils';
import {PlayerRenderer} from 'src/plugins/Player';

export {SceneScenario};

// Don't bother rendering the player, and avoid loading player rendering
// resources (which would fail since this is a test server).
// TODO(abuchanan) over time, it might be nice to find a better way to easily
//                 mock out all renderers.
@Provide(PlayerRenderer)
function MockPlayerRenderer() {}

class SceneScenario {

  constructor() {

    var biscuitsConfig = valueProvider(BiscuitsConfig, {
      container: document.createElement('div'),
    });

    this.injector = new Injector([MockLoadpoints, biscuitsConfig, MockPlayerRenderer]);
    this.loadpoints = this.injector.get(Loadpoints);

    this.input = this.injector.get(Input);
    this.manager = this.injector.get(SceneManager);
  }

  load(name) {
    this.manager.load(name);
    this._time = 0;
    this.tick(0);
  }

  // TODO default to 200 or 1 for keyupTime?
  keypress(name, keydownTime = 1, keyupTime = 300) {
    this.input[name] = true;
    this.tick(keydownTime);

    this.input[name] = false;
    this.tick(keyupTime);
  }

  tick(n) {
    this._time += n;
    this.manager.scene.events.trigger('scene tick', [this._time]);
  }
}
