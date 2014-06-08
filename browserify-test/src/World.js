import EventEmitter from 'lib/EventEmitter';

import {QuadTree} from './QuadTree';

// TODO need something to broadcast activate/deactivate (or start/stop)
//      events to world objects. happens during scene load/unload,
//      and also if partially loading a large world
//      Could be implemented inside the World code, and triggered here
//      with world.start()/world.stop()
// TODO tile loader resource needs to be injectable for tests
// TODO are grid bounds even really necessary? should the world just
//      expand to fit whatever object is added? probably.

export function World(gridX, gridY, gridWidth, gridHeight) {
  //function loadTile(x, y) {
  //}

  //var regionManager = WorldRegionManager(80, 1, 1, loadTile);

  var tree = QuadTree(gridX, gridY, gridWidth, gridHeight);

  var currentObjectID = 0;
  var bodies = {};

  /*
    Internal helper for turning a list of IDs
    (probably coming from a quadtree query) into a list of world objects.
  */
  function getObjects(IDs) {
    var result = [];

    for (var i = 0, ii = IDs.length; i < ii; i++) {
      var ID = IDs[i];
      result.push(bodies[ID]);
    }
    return result;
  }

  return {
    query: function(x, y, w, h) {
      var IDs = tree.query(x, y, w, h);
      return getObjects(IDs);
    },

    queryMany: function() {
      // TODO change QuadTree.queryMany to queryMany(rect1, rect2, ...)
      var IDs = tree.queryMany(arguments);
      return getObjects(IDs);
    },

    findPath: function(x1, y1, x2, y2) {
      // TODO
    },

    add: function(x, y, w, h) {
      var ID = currentObjectID++;
      var body = Body(ID, x, y, w, h, tree);
      bodies[ID] = body;
      tree.add(x, y, w, h, ID);
      return body;
    },
  };
}


function Body(ID, x, y, w, h, tree) {
  var currentX = x;
  var currentY = y;

  // TODO support resize?
  return {
    events: new EventEmitter(),

    getPosition: function() {
      return {x: currentX, y: currentY};
    },

    setPosition: function(x, y) {
      currentX = x;
      currentY = y;
      // TODO inefficient. not sure how to improve using quadtrees though.
      tree.remove(ID);
      tree.add(x, y, w, h, ID);
    },

    remove: function() {
      tree.remove(ID);
    },

    getRectangle: function() {
      return {
        x: currentX,
        y: currentY,
        w: w,
        h: h
      };
    },
  };
}
