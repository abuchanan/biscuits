import {Inject, Injector, Provide, TransientScope} from 'di';
import {EventEmitter} from 'src/events';
import {WorldConfig} from 'src/world';
import {SceneScope} from 'src/scope';

export {Scene, SceneLoader, WorldScene};


@SceneScope
@Inject(EventEmitter)
class Scene {

  constructor(events) {
    this.events = events;
    this._objects = {};
  }

  // TODO promise or function that returns a promise?
  //      belongs in SceneManager?
  /*
  loadDependsOn(promise) {
  }

  unloadDependsOn(promise) {
  }
  */

  addObject(ID, obj) {
    // TODO catch duplicate ID
    this._objects[ID] = obj;
  }

  getObject(ID) {
    // TODO handle key error
    return this._objects[ID];
  }
}


@TransientScope
@Inject(EventEmitter)
class SceneObject {
  constructor(events) {
    this.events = events;
  }
}


// TODO @InjectFactory?

function WorldScene(worldConfig, definitions) {

  @Provide(WorldConfig)
  function getWorldConfig() {
    return worldConfig;
  }

  // TODO test that render layers are removed from renderer when scene is unloaded
  // TODO maybe renderer should be scene scoped?

  @Provide(SceneLoader)
  @Inject(Injector, Scene)
  function loadScene(injector, scene) {
    definitions.forEach((def) => {
      // TODO allow multiple types/loaders
      var handler = injector.get(def.type);
      var obj = injector.get(SceneObject);
      handler(def, obj);
      scene.addObject(def.ID, obj);
    });
  }

  return [getWorldConfig, loadScene];
}

class SceneLoader {}
