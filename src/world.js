import {SceneScope, ObjectScope} from 'src/scope';
import {SceneObject} from 'src/scene';
import {EventEmitter} from 'src/events';
import {QuadTreeFactory} from 'src/QuadTree';

export {
  WorldConfig,
  BodyConfig,
  World,
  Body
};

// TODO need something to broadcast activate/deactivate (or start/stop)
//      events to world objects. happens during scene load/unload,
//      and also if partially loading a large world
//      Could be implemented inside the World code, and triggered here
//      with world.start()/world.stop()
// TODO tile loader resource needs to be injectable for tests
// TODO are grid bounds even really necessary? should the world just
//      expand to fit whatever object is added? probably.

// TODO a problem with interfaces is that DI doesn't know they are interfaces.
//      An interface shouldn't be able to be used to fulfill a dependency.
//      DI should throw an error if there is no concrete provider for the
//      interface token.

@SceneScope
class WorldConfig {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }
}

@ObjectScope
class BodyConfig {
  constructor(x, y, w, h, isBlock = false) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.isBlock = isBlock;
  }
}

@SceneScope
class World {

  constructor(config: WorldConfig, createQuadTree: QuadTreeFactory) {
    this._tree = createQuadTree(config.x, config.y, config.w, config.h);
    this._objects = {};
    this._currentObjectID = 0;
  }

  query(x, y, w, h) {
    var IDs = this._tree.query(x, y, w, h);
    return this._getObjects(IDs);
  }

  queryMany(...args) {
    // TODO change QuadTree.queryMany to queryMany(rect1, rect2, ...)
    var IDs = this._tree.queryMany(args);
    return this._getObjects(IDs);
  }

  // TODO? findPath() {}

  nextID() {
    return this._currentObjectID++;
  }

  add(body) {
    this._objects[body.ID] = body;
    var rect = body.getRectangle();
    this._tree.add(rect.x, rect.y, rect.w, rect.h, body.ID);
  }

  remove(body) {
    this._tree.remove(body.ID);
  }

  /*
    Internal helper for turning a list of IDs
    (probably coming from a quadtree query) into a list of world objects.
  */
  _getObjects(IDs) {
    var result = [];

    for (var i = 0, ii = IDs.length; i < ii; i++) {
      var ID = IDs[i];
      result.push(this._objects[ID]);
    }
    return result;
  }
}


// TODO support resize?
// TODO replace "body-config" string with class
@ObjectScope
class Body {

  constructor(events: EventEmitter, world: World, config: BodyConfig,
              obj: SceneObject) {

    console.log('body config', config);
    // TODO needed?
    this.events = events;
    this.world = world;
    this.ID = world.nextID();
    // TODO use get/set
    this._x = config.x;
    this._y = config.y;
    this.w = config.w;
    this.h = config.h;
    this.isBlock = config.isBlock || false;
    this.obj = obj;
    world.add(this);
  }

  getPosition() {
    return {
      x: this._x,
      y: this._y
    };
  }

  setPosition(x, y) {
    this._x = x;
    this._y = y;
    // TODO inefficient. not sure how to improve using quadtrees though.
    this.world.remove(this);
    this.world.add(this);
  }

  remove() {
    this.world.remove(this);
  }

  getRectangle() {
    return {
      x: this._x,
      y: this._y,
      w: this.w,
      h: this.h
    };
  }

  queryFront(distance = 1) {
    // TODO(abuchanan) optimize
    var rect = this.getRectangle();

    switch (this.direction) {
      case 'up':
        var x1 = rect.x;
        var y1 = rect.y - distance;
        var w1 = rect.w;
        var h1 = distance;
        break;

      case 'down':
        var x1 = rect.x;
        var y1 = rect.y + rect.h;
        var w1 = rect.w;
        var h1 = distance;
        break;

      case 'left':
        var x1 = rect.x - distance;
        var y1 = rect.y;
        var w1 = distance;
        var h1 = rect.h;
        break;

      case 'right':
        var x1 = rect.x + rect.w;
        var y1 = rect.y;
        var w1 = distance;
        var h1 = rect.h;
        break;
    }
    return this.world.query(x1, y1, w1, h1);
  }
}
