import EventEmitter from 'lib/EventEmitter';
import {World} from 'src/World';
// TODO keybindings

export function Scene() {
  // TODO
  var world = World(0, 0, 40, 40);
  var events = new EventEmitter();

  var worldObjects = {};

  var scene = {
    // TODO promise or function that returns a promise?
    loadDependsOn: function(promise) {
    },
    unloadDependsOn: function(promise) {
    },
    addObject: function(ID, worldObj) {
      // TODO catch duplicate ID
      worldObjects[ID] = worldObj;
    },
    getElementById: function(ID) {
      // TODO handle key error
      return worldObjects[ID];
    },
    world: world,
    // TODO includes key events
    events: events,
  };

  return scene;
}
