define(function() {


  var directionAliases = {
    'forward-north': 'north',
    'forward-west': 'west',
    'forward-east': 'east',
    'forward-south': 'south',

    'backward-north': 'south',
    'backward-west': 'east',
    'backward-east': 'west',
    'backward-south': 'north',

    'left-north': 'west',
    'left-west': 'south',
    'left-east': 'north',
    'left-south': 'east',

    'right-north': 'east',
    'right-west': 'north',
    'right-east': 'south',
    'right-south': 'west',
  };


  function BoundingBox(x, y, w, h, boxDirection) {

    function tryAlias(d) {
      return directionAliases[boxDirection + '-' + d] || d;
    }

    function move(moveDirection, distance) {
      // TODO(abuchanan) optimize
      moveDirection = tryAlias(moveDirection);
      distance = distance || 1;

      switch (moveDirection) {
        case 'north':
          bb.y -= distance;
          break;

        case 'south':
          bb.y += distance;
          break;

        case 'west':
          bb.x -= distance;
          break;

        case 'east':
          bb.x += distance;
          break;
      }
    }

    function extend(extendDirection, distance) {
      // TODO(abuchanan) optimize
      extendDirection = tryAlias(extendDirection);
      distance = distance || 1;

      switch (extendDirection) {
        case 'north':
          bb.h -= distance;
          break;

        case 'south':
          bb.h += distance;
          break;

        case 'west':
          bb.w -= distance;
          break;

        case 'east':
          bb.w += distance;
          break;
      }
    }

    var bb = {
      x: x,
      y: y,
      w: w,
      h: h,
      extend: extend,
      move: move,
    };

    return bb;
  }


  return BoundingBox;

});
