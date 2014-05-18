function Layers() {
  PIXI.DisplayObjectContainer.call(this);
  this._frameListeners = [];
}
Layers.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
Layers.prototype.constructor = Layers;
Layers.prototype.newLayer = function() {
  var layer = new Layers();
  this.addChild(layer);
  return layer;
};
Layers.prototype.invokeFrameListeners = function() {
  if (!this.visible) {
    return;
  }

  var listeners = this._frameListeners;
  for (var i = 0, ii = listeners.length; i < ii; i++) {
    listeners[i].call(this);
  }

  var children = this.children;
  for (var i = 0, ii = children.length; i < ii; i++) {
    var child = children[i];
    if (child.invokeFrameListeners) {
      child.invokeFrameListeners();
    }
  }
};
Layers.prototype.addFrameListener = function(callback) {
  this._frameListeners.push(callback);
};
Layers.prototype.enable = function() {
  this.visible = true;
};
Layers.prototype.disable = function() {
  this.visible = false;
};
