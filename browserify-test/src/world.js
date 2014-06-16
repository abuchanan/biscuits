import {Inject, InjectLazy, TransientScope} from 'di';
import {SceneScope} from 'src/scope';
import {EventEmitter} from 'src/events';
import {QuadTree} from 'src/QuadTree';

export {
  WorldConfig,
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

class WorldConfig {}

@SceneScope
@Inject(WorldConfig)
@InjectLazy(QuadTree)
class World {

  constructor(config, createQuadTree) {
    this._tree = createQuadTree('quadtree-config', config);
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
@TransientScope
@Inject(EventEmitter, World, 'body-config')
class Body {

  //constructor(events, world, x, y, w, h, obj) {
  constructor(events, world, config) {
    // TODO needed?
    this.events = events;
    this.world = world;
    this.ID = world.nextID();
    // TODO use get/set
    this._x = config.x;
    this._y = config.y;
    this.w = config.w;
    this.h = config.h;
    this.obj = config.obj;
    this.isBlock = config.isBlock || false;
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