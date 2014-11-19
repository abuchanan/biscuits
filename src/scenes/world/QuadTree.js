define(function() {

    function QuadTree(x, y, w, h) {

      // TODO var maxChildren = 10;

      var _minX = x;
      var _minY = y;
      var _maxX = _minX + w;
      var _maxY = _minY + h;
      var _midX = _maxX / 2;
      var _midY = _maxY / 2;

      var _neQuad = Leaf();
      var _nwQuad = Leaf();
      var _seQuad = Leaf();
      var _swQuad = Leaf();


      function _getQuads(x1, y1, w, h, callback) {
        var x2 = x1 + w;
        var y2 = y1 + h;

        if (x2 > _minX && x1 < _midX) {
          if (y2 > _minY && y1 < _midY) {
            callback(_nwQuad);
          }
          if (y2 > _midY && y1 < _maxY) {
            callback(_swQuad);
          }
        }
        if (x2 > _midX && x1 < _maxX) {
          if (y2 >= _minY && y1 < _midY) {
            callback(_neQuad);
          }
          if (y2 > _midY && y1 < _maxY) {
            callback(_seQuad);
          }
        }
      }

      function add(x, y, w, h, ID) {
        var found = false;
        // TODO worth the optimization of unrolling the code?
        _getQuads(x, y, w, h, function(quad) {
          quad.add(x, y, w, h, ID);
          found = true;
        });

        if (!found) {
          // TODO better error message
          console.log(x, y, w, h, ID, _minX, _minY, _maxX, _maxY);
          throw 'Error: out of bounds';
        }
      }

      function remove(ID) {
        _neQuad.remove(ID);
        _nwQuad.remove(ID);
        _seQuad.remove(ID);
        _swQuad.remove(ID);
      }

      function query(x, y, w, h) {
        var IDs = [];
        _getQuads(x, y, w, h, function(quad) {
          Array.prototype.push.apply(IDs, quad.query(x, y, w, h));
        });
        return IDs;
      }

      // World API
      return {
          add: add,
          remove: remove,
          query: query,
      };
    }


    function Leaf() {

      var _data = {};

      function add(x1, y1, w, h, ID) {
        var x2 = x1 + w;
        var y2 = y1 + h;

        _data[ID] = function(qx1, qy1, qw, qh) {
          var qx2 = qx1 + qw;
          var qy2 = qy1 + qh;
          return qx2 > x1 && qx1 < x2 && qy2 > y1 && qy1 < y2;
        };
      }

      function remove(ID) {
        delete _data[ID];
      }

      function query(x, y, w, h) {
        var IDs = [];
        for (var ID in _data) {
          var bb = _data[ID];
          if (_data[ID](x, y, w, h)) {
            IDs.push(ID);
          }
        }
        return IDs;
      }

      // Leaf API
      return {
        add: add,
        remove: remove,
        query: query,
      };
    }


    // Module exports
    return QuadTree;
});
