define(['lib/pixi'], function(PIXI) {

  function Dead(scene) {
    var layer = scene.renderer.getLayer('text');
    var text = new PIXI.Text("You're Dead!", {fill: 'white', align: 'center'});
    layer.addChild(text);
  }

  return Dead;
});
