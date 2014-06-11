import {Injector, Provide} from 'di';
import {Scene, SceneScope, SceneObjectLoader} from 'src/scene';
import {KeyEvents} from 'src/keyevents';
import {WorldConfig} from 'src/world';

export {SceneScenario};

class SceneScenario {

  constructor(def) {

    var injector = new Injector();

    @Provide(WorldConfig)
    function getWorldConfig() {
      return def.world;
    }

    // TODO creating a child injector fails to find KeyEvents for some reason.
    //      creating a new injector works. possibly a bug in di framework
    //      not a bug in DI after all, but a bug in the KeyEvents constructor.
    //      "Shortcut" was undefined. Why the heck was this so hard to track
    //      down? Why wasn't I pointed exactly to the line that needed fixing?
    // TODO the createChild isn't using my getKeyEvents provider for some reason.
    var childInjector = injector.createChild([getWorldConfig], [SceneScope]);

    this.scene = childInjector.get(Scene);
    this.keyEvents = childInjector.get(KeyEvents);

    // TODO could move to Scene and provide SceneConfig dependency
    childInjector.get(SceneObjectLoader).load(def.objects);

    this.time = 0;
    this._tick(0);
  }

  keypress(name) {
    this.keyEvents.trigger(name + ' keydown');
    // Allow code (such as Actions.Movement) to respond to the keydown event
    // before we trigger the keyup event.
    this._tick(1);

    this.keyEvents.trigger(name + ' keyup');
    // TODO make configurable?
    this._tick(200);
  }

  _tick(n) {
    this.time += n;
    this.scene.events.trigger('scene tick', [this.time]);
  }
}
