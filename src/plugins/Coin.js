import {Inject} from 'di';
import {Body} from 'src/world';
import {ObjectScope} from 'src/scope';
import {Renderer} from 'src/render';
import {CoinPurse} from 'src/plugins/Player';

export {
  CoinConfig,
  CoinRenderer,
  CoinCollision
};

class CoinConfig {
  constructor(value = 1) {
    this.value = value;
  }
}


@ObjectScope
@Inject(Renderer, Body)
function CoinRenderer(renderer, body) {
  var layer = renderer.getLayer('objects');
  var rect = body.getRectangle();

  var g = renderer.createGraphic();
  g.beginFill(0xF0F074);
  g.drawRect(rect.x, rect.y, rect.w, rect.h);
  g.endFill();
  layer.addChild(g);

  return {
    clear: function() {
      layer.removeChild(g);
    }
  }
}


@ObjectScope
@Inject(CoinConfig, Body, CoinRenderer)
function CoinCollision(config, body, coinRenderer) {
  body.events.on('player collision', function(playerBody) {
    body.remove();
    var coinPurse = playerBody.obj.get(CoinPurse);
    coinPurse.deposit(config.value);
    // TODO test for this
    coinRenderer.clear();
  });
}

// TODO test that renderables are removed from renderer when scene is unloaded