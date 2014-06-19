'use strict';

var EventEmitterMock = require('./EventEmitter');

module.exports = function() {
  var loader = {
    events: EventEmitterMock()
  };
  loader.mock = sinon.mock(loader);
  return loader;
};
