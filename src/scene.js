import {Injector} from 'di';
import {EventEmitter} from 'src/events';
import {SceneScope, ObjectScope} from 'src/scope';
import {ObjectConfig} from 'src/config';

export {Scene, SceneObject, SceneLoader};


class Ticker {
  // TODO stop()

  start() {
    requestAnimationFrame(this._onTick.bind(this));
  }

  _onTick() {
    requestAnimationFrame(this._onTick.bind(this));
    this.onTick();
  }

  onTick() {}
}

@SceneScope
class Scene {

  constructor(events: EventEmitter, ticker: Ticker) {
    this.events = events;
    this._objects = {};

    ticker.onTick = function() {
      events.trigger('tick', [Date.now()]);
    }

    ticker.start();
  }

  // TODO promise or function that returns a promise?
  //      belongs in SceneManager?
  /*
  loadDependsOn(promise) {
  }

  unloadDependsOn(promise) {
  }
  */

  addObject(obj) {
    // TODO catch duplicate ID
    this._objects[obj.ID] = obj;
  }

  getObject(ID) {
    // TODO handle key error
    return this._objects[ID];
  }
}


@ObjectScope
class SceneObject {

  constructor(injector: Injector, events: EventEmitter, config: ObjectConfig) {
    // TODO don't want both name and ID
    this.ID = config.name || config.ID;
    this.injector = injector;
    this.get = this.injector.get.bind(this.injector);
    this.events = events;
  }
}

// TODO @InjectFactory?

class SceneLoader {}
