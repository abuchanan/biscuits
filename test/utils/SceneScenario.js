import {Injector, Provide} from 'di';
import {SceneManager} from 'src/scenemanager';
import {Input} from 'src/input';
import {Loadpoints} from 'src/loadpoints';
import {MapLoader} from 'src/maploader';
import {WorldSceneLoader} from 'src/worldscene';

export {SceneScenario};


class SceneScenario {

  constructor() {

    var maps = this.maps = {};

    // TODO this setup is pretty verbose
    @Provide(Loadpoints)
    class MockLoadpoints {
      get(ID) {
        return {mapID: ID, loader: WorldSceneLoader};
      }
    }

    // TODO could use map cache in the future
    @Provide(MapLoader)
    class MockMapLoader {
      load(ID) {
        return maps[ID];
      }
    }

    this.injector = new Injector([MockLoadpoints, MockMapLoader]);
    this.input = this.injector.get(Input);
    this.manager = this.injector.get(SceneManager);
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
