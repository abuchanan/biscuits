import PIXI from 'lib/pixi';
import {SceneScope} from 'src/scope';
import {Renderer} from 'src/render';
import {CoinPurse} from 'src/plugins/Player';
import {KeyPurse} from 'src/plugins/key';
import {Scene} from 'src/scene';

export {HUD};

@SceneScope
function HUD(renderer: Renderer, scene: Scene) {
  var layer = renderer.getLayer('hud');

  var coinText = new PIXI.Text('');
  var keyText = new PIXI.Text('');
  // TODO hard-coded
  keyText.position.y = 32;

  layer.addChild(coinText);
  layer.addChild(keyText);

  // TODO hard-coded player object ID is weird
  //      player should probably be injectable anyway
  var player = scene.getObject('player');
  // TODO not sure I like CoinPurse after all
  var coins = player.get(CoinPurse);
  var keys = player.get(KeyPurse);

  scene.events.on('tick', function() {
    coinText.setText('Player coins: ' + coins.balance());
    keyText.setText('Player keys: ' + keys.balance());
  });
}
