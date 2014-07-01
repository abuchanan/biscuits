import {SceneScope} from 'src/scope';
import {SceneManager} from 'src/scenemanager';
import {Scene} from 'src/scene';
// TODO need to figure out the canonical way to work with third-party modules
import FPSMeter from 'lib/fpsmeter';

export {FPSMeterPlugin};

@SceneScope
function FPSMeterPlugin(sceneManager: SceneManager) {

  var meter = new FPSMeter.FPSMeter({
    top: 'auto',
    left: 'auto',
    bottom: '5px',
    right: '5px',
  });

  // TODO ugh. @SceneScope here sucks!
  //      forget it and the whole app breaks
  @SceneScope
  function startMeter(scene: Scene) {
    // TODO not sure if scene tick should be directly related to frame tick or not
    scene.events.on('scene tick', meter.tick.bind(meter));
  }

  sceneManager.plugins.push(startMeter);
}
