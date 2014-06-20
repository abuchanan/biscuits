// TODO if this name is missing from the module, no import error is thrown.
//      it's just "undefined" which totally sucks.
import {Body} from 'src/world';
import {ObjectScope} from 'src/scope';
import {Renderer} from 'src/render';
import {CoinPurse} from 'src/plugins/Player';

export {
  ChestConfig,
  ChestRenderer,
  ChestUseable,
};

// TODO contain things other than coins

class ChestConfig {
  constructor(value = 1) {
    this.value = value;
    this.isOpen = false;
  }
}


@ObjectScope
function ChestRenderer(renderer: Renderer, body: Body) {
  var layer = renderer.getLayer('objects');
  var rect = body.getRectangle();

  // TODO handle isOpen == true on initialization

  var g = renderer.createGraphic();
  g.beginFill(0x00FFFF);
  g.drawRect(rect.x, rect.y, rect.w, rect.h);
  g.endFill();
  layer.addChild(g);

  return {
    renderOpened: function() {
      g.clear();
      g.beginFill(0x0000FF);
      g.drawRect(rect.x, rect.y, rect.w, rect.h);
      g.endFill();
    }
  };
}


@ObjectScope
function ChestUseable(body: Body, config: ChestConfig,
                      chestRenderer: ChestRenderer) {

  body.events.on('use', function(usedBy) {
    if (!config.isOpen) {
      config.isOpen = true;
      // TODO this pattern is interesting. what happens when the object doesn't
      //      have a coin purse? Error thrown? Returns undefined
      var coinPurse = usedBy.obj.get(CoinPurse);
      coinPurse.deposit(config.value);
      chestRenderer.renderOpened();
    }
  });
}
