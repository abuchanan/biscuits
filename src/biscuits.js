import {Injector} from 'di';
import {valueProvider} from 'src/utils';
import {SceneManager} from 'src/scenemanager';
import {KeyboardInput} from 'src/input';
import {BiscuitsConfig} from 'src/config';
import {extend} from 'src/utils';

export {Biscuits};


class Biscuits {

  constructor(config) {
    this.config = config || {};
    var provideBiscuitsConfig = valueProvider(BiscuitsConfig, this.config);
    this._providers = [provideBiscuitsConfig];
    // TODO Input type should be detected
    this._deps = [KeyboardInput];
    this._started = false;
  }

  config(config) {
    if (this._started) {
      throw 'Already started';
    }
    extend(this.config, config);
  }

  provides(...providers) {
    if (this._started) {
      throw 'Already started';
    }
    this._providers.push.apply(this._providers, providers);
  }

  dependsOn(...deps) {
    if (this._started) {
      throw 'Already started';
    }
    this._deps.push.apply(this._deps, deps);
  }

  start(scene) {
    if (this._started) {
      throw 'Already started';
    }

    this._started = true;
    var injector = new Injector(this._providers);

    this._deps.forEach((dep) => {
      injector.get(dep);
    });

    injector.get(SceneManager).load(scene);
  }
}
