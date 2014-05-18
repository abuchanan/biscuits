    // TODO need something to broadcast activate/deactivate (or start/stop)
    //      events to world objects. happens during scene load/unload,
    //      and also if partially loading a large world
    //      Could be implemented inside the World code, and triggered here
    //      with world.start()/world.stop()
// TODO tile loader resource needs to be injectable for tests
// TODO quadtree should be injectable too?
// TODO are grid bounds even really necessary? should the world just
//      expand to fit whatever object is added? probably.
function World(gridX, gridY, gridWidth, gridHeight) {

  //function loadTile(x, y) {
  //}

  //var regionManager = WorldRegionManager(80, 1, 1, loadTile);

  var tree = QuadTree(gridX, gridY, gridWidth, gridHeight);

  var currentObjectID = 0;
  var worldObjects = {};


  /*
    Internal helper for turning a list of IDs
    (probably coming from a quadtree query) into a list of world objects.
  */
  function getObjects(IDs) {
    var result = [];

    for (var i = 0, ii = IDs.length; i < ii; i++) {
      var ID = IDs[i];
      result.push(worldObjects[ID]);
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
      var currentX = x;
      var currentY = y;
      var events = EventManager();

      // TODO support resize?
      var obj = {
        // TODO remove getID? It's really for debug only?
        getID: function() {
          return ID;
        },
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
        addListener: events.addListener,
        fire: events.fire,
      };

      worldObjects[ID] = obj;
      tree.add(x, y, w, h, ID);

      return obj;
    },

    // TODO events should be allowed to include data?
    broadcast: function(eventname, x, y, w, h) {
      var IDs = tree.query(x, y, w, h);
      var objs = getObjects(IDs);
      for (var i = 0, ii = objs.length; i < ii; i++) {
        objs[i].fire(eventname);
      }
    },
  };
}
