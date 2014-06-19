import {Inject, Injector, Provide} from 'di';
import {SceneManager} from 'src/scenemanager';
import {Input} from 'src/input';

export {SceneScenario};

@Inject(Input, SceneManager)
class SceneScenario {

  constructor(input, manager) {
    this.input = input;
    this.manager = manager;
  }

  load(name) {
    this.manager.load(name);
    this._time = 0;
    this.tick(0);
  }

  // TODO default to 200 or 1 for keyupTime?
  keypress(name, keydownTime = 1, keyupTime = 200) {
    this.input.event = name + ' keydown';
    this.tick(keydownTime);

    this.input.event = name + ' keyup';
    this.tick(keyupTime);
  }

  tick(n) {
    this._time += n;
    this.manager.scene.events.trigger('scene tick', [this._time]);
  }
}
