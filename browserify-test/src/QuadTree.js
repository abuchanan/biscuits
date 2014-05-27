exports.QuadTree = QuadTree;

function Leaf() {
  var data = {};
  return {
    add: function(x1, y1, w, h, ID) {
      var x2 = x1 + w;
      var y2 = y1 + h;

      data[ID] = function(qx1, qy1, qw, qh) {
        var qx2 = qx1 + qw;
        var qy2 = qy1 + qh;
        return qx2 > x1 && qx1 < x2 && qy2 > y1 && qy1 < y2;
      };
    },
    remove: function(ID) {
      delete data[ID];
    },
    query: function(x, y, w, h) {
      var IDs = [];
      for (var ID in data) {
        var bb = data[ID];
        if (data[ID](x, y, w, h)) {
          IDs.push(ID);
        }
      }
      return IDs;
    },
  };
}

// TODO note that it only stores int/string IDs
//      I don't support storing arbitrary data (e.g. objects)
//      because I want to keep this simple and efficient, and it's easy enough to
//      map those IDs to arbitrary data outside of the quadtree.
function QuadTree(minX, minY, treeW, treeH) {

  var maxX = minX + treeW;
  var maxY = minY + treeH;
  var midX = maxX / 2;
  var midY = maxY / 2;

  // TODO var maxChildren = 10;

  var neQuad = Leaf();
  var nwQuad = Leaf();
  var seQuad = Leaf();
  var swQuad = Leaf();

  function getQuads(x1, y1, w, h, callback) {
      var x2 = x1 + w;
      var y2 = y1 + h;

      if (x2 > minX && x1 < midX) {
        if (y2 > minY && y1 < midY) {
          callback(nwQuad);
        }
        if (y2 > midY && y1 < maxY) {
          callback(swQuad);
        }
      }
      if (x2 > midX && x1 < maxX) {
        if (y2 >= minY && y1 < midY) {
          callback(neQuad);
        }
        if (y2 > midY && y1 < maxY) {
          callback(seQuad);
        }
      }
  }

  return {

    add: function(x, y, w, h, ID) {
      var found = false;
      // TODO worth the optimization of unrolling the code?
      getQuads(x, y, w, h, function(quad) {
        quad.add(x, y, w, h, ID);
        found = true;
      });

      if (!found) {
        // TODO better error message
        throw 'Error: out of bounds';
      }
    },

    remove: function(ID) {
      neQuad.remove(ID);
      nwQuad.remove(ID);
      seQuad.remove(ID);
      swQuad.remove(ID);
    },

    query: function(x, y, w, h) {
      var IDs = [];
      getQuads(x, y, w, h, function(quad) {
        Array.prototype.push.apply(IDs, quad.query(x, y, w, h));
      });
      return IDs;
    },

    queryMany: function(rects) {
      var IDs = [];

      for (var i = 0, ii = rects.length; i < ii; i++) {
        var r = rects[i];
        getQuads(r[0], r[1], r[2], r[3], function(quad) {
          Array.prototype.push.apply(IDs, quad.query(r[0], r[1], r[2], r[3]));
        });
      }
      return IDs;
    },
  };
};
