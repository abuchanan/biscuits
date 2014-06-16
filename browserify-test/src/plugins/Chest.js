import {Inject, InjectLazy} from 'di';
// TODO if this name is missing from the module, no import error is thrown.
//      it's just "undefined" which totally sucks.
import {Body} from 'src/world';
import {SceneScope} from 'src/scope';
import {Renderer} from 'src/render';

export {ChestLoader};

@SceneScope
@Inject(Renderer)
@InjectLazy(Body)
function ChestLoader(renderer, createBody) {
  var layer = renderer.getLayer('objects');

  return function(def, obj) {
    // TODO contain things other than coins
    var value = def.coinValue || 1;
    var isOpen = false;

    var bodyConfig = {
      x: def.x,
      y: def.y,
      w: def.w,
      h: def.h,
      obj: obj,
      isBlock: true,
    };

    obj.body = createBody('body-config', bodyConfig);

    obj.events.on('use', function(player) {
      if (!isOpen) {
        isOpen = true;
        player.coins.deposit(value);

        g.clear();
        g.beginFill(0x0000FF);
        g.drawRect(def.x, def.y, def.w, def.h);
        g.endFill();
      }
    });

    var g = renderer.createGraphic();
    g.beginFill(0x00FFFF);
    g.drawRect(def.x, def.y, def.w, def.h);
    g.endFill();
    layer.addChild(g);
  }
}
