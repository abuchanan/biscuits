
function StatusLayerRenderer(player, container) {
  var coinText = new PIXI.Text('Player coins: ' + player.coins);
  var layer = container.newLayer();
  layer.addChild(coinText);

  layer.addFrameListener(function() {
    coinText.setText('Player coins: ' + player.coins);
  });
}
