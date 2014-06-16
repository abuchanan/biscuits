import {Inject} from 'di';
import {Renderer} from 'src/render';

@SceneScope
@Inject(Renderer, PlayerCoins, Scene)
function HUD(renderer, coins, scene) {
  var layer = renderer.getLayer('hud');

  // TODO hard-coded player object ID is weird
  //      player should probably be injectable anyway
  var player = scene.getObject('player-1');

  scene.events.on('scene tick', function() {
    
  });
}
