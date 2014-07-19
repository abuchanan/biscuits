import PIXI from 'lib/pixi';
import {SceneScope} from 'src/scope';
import {Renderer} from 'src/render';
import {CoinPurse} from 'src/plugins/Player';
import {Scene} from 'src/scene';

export {HUD};

@SceneScope
function HUD(renderer: Renderer, scene: Scene) {
  var layer = renderer.getLayer('hud');

  var coinText = new PIXI.Text('');
  layer.addChild(coinText);

  // TODO hard-coded player object ID is weird
  //      player should probably be injectable anyway
  var player = scene.getObject('player');
  // TODO not sure I like CoinPurse after all
  var coins = player.get(CoinPurse);

  scene.events.on('tick', function() {
    coinText.setText('Player coins: ' + coins.balance());
  });
}
