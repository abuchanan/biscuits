/* Helpers for integration testing of a scene */

// TODO EventEmitter lies on the critical path of a few systems
//      yet it looks like it's inefficient

import {Scene} from 'src/Scene';
module ObjectLoader from 'src/ObjectLoader';

export function SceneScenario() {

  // TODO world size
  var scene = Scene();
  var time = 0;

  function tick(n) {
    time += n;
    scene.events.trigger('scene tick', [time]);
  }

  tick(0);

  var scenario = {
    scene: scene,

    loadObjects: function(defs) {
      defs.forEach(function(def) {
        var worldObj = ObjectLoader.loadObject(def, scene);
        scene.addObject(def.ID, worldObj);
      });
    },

    keypress: function(name) {
      scene.events.trigger(name + ' keydown');
      tick(1);

      scene.events.trigger(name + ' keyup');
      // TODO
      tick(200);
    },
  };

  return scenario;
}
