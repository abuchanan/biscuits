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
// TODO Is @SceneScope the best solution here? The problem is that
//      SceneScenario is getting a fresh scene from the child injector
//      because it has @SceneScope. At first, SceneObjectLoader didn't
//      have @SceneScope, so it was being created/cached on the parent
//      injector. Therefore, SceneObjectLoader is getting its deps. from
//      the parent injector, which means it's getting a new scene from
//      the parent too, even though the original call is 
//      childInjector.get(SceneObjectLoader)
//      Dizzying :(
/*
@SceneScope
@Inject(Injector, Scene)
class SceneObjectLoader {

  constructor(injector, scene) {
    this.injector = injector;
    this.scene = scene;
  }

  load(definitions) {
    var loader = this;

    definitions.forEach((def) => {
      // TODO allow multiple types/loaders
      var handler = loader.injector.get(def.type);
      var obj = loader.injector.get(SceneObject);
      handler(def, obj);
      loader.scene.addObject(def.ID, obj);
    });
  }
}
*/
function WorldScene(worldConfig, definitions) {

  @Provide(WorldConfig)
  function getWorldConfig() {
    return worldConfig;
  }

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
