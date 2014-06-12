import {Inject, Injector, Provide} from 'di';
import {WorldConfig} from 'src/world';
import {Scene, SceneLoader} from 'src/scene';
import {SceneScope} from 'src/scope';
import {SceneKeyEvents} from 'src/keyevents';

export {SceneManager};

@Inject(Injector)
class SceneManager {

  constructor(injector) {
    this.injector = injector;
    this.defs = {};
  }

  register(name, def) {
    this.defs[name] = def;
  }

  load(name) {
    var def = this.defs[name];

    // TODO and what if the scene isn't a world scene, but a shop scene,
    //      or an inventory scene, or whatever? maybe each scene should
    //      name its own loader?
    //@Provide(WorldConfig)
    //function getWorldConfig() {
      //return def.world;
    //}
    if (def.fetch) {
      def.fetch();
    }

    //var childInjector = this.injector.createChild([getWorldConfig], [SceneScope]);
    //childInjector.get(SceneObjectLoader).load(def.objects);

    // TODO allow unload to be blocked?
    if (this.scene) {
      this.scene.events.trigger('unload');
    }

    var deps = [SceneKeyEvents].concat(def);

    var childInjector = this.injector.createChild(deps, [SceneScope]);
    childInjector.get(SceneLoader);
    this.scene = childInjector.get(Scene);
  }
}
