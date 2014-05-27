module.exports = function() {
  var x = 0;
  var y = 0;
  var direction = 'down';

  return {
    getPosition: function() {
      return {x: x, y: y};
    },
    setPosition: function(_x, _y) {
      x = _x;
      y = _y;
    },
    getDirection: function() {
      return direction;
    },
    setDirection: function(_direction) {
      direction = _direction;
    },
  };
};
