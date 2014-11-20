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
      data: {},
    };

    world.add(body);

    return body;
  }

  // Module exports
  return Body;
});


// TODO support resize?
