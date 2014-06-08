// TODO document as singleton
var EventEmitter = require('lib/EventEmitter');
var Shortcut = require('lib/Shortcut');

// TODO allow listening to a specific event? could be more efficient?

var shortcutjs = Shortcut();
var events = new EventEmitter();

var keyDownOptions = {
  propagate: false,
  //target: target,
};

var keyUpOptions = {
  //target: target,
  type: 'keyup',
};

function add(keyname, eventname) {
  eventname = eventname || keyname;

  shortcutjs.add(keyname, function() {
      events.trigger(eventname + ' keydown');
  }, keyDownOptions);

  shortcutjs.add(keyname, function() {
      events.trigger(eventname + ' keyup');
  }, keyUpOptions);
}

add('Up');
add('Down');
add('Left');
add('Right');
add('E', 'Use');
add('F', 'Sword');

exports.events = events;
