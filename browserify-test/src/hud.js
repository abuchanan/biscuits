import {Inject} from 'di';
import PIXI from 'lib/pixi';
import {SceneScope} from 'src/scope';
import {Renderer} from 'src/render';
import {PlayerCoins} from 'src/plugins/Player';
import {Scene} from 'src/scene';

export {HUD};

@SceneScope
@Inject(Renderer, PlayerCoins, Scene)
function HUD(renderer, coins, scene) {
  var layer = renderer.getLayer('hud');

  var coinText = new PIXI.Text('');
  layer.addChild(coinText);

  // TODO hard-coded player object ID is weird
  //      player should probably be injectable anyway
  var player = scene.getObject('player-1');

  scene.events.on('scene tick', function() {
    coinText.setText('Player coins: ' + coins.balance());
  });
}
