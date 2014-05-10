function Position(x, y) {
  this._x = x;
  this._y = y;
  this._listeners = [];
}

Position.prototype = {

  getX: function() {
    return this._x;
  },

  getY: function() {
    return this._y;
  },

  // TODO overloaded arguments to allow position.set(otherPosition)
  set: function() {
    var old = new Position(this._x, this._y);

    if (arguments.length == 1) {
      var other = arguments[0];
      this._x = other.getX();
      this._y = other.getY();

    } else if (arguments.length == 2) {
      this._x = arguments[0];
      this._y = arguments[1];
    }
    this._triggerChangeEvent(this, old);
  },

  setX: function(x) {
    this.set(x, this._y);
  },

  setY: function(y) {
    this.set(this._x, y);
  },

  onChange: function(callback) {
    this._listeners.push(callback);
  },

  _triggerChangeEvent: function(newPosition, oldPosition) {
    var listeners = this._listeners;
    for (var i = 0, ii = listeners.length; i < ii; i++) {
      listeners[i].call(this, newPosition, oldPosition);
    }
  },
};
