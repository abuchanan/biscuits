var EventEmitter = require('../lib/EventEmitter');

exports.WorldLoader = function() {
  return {
    events: new EventEmitter()
  };
}
