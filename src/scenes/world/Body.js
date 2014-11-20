define(['lib/EventEmitter'], function(EventEmitter) {

  var currentBodyID = 1;


  function Body(_x, _y, _w, _h, world) {
    var events = new EventEmitter();
    // TODO hard-coded
    var x = _x;
    var y = _y;
    var w = _w;
    var h = _h;
    var ID = currentBodyID++;


    function getID() {
      return ID;
    }

    function getPosition() {
      return {x: x, y: y};
    }

    function setPosition(_x, _y) {
      x = _x;
      y = _y;

      // TODO inefficient. not sure how to improve using quadtrees though.
      world.remove(body);
      world.add(body);
    }

    function getRectangle() {
      return {x: x, y: y, w: w, h: h};
    }

    function remove() {
      world.remove(body);
    }


    function queryFront(distance) {
      // TODO(abuchanan) optimize
      distance = distance || 1;
      var rect = getRectangle();

      switch (body.direction) {
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
      return world.query(x1, y1, w1, h1);
    }


    // Body API
    var body = {
      getID: getID,
      getPosition: getPosition,
      setPosition: setPosition,
      getRectangle: getRectangle,
      isBlock: false,
      direction: 'down',
      events: events,
      remove: remove,
      queryFront: queryFront,
      data: {},
    };

    world.add(body);

    return body;
  }

  // Module exports
  return Body;
});


// TODO support resize?
