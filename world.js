
// TODO a 3D index would be better than an array of indices.
function World(numLayers) {

  // TODO document "3" and make it easily configurable?
  this._index = [];
  for (var i = 0; i < numLayers; i++) {
    this._index[i] = rbush(3);
  }
}
World.prototype = {

  add: function(object, layerIdx, position, w, h) {

    w = w || 1;
    h = h || 1;

    var layer = this._index[layerIdx];
    if (!layer) {
      throw 'Missing layer ' + layerIdx;
    }

    var item;

    function insert() {
      var x = position.getX();
      var y = position.getY();
      var mX = x + w - 1;
      var mY = y + h - 1;
      item = [x, y, mX, mY, object];
      layer.insert(item);
    }

    insert();

    position.onChange(function(pos) {
      layer.remove(item);
      insert();
    });
  },

  query: function(x, y, maxX, maxY) {
    var mX = maxX || x;
    var mY = maxY || y;

    var q = [x, y, mX, mY];
    var items = [];

    for (var i = 0, ii = this._index.length; i < ii; i++) {
      var res = this._index[i].search(q);
      items.push.apply(items, res);
    }
    return items;
  },

  isBlocked: function(x, y) {
    var items = this.query(x, y);

    for (var i = 0, ii = items.length; i < ii; i++) {
      // TODO handling query results is a little clunky
      var obj = items[i][4];

      if (obj.isBlock) {
        return false;
      }
    }
    return true;
  },
};
