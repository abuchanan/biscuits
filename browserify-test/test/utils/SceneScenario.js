import {Inject, Injector, Provide} from 'di';
import {SceneManager} from 'src/scenemanager';
import {GlobalKeyEvents} from 'src/keyevents';

export {SceneScenario};

@Inject(GlobalKeyEvents, SceneManager)
class SceneScenario {

  constructor(keyEvents, manager) {
    this.keyEvents = keyEvents;
    this.manager = manager;
  }

  load(name) {
    this.manager.load(name);
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
    this.manager.scene.events.trigger('scene tick', [this.time]);
  }
}
