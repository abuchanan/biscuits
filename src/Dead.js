define(['lib/pixi'], function(PIXI) {

  function Dead(s) {
    var layer = s.renderer.getLayer('text');
    var text = new PIXI.Text("You're Dead!", {fill: 'white', align: 'center'});
    layer.addChild(text);
  }

  return Dead;
});
