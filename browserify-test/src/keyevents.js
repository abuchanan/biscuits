import {Inject, Provide} from 'di';
import Shortcut from 'lib/Shortcut';
import {EventEmitter} from 'src/events';
import {SceneScope} from 'src/scope';
import {Scene} from 'src/scene';

export {GlobalKeyEvents, SceneKeyEvents};

// TODO this is a case where traversing annotations up the inheritance chain
//      wouldn't work. EventEmitter is transient and KeyEvents is not.
//      But maybe this doesn't need to inherit from EventEmitter,
//      it could have it injected instead.
// TODO Sooo, another quirk about di.js to figure out. If you extend a class
//      with annotations, and don't provide any annotations on the child
//      then the child will inherit the annotations of the parent. But,
//      if you add any annotation to the child, you lose all annotations
//      from the parent.
//
//      oooh, i see. so at first, the annotations don't exist on the class,
//      but once it's instantiated the first time, the call to super() brings
//      in the annotations from the parent class. if there are annotations on
//      the child, then they override (eclipse) the annotations from the
//      parent class.
//
//      or, maybe not. maybe I just had a code error and they actually
//      are inherited. round and round we go....

// TODO should be scene scoped or not? if i want scene services to live on
//      while paused in the background, then i want to have a keyevents service
//      per scene that can be paused. if i'm destroying the scene services,
//      then having a single keyevents service is fine, because nothing that
//      is not active will be listening to it.
@Inject(EventEmitter)
class GlobalKeyEvents {

  constructor(events) {
    // TODO I forgot this super() call and spent hours trying to figure out
    //      the issue. How could this be improved? Static analysis?
    // super();
    this._events = events;

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

  on(...args) {
    this._events.on.apply(this._events, args);
  }

  off(...args) {
    this._events.off.apply(this._events, args);
  }

  trigger(...args) {
    this._events.trigger.apply(this._events, args);
  }
}

/* TODO you can't depend on the provider that you are providing.
        this sucks because it means you can't wrap an existing
        provider.

@SceneScope
@Provide(KeyEvents)
@Inject(Scene, KeyEvents)
class SceneKeyEvents {
*/

@SceneScope
@Inject(Scene, GlobalKeyEvents)
class SceneKeyEvents {

  constructor(scene, keyevents) {
    this._listeners = [];
    this._events = keyevents;

    var self = this;

    scene.events.on('unload', function() {
      // TODO should be _listeners.pop or _listeners should be reset.
      self._listeners.forEach((listener) => {
        keyevents.off.apply(keyevents, listener);
      });
    });
  }

  on(...args) {
    this._events.on.apply(this._events, args);
    this._listeners.push(args);
  }

  off(...args) {
    // TODO should remove from _listeners
    this._events.off.apply(this._events, args);
  }

  trigger(...args) {
    this._events.trigger.apply(this._events, args);
  }
}
