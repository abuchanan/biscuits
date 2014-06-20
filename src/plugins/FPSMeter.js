import {SceneScope} from 'src/scope';
import {Scene} from 'src/scene';
// TODO need to figure out the canonical way to work with third-party modules
import FPSMeter from 'lib/fpsmeter';

export {FPSMeterPlugin};

@SceneScope
function FPSMeterPlugin(scene: Scene) {

  var meter = new FPSMeter.FPSMeter({
    top: 'auto',
    left: 'auto',
    bottom: '5px',
    right: '5px',
  });

  // TODO not sure if scene tick should be directly related to frame tick or not
  scene.events.on('scene tick', meter.tick.bind(meter));
}
