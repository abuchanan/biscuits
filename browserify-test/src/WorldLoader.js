var EventEmitter = require('lib/EventEmitter');

module.exports = Loader;

function Loader() {
  return {
    add: function(name, load, unload) {
    },
    load: function(name) {
    },
    events: new EventEmitter()
  };
}
