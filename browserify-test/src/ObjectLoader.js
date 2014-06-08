// TODO document that this is a singleton service

// TODO
// ObjectLoader could be replaced with a dependency injection system

import EventEmitter from 'lib/EventEmitter';

export var events = new EventEmitter();

export function loadObject(def, scene) {
  // TODO catch missing type property
  // TODO default world object properties?
  var worldObj = {};
  events.trigger('load ' + def.type, [def, worldObj, scene]);
  return worldObj;
}
