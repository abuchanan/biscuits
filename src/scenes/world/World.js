define(['./QuadTree'], function(QuadTree) {

  function World(x, y, w, h) {
    var tree = new QuadTree(x, y, w, h);
    var objects = {};

    function query(x, y, w, h) {
      var IDs = tree.query(x, y, w, h);
      return getObjects(IDs);
    }

    // TODO? findPath() {}

    function add(body) {
      var bodyID = body.getID();
      objects[bodyID] = body;
      var rect = body.getRectangle();
      tree.add(rect.x, rect.y, rect.w, rect.h, bodyID);
    }

    function remove(body) {
      tree.remove(body.getID());
    }

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
    };
  }


  // Module exports
  return function(scene) {

      var map = scene.map.mapData;
      scene.world = World(0, 0,
          map.width * map.tilewidth,
          map.height * map.tileheight
      );
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

