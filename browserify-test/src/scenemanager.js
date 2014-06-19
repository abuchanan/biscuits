import {Inject, Injector, Provide} from 'di';
import {WorldConfig} from 'src/world';
import {Scene, SceneLoader} from 'src/scene';
import {SceneScope} from 'src/scope';

export {SceneManager};

@Inject(Injector)
class SceneManager {

  constructor(injector) {
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
