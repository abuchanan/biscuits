import PIXI from 'lib/pixi';
import {SceneScope} from 'src/scope';
import {Renderer} from 'src/render';

export {HUD};

@SceneScope
function HUD(renderer: Renderer) {
  var layer = renderer.getLayer('hud');

  var coinText = new PIXI.Text('Coins: 0');
  var keyText = new PIXI.Text('Keys: 0');
  // TODO hard-coded
  keyText.position.y = 32;

  layer.addChild(coinText);
  layer.addChild(keyText);

  return {
    setCoins: (val) => { coinText.setText('Coins: ' + val); },
    setKeys: (val) => { keyText.setText('Keys: ' + val); },
  };
}
