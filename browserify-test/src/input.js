import {Inject, Provide} from 'di';
import Shortcut from 'lib/Shortcut';
import {EventEmitter} from 'src/events';
import {SceneScope} from 'src/scope';
import {Scene} from 'src/scene';

export {KeyboardInput, Input};


class Input {
  constructor() {
    // TODO doesn't work for multiple keys at once
    //      think walking and firing at same time
    this.event;
  }
}

@Inject(Input)
class KeyboardInput {

  constructor(input) {
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
          input.event = eventname + ' keydown';
      }, keyDownOptions);

      shortcutjs.add(keyname, function() {
          input.event = eventname + ' keyup';
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
