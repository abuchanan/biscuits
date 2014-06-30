import {Injector, Provide} from 'di';
import {Scene, SceneLoader} from 'src/scene';
import {SceneScope} from 'src/scope';
import {Loadpoints, Loadpoint} from 'src/loadpoints';
import {valueProvider} from 'src/utils';

export {SceneManager};


// TODO would be nice if I could use utils/loader() for this?
//      but then what holds on to the current scene?
class SceneManager {

  constructor(injector: Injector, loadpoints: Loadpoints) {
    this.injector = injector;
    // TODO better name/organization for plugins?
    //      should they belong to SceneManager?
    this.plugins = [];
    this.loadpoints = loadpoints;
  }

  load(ID) {
    var loadpoint = this.loadpoints.get(ID);
    var loader = this.injector.get(loadpoint.loader);
    loader.providers.push(valueProvider(Loadpoint, loadpoint, new SceneScope()));

    // TODO allow unload to be blocked
    // TODO I don't think I'm actually using this anywhere
    // TODO should the events be on SceneManager instead?
    if (this.scene) {
      this.scene.events.trigger('unload');
    }

    var childInjector = this.injector.createChild(loader.providers, [SceneScope]);

    loader.deps.forEach((dep) => {
      childInjector.get(dep);
    });

    this.plugins.forEach((plugin) => {
      childInjector.get(plugin);
    });

    this.scene = childInjector.get(Scene);
  }
}
