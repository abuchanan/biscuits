var EventEmitter = require('lib/EventEmitter');
var Shortcut = require('lib/Shortcut');

// TODO allow listening to a specific event? could be more efficient?
module.exports = function(target) {

  var shortcutjs = Shortcut();
  var events = new EventEmitter();
  var enabled = true;

  var keyDownOptions = {
    propagate: false,
    target: target,
  };

  var keyUpOptions = {
    target: target,
    type: 'keyup',
  };

  function add(keyname, eventname) {
    eventname = eventname || keyname;

    shortcutjs.add(keyname, function() {
      if (enabled) {
        events.trigger(eventname + ' keydown');
      }
    }, keyDownOptions);

    shortcutjs.add(keyname, function() {
      if (enabled) {
        events.trigger(eventname + ' keyup');
      }
    }, keyUpOptions);
  }

  add('Up');
  add('Down');
  add('Left');
  add('Right');
  add('E', 'Use');
  add('F', 'Sword');

  return {
    enable: function() { enabled = true; },
    disable: function() { enabled = false; },
    events: events
  };
};
