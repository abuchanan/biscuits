import {Inject} from 'di';
import {EventEmitter} from 'src/events';
import Shortcut from 'lib/Shortcut';
import {SceneScope} from 'src/scene';

export {KeyEvents};
// TODO allow listening to a specific event? could be more efficient?

/*
@Inject(EventEmitter)
function KeyEvents(events) {
  // TODO inject this
  var shortcutjs = Shortcut();

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

  return events;
}
*/

@SceneScope
class KeyEvents extends EventEmitter {
  constructor() {
    // TODO I forgot this super() call and spent hours trying to figure out
    //      the issue. How could this be improved? Static analysis?
    super();

    // TODO inject this
    var shortcutjs = Shortcut();

    var keyDownOptions = {
      propagate: false,
      //target: target,
    };

    var keyUpOptions = {
      //target: target,
      type: 'keyup',
    };

    var events = this;

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
  }
}
