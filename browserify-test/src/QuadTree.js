import {Inject, TransientScope} from 'di';
import {SceneScope} from 'src/scope';

// TODO note that it only stores int/string IDs
//      I don't support storing arbitrary data (e.g. objects)
//      because I want to keep this simple and efficient, and it's easy enough to
//      map those IDs to arbitrary data outside of the quadtree.
export {QuadTree};

// TODO the @TransientScope is critical here, and it will be
//      for anything created with InjectLazy.
@TransientScope
@Inject('quadtree-config')
class QuadTree {

  //constructor(minX, minY, treeW, treeH) {
  constructor(config) {
    // TODO var maxChildren = 10;

    this._minX  = config.x;
    this._minY  = config.y;
    this._maxX = this._minX + config.w;
    this._maxY = this._minY + config.h;
    this._midX = this._maxX / 2;
    this._midY = this._maxY / 2;

    this._neQuad = new Leaf();
    this._nwQuad = new Leaf();
    this._seQuad = new Leaf();
    this._swQuad = new Leaf();
  }

  _getQuads(x1, y1, w, h, callback) {
    var x2 = x1 + w;
    var y2 = y1 + h;

    if (x2 > this._minX && x1 < this._midX) {
      if (y2 > this._minY && y1 < this._midY) {
        callback(this._nwQuad);
      }
      if (y2 > this._midY && y1 < this._maxY) {
        callback(this._swQuad);
      }
    }
    if (x2 > this._midX && x1 < this._maxX) {
      if (y2 >= this._minY && y1 < this._midY) {
        callback(this._neQuad);
      }
      if (y2 > this._midY && y1 < this._maxY) {
        callback(this._seQuad);
      }
    }
  }

  add(x, y, w, h, ID) {
    var found = false;
    // TODO worth the optimization of unrolling the code?
    this._getQuads(x, y, w, h, function(quad) {
      quad.add(x, y, w, h, ID);
      found = true;
    });

    if (!found) {
      // TODO better error message
      console.log(x, y, w, h, ID, this._minX, this._minY, this._maxX, this._maxY);
      throw 'Error: out of bounds';
    }
  }

  remove(ID) {
    this._neQuad.remove(ID);
    this._nwQuad.remove(ID);
    this._seQuad.remove(ID);
    this._swQuad.remove(ID);
  }

  query(x, y, w, h) {
    var IDs = [];
    this._getQuads(x, y, w, h, function(quad) {
      Array.prototype.push.apply(IDs, quad.query(x, y, w, h));
    });
    return IDs;
  }

  queryMany(rects) {
    var IDs = [];

    for (var i = 0, ii = rects.length; i < ii; i++) {
      var r = rects[i];
      this._getQuads(r[0], r[1], r[2], r[3], function(quad) {
        Array.prototype.push.apply(IDs, quad.query(r[0], r[1], r[2], r[3]));
      });
    }
    return IDs;
  }
}


class Leaf {

  constructor() {
    this._data = {};
  }

  add(x1, y1, w, h, ID) {
    var x2 = x1 + w;
    var y2 = y1 + h;

    this._data[ID] = function(qx1, qy1, qw, qh) {
      var qx2 = qx1 + qw;
      var qy2 = qy1 + qh;
      return qx2 > x1 && qx1 < x2 && qy2 > y1 && qy1 < y2;
    };
  }

  remove(ID) {
    delete this._data[ID];
  }

  query(x, y, w, h) {
    var IDs = [];
    for (var ID in this._data) {
      var bb = this._data[ID];
      if (this._data[ID](x, y, w, h)) {
        IDs.push(ID);
      }
    }
    return IDs;
  }
}
