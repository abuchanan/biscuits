import {Provide} from 'di';
import Shortcut from 'lib/Shortcut';
import {EventEmitter} from 'src/events';
import {SceneScope} from 'src/scope';
import {Scene} from 'src/scene';

export {KeyboardInput, Input};


class Input {
  constructor() {
    this.Up = false;
    this.Down = false;
    this.Left = false;
    this.Right = false;
    this.Use = false;
    this.Attack = false;
  }
}

class KeyboardInput {

  constructor(input: Input, shortcutjs: Shortcut) {

    var keyDownOptions = {
      propagate: false,
    };

    var keyUpOptions = {
      type: 'keyup',
    };

    function add(keyname, eventname) {
      eventname = eventname || keyname;

      shortcutjs.add(keyname, function() {
          input[eventname] = true;
      }, keyDownOptions);

      shortcutjs.add(keyname, function() {
          input[eventname] = false;
      }, keyUpOptions);
    }

    add('Up');
    add('Down');
    add('Left');
    add('Right');
    add('E', 'Use');
    add('F', 'Attack');
  }
}
