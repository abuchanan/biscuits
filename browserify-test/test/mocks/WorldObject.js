'use strict';
// TODO require('sinon');
var EventEmitterMock = require('./EventEmitter');

module.exports = function() {
  var worldObj = {
    events: EventEmitterMock(),
    remove: function() {}
  };
  worldObj.mock = sinon.mock(worldObj);

  return worldObj;
};
