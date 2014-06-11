import Shortcut from 'lib/Shortcut';
import {EventEmitter} from 'src/events';
import {SceneScope} from 'src/scene';

export {KeyEvents};

// TODO this is a case where traversing annotations up the inheritance chain
//      wouldn't work. EventEmitter is transient and KeyEvents is not.
//      But maybe this doesn't need to inherit from EventEmitter,
//      it could have it injected instead.
@SceneScope
//@Inject(EventEmitter)
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
