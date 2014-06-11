import {Inject, Injector, TransientScope} from 'di';
import {EventEmitter} from 'src/events';

export {SceneScope, Scene, SceneObjectLoader};

class SceneScope {};

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
//
//      This is causing a lot of bugs which are very difficult to debug.
//      Now, all of my object loaders need to have @SceneScope, otherwise
//      none of them will get the keyevents which are scope to each scene.
//
//      Possibly it's better to flip everything. Don't use child injectors.
//      Always use separate injectors, and if you want something to have
//      a permanent life cycle, you have to write/mark it as a singleton.
@SceneScope
@Inject(Injector, Scene)
class SceneObjectLoader {

  constructor(injector, scene, SceneObject) {
    this.injector = injector;
    this.scene = scene;
  }

  load(definitions) {
    var loader = this;

    definitions.forEach(function(def) {
      // TODO allow multiple types/loaders
      var handler = loader.injector.get(def.type);
      var obj = loader.injector.get(SceneObject);
      handler(def, obj);
      loader.scene.addObject(def.ID, obj);
    });
  }
}
