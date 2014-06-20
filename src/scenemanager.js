import {Injector, Provide} from 'di';
import {Scene, SceneLoader} from 'src/scene';
import {SceneScope} from 'src/scope';

export {SceneManager};

class SceneManager {

  constructor(injector: Injector) {
    this.injector = injector;
    this.defs = {};
    // TODO better name/organization for plugins?
    this.plugins = [];
  }

  register(name, def) {
    this.defs[name] = def;
  }

  load(name) {
    var def = this.defs[name];

    if (def.fetch) {
      def.fetch();
    }

    // TODO allow unload to be blocked?
    if (this.scene) {
      this.scene.events.trigger('unload');
    }

    var childInjector = this.injector.createChild(def, [SceneScope]);
    childInjector.get(SceneLoader);

    this.plugins.forEach((plugin) => {
      childInjector.get(plugin);
    });

    this.scene = childInjector.get(Scene);
  }
}
