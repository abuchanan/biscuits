define(['./QuadTree', 'lib/EventEmitter'], function(QuadTree, EventEmitter) {

  function World(x, y, w, h) {
    var tree = new QuadTree(x, y, w, h);
    var events = new EventEmitter();
    var objects = {};

    function query(x, y, w, h) {
      var IDs = tree.query(x, y, w, h);
      return getObjects(IDs);
    }

    function add(body) {
      var bodyID = body.getID();
      objects[bodyID] = body;
      var rect = body.getRectangle();
      tree.add(rect.x, rect.y, rect.w, rect.h, bodyID);
      events.trigger('add', [body]);
    }

    function remove(body) {
      tree.remove(body.getID());
      events.trigger('remove', [body]);
    }

    function getRectangle() {
      return {x: x, y: y, w: w, h: h};
    };

    /*
      Internal helper for turning a list of IDs
      (probably coming from a quadtree query) into a list of world objects.
    */
    function getObjects(IDs) {
      var result = [];

      for (var i = 0, ii = IDs.length; i < ii; i++) {
        var ID = IDs[i];
        result.push(objects[ID]);
      }
      return result;
    }


    // World API
    return {
      query: query,
      add: add,
      remove: remove,
      events: events,
      getRectangle: getRectangle,
    };
  }


  // Module exports
  return function(scene) {

      var map = scene.map.mapData;
      // TODO this is getting the whole map, not just the current region
      console.log('foo', map.width, map.height);
      scene.world = World(0, 0, map.width, map.height);
  };
});


// TODO need something to broadcast activate/deactivate (or start/stop)
//      events to world objects. happens during scene load/unload,
//      and also if partially loading a large world
//      Could be implemented inside the World code, and triggered here
//      with world.start()/world.stop()
// TODO tile loader resource needs to be injectable for tests
// TODO are grid bounds even really necessary? should the world just
//      expand to fit whatever object is added? probably.

