define(['./QuadTree'], function(QuadTree) {

  function World(s, x, y, w, h) {

    var tree = new QuadTree(x, y, w, h);
    var objects = {};

    s.query = function(bb) {
      var IDs = tree.query(bb.x, bb.y, bb.w, bb.h);
      return getObjects(IDs);
    };

    s.add = function(body) {
      var bodyID = body.getID();
      objects[bodyID] = body;
      var rect = body.getRectangle();
      tree.add(rect.x, rect.y, rect.w, rect.h, bodyID);
      s.trigger('add', [body]);
    };

    s.remove = function(body) {
      tree.remove(body.getID());
      s.trigger('remove', [body]);
    };

    s.getRectangle = function() {
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
  }

  return World;
});


// TODO need something to broadcast activate/deactivate (or start/stop)
//      events to world objects. happens during scene load/unload,
//      and also if partially loading a large world
//      Could be implemented inside the World code, and triggered here
//      with world.start()/world.stop()
// TODO tile loader resource needs to be injectable for tests
// TODO are grid bounds even really necessary? should the world just
//      expand to fit whatever object is added? probably.

