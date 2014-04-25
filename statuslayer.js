
function StatusLayerRenderable(player) {
  PIXI.DisplayObjectContainer.call(this);
  this.player = player;
  this.coinText = new PIXI.Text('Player coins: ' + player.coins);
  this.addChild(this.coinText);
}
StatusLayerRenderable.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
StatusLayerRenderable.prototype.constructor = StatusLayerRenderable;
StatusLayerRenderable.prototype.update = function() {
  this.coinText.setText('Player coins: ' + this.player.coins);
};
StatusLayerRenderable.prototype._renderCanvas = function(renderer) {
  this.update();
  PIXI.DisplayObjectContainer.prototype._renderCanvas.call(this, renderer);
};
StatusLayerRenderable.prototype._initWebGL = function(renderer) {
  this.update();
  PIXI.DisplayObjectContainer.prototype._initWebGL.call(this, renderer);
};
StatusLayerRenderable.prototype._renderWebGL = function(renderer) {
  this.update();
  PIXI.DisplayObjectContainer.prototype._renderWebGL.call(this, renderer);
};
