// TODO external plugins will need something like require('biscuits/ObjectLoader');
module ObjectLoader from 'src/ObjectLoader';

ObjectLoader.events.on('load coin', loadCoinObject);

function loadCoinObject(def, obj, scene) {
  var x = def.x;
  var y = def.y;
  var w = def.w;
  var h = def.h;
  var value = def.coinValue || 1;

  var body = scene.world.add(x, y, w, h);

/* TODO
  var g = new PIXI.Graphics();
  g.beginFill(0xF0F074);
  g.drawRect(x, y, w, h);
  g.endFill();
  container.addChild(g);
*/

  body.events.on('player collision', function(player) {
    body.remove();
    player.coins.deposit(value);
    //container.removeChild(g);
  });
}
