import {Inject} from 'di';
// TODO if this name is missing from the module, no import error is thrown.
//      it's just "undefined" which totally sucks.
import {BlockBody} from 'src/world';
import {factory} from 'src/utils';
import {SceneScope} from 'src/scene';

export {ChestLoader};

@SceneScope
@Inject(factory(BlockBody))
function ChestLoader(BlockBody) {
  return function(def, obj) {
    // TODO contain things other than coins
    var value = def.coinValue || 1;
    var isOpen = false;

    obj.body = new BlockBody(def.x, def.y, def.w, def.h, obj);

    obj.events.on('use', function(player) {
      if (!isOpen) {
        isOpen = true;
        player.coins.deposit(value);
      }
    });
  }
}

    /*
    var g = new PIXI.Graphics();
    g.beginFill(0x00FFFF);
    g.drawRect(x, y, w, h);
    g.endFill();
    container.addChild(g);
    */

        /*
        g.clear();
        g.beginFill(0x0000FF);
        g.drawRect(x, y, w, h);
        g.endFill();
        */
