'use strict';

module.exports = function(_width, _height, tiles) {
    var x = 0;
    var y = 0;
    var width = _width;
    var height = _height;
    // TODO should this fetch the initial area, or wait for setPosition?

    var anchorX = 0;
    var anchorY = 0;

    function prefetch() {
      var rx = x - width * anchorX;
      var ry = y - height * anchorY;
      tiles.prefetch(rx, ry, width, height);
    }

    function query(callback) {
      var rx = x - width * anchorX;
      var ry = y - height * anchorY;
      tiles.query(rx, ry, width, height, callback);
    }

    return {
      getPosition: function() {
        return {x: x, y: y};
      },
      setPosition: function(_x, _y) {
        x = _x;
        y = _y;
        prefetch();
      },
      setAnchor: function(dx, dy) {
        anchorX = dx;
        anchorY = dy;
      },
      resize: function(w, h) {
        width = w;
        height = h;
        prefetch();
      },
      forEachTile: query,
    };
};
