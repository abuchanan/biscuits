import {Inject, Injector} from 'di';
import {EventEmitter} from 'src/events';
import {SceneScope, ObjectScope} from 'src/scope';

export {Scene, SceneObject, SceneLoader};


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


@ObjectScope
@Inject(Injector, EventEmitter)
class SceneObject {
  constructor(injector, events) {
    this.injector = injector;
    this.get = this.injector.get.bind(this.injector);
    this.events = events;
  }
}

// TODO @InjectFactory?

class SceneLoader {}
