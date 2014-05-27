'use strict';

var EventEmitter = require('../../lib/EventEmitter');

module.exports = function() {
  var events = new EventEmitter();
  events.mock = sinon.mock(events);
  return events;
};
