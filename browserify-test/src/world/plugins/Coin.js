import {Inject, InjectLazy} from 'di';
import {Body} from 'src/world';
import {SceneScope} from 'src/scene';

export {CoinLoader};

@SceneScope
@InjectLazy(Body)
function CoinLoader(createBody) {
  return function(def, obj) {
    var x = def.x;
    var y = def.y;
    var w = def.w;
    var h = def.h;
    // TODO don't bother with default values. fail on missing value.
    var value = def.coinValue || 1;

    var bodyConfig = {
      x: def.x,
      y: def.y,
      w: def.w,
      h: def.h,
      obj: obj,
    };

    obj.body = createBody('body-config', bodyConfig);

    obj.events.on('player collision', function(player) {
      obj.body.remove();
      player.coins.deposit(value);
      // TODO container.removeChild(g);
    });
  }
}

/* TODO
  var g = new PIXI.Graphics();
  g.beginFill(0xF0F074);
  g.drawRect(x, y, w, h);
  g.endFill();
  container.addChild(g);
*/
