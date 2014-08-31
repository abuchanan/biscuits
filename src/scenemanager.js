import {Injector, Provide} from 'di';
import {Scene} from 'src/scene';
import {SceneScope} from 'src/scope';
import {Loadpoints, Loadpoint} from 'src/loadpoints';

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

    var loader = loadpoint.loader
      .hasScope(SceneScope)
      .binds(Loadpoint, loadpoint, SceneScope)
      .runs(this.plugins);

    // TODO allow unload to be blocked
    // TODO I don't think I'm actually using this anywhere
    // TODO should the events be on SceneManager instead?
    if (this.scene) {
      this.scene.events.trigger('unload');
    }

    var sceneInjector = this.injector.get(loader.Injector);
    this.scene = sceneInjector.get(Scene);
  }
}
