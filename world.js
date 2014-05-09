function World(gridWidth, gridHeight) {

  var currentObjectID = 0;

  var grid = [];
  for (var x = 0; x < gridWidth; x++) {
    var row = [];
    grid.push(row);
    for (var y = 0; y < gridHeight; y++) {
      row.push([]);
    }
  }

  return {
    add: function(x, y, w, h) {

      currentX = x;
      currentY = y;

      var ID = currentObjectID++;
      var currentCells = [];

      function setCells(x, y, w, h) {
        if (currentCells.length > 0) {
          for (var i = 0; i < currentCells.length; i++) {
            var cell = currentCells[i];
            var i = cell.indexOf(obj);
            cell.splice(i, 1);
          }

          currentCells = [];
        }

        for (var ix = x; ix < x + w; ix++) {
          for (var iy = y; iy < y + h; iy++) {
            var cell = grid[ix][iy];
            cell.push(obj);
          }
        }
      }

      var obj = {
        getID: function() {
          return ID;
        },
        getPosition: function() {
          return {x: currentX, y: currentY};
        },
        setPosition: function(x, y) {
          setCells(x, y, w, h);
          currentX = x;
          currentY = y;
        },
      };

      setCells(x, y, w, h);

      return obj;
    },

    query: function(x, y, w, h) {
      var hits = {};

      for (var ix = x; ix < x + w; ix++) {
        for (var iy = y; iy < y + h; iy++) {
          var cell = grid[ix][iy];
          for (var i = 0; i < cell.length; i++) {
            var o = cell[i];
            hits[o.getID()] = o;
          }
        }
      }

      var objects = [];
      for (var k in hits) {
        objects.push(hits[k]);
      }

      return objects;
    },

  };
}
