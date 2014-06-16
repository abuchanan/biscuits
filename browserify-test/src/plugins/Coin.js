import {Inject, InjectLazy} from 'di';
import {Body} from 'src/world';
import {SceneScope} from 'src/scope';
import {Renderer} from 'src/render';

export {CoinLoader};

@SceneScope
@Inject(Renderer)
@InjectLazy(Body)
function CoinLoader(renderer, createBody) {
  // TODO test that renderables are removed from renderer when scene is unloaded
  var layer = renderer.getLayer('objects');

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
      // TODO test for this
      layer.removeChild(g);
    });

    var g = renderer.createGraphic();
    g.beginFill(0xF0F074);
    g.drawRect(x, y, w, h);
    g.endFill();
    layer.addChild(g);
  }
}
