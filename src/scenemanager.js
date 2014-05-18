'use strict';

define(function() {

  var scenes = {};
  var current;

  return {

    // TODO this probably belongs somewhere else
    loadWorld: function(path) {
      var world = loadWorld(path, sceneManager);
      worlds.push(world);
    },

    addScene: function(name, scene) {
      // TODO or could use an event, e.g. 'load scene: main'
      scenes[name] = scene;
    },

    load: function(name) {
      var next = scenes[name];

      if (!next) {
        throw 'Error: unknown scene ' + name;
      }

      // TODO i'm getting scattered on terminology here
      //      enable/disable, start/stop, load/unload
      if (current) {
        current.disable();
      }
      next.enable();
      current = next;
    },

    unload: function() {
      if (current) {
        current.disable();
        current = false;
      }
    },
  }
});
