define(['./BoundingBox'], function(BoundingBox) {

  var currentBodyID = 1;


  function Body(s, _x, _y, _w, _h, isBlock) {
      var x = _x;
      var y = _y;
      var w = _w;
      var h = _h;
      var ID = currentBodyID++;


      s.getID = function() {
        return ID;
      };

      s.getPosition = function() {
        return {x: x, y: y};
      };

      s.setPosition = function(_x, _y) {
        x = _x;
        y = _y;

        // TODO inefficient. not sure how to improve using quadtrees though.
        s.world.remove(s);
        s.world.add(s);
      };

      s.getRectangle = function() {
        return BoundingBox(x, y, w, h, s.direction);
      };

      s.remove = function() {
        world.remove(s);
      };

      s.isBlock = function() {
        return isBlock;
      };

      s.direction = 'south';
      s.world.add(s);

      s.on('destroy', function() {
        s.world.remove(s);
      });
  }

  // Module exports
  return Body;
});


// TODO support resize?
