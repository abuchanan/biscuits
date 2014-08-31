import {Provide} from 'di';
import {Body} from 'src/world';
import {ObjectScope} from 'src/scope';
import {Renderer} from 'src/render';
import {CoinPurse} from 'src/plugins/Player';
import {Types} from 'src/worldscene';
import {Loader} from 'src/utils';
import {ObjectConfig} from 'src/config';


class CoinConfig {
  constructor(value = 1) {
    this.value = value;
  }
}


@ObjectScope
function CoinRenderer(renderer: Renderer, body: Body) {
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
function CoinCollision(config: CoinConfig, body: Body,
                       coinRenderer: CoinRenderer) {

  body.events.on('player collision', function(playerBody) {
    body.remove();
    var coinPurse = playerBody.obj.get(CoinPurse);
    coinPurse.deposit(config.value);
    // TODO test for this
    coinRenderer.clear();
  });
}

@ObjectScope
@Provide(CoinConfig)
function provideCoinConfig(config: ObjectConfig) {
  return {value: parseInt(config.coinValue)};
}


Types['coin'] = new Loader()
  .provides(provideCoinConfig)
  .runs(Body, CoinRenderer, CoinCollision);

// TODO test that renderables are removed from renderer when scene is unloaded
