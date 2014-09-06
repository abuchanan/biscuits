import {SuperConstructor, Injector} from 'di';
import {Body} from 'src/world';
import {Scene} from 'src/scene';
import {Input} from 'src/input';
import {ObjectScope} from 'src/scope';
import {extend, Loader} from 'src/utils';
import EventEmitter from 'lib/EventEmitter';

export {
  Action,
  Movement,
  ActionManager,
  ActionDriver,
};


@ObjectScope
class ActionTime {
  now() {
    return Date.now();
  }
}


@ObjectScope
class Action {

  constructor(scene: Scene, events: EventEmitter, time: ActionTime) {

    this.events = events;
    this.scene = scene;
    this.config = {
      duration: 150,
    };
    this.time = time;
    this.startTime;
    this.percentComplete = 0;

    this._boundTick = this.tick.bind(this);
    this.running = false;
  }

  configure(c) {
    // TODO duration cannot be less than 0. check this.
    extend(this.config, c);
  }

  start() {

  // TODO this is a little off. say the current time is 20 ticks past
  //      the stop time of the current state. the current state will
  //      stop, but the next state will get a start time of now, instead
  //      of 20 ticks ago.
    this.startTime = this.time.now();
    this.percentComplete = 0;
    this.running = true;

    this.scene.events.on('tick', this._boundTick);
    this.events.trigger('start');
  }

  tick() {
    if (!this.running) {
      return;
    }

    // TODO what would happen if you changed duration in the middle of a move?
    var now = this.time.now();
    this.percentComplete = (now - this.startTime) / this.config.duration;

    if (this.percentComplete > 1) {
      this.percentComplete = 0;
      this.done();
    }
  }

  done() {
    this.running = false;
    this.scene.events.off('tick', this._boundTick);
    this.events.trigger('done');
  }
}


@ObjectScope
class Movement extends Action {

  constructor(superConstructor: SuperConstructor, body: Body) {
    superConstructor();
    this.body = body;

    // TODO name is required
    // TODO direction is required
    this.configure({
      deltaX: 0,
      deltaY: 0,
    });

    // TODO what's an appropriate default?
    this.lastPosition = {x: 0, y: 0};
    this.moving = false;
  }

  interpolatePosition() {
    if (!this.moving) {
      return this.lastPosition;
    }

    var last = this.lastPosition;
    var percent = this.percentComplete;

    return {
      x: last.x + (this.config.deltaX * percent),
      y: last.y + (this.config.deltaY * percent),
    };
  }

  start() {
    super.start();
    var body = this.body;
    var config = this.config;

    body.direction = config.direction;
    var pos = body.getPosition();

    try {

      // TODO if you change deltaX/deltaY on the action after creation,
      //      it wouldn't take effect here
      // TODO need a more elaborate canMoveTo(x, y) method. Might want to check
      //      whether player can move to location without actually moving there
      body.setPosition(pos.x + config.deltaX, pos.y + config.deltaY);
      this.lastPosition = pos;
      this.moving = true;

    } catch (e) {
      if (e == 'blocked') {
        this.done();
      } else {
        throw e;
      }
    }
  }
  
  done() {
    this.lastPosition = this.body.getPosition();
    this.moving = false;
    super.done();
  }
}


// TODO does an object need multiple managers?
@ObjectScope
function ActionManager() {

  var currentAction = false;
  var nextAction = false;

  function onDone() {
    currentAction.events.off('done', onDone);
    currentAction = false;
    switchState();
  }

  function switchState() {

    if (currentAction) {
      return;
    }

    if (nextAction) {
      currentAction = nextAction;
      nextAction = false;
      currentAction.events.on('done', onDone);
      currentAction.start();
    }
  }

  return {
    getState: function() {
      if (currentAction) {
        return currentAction;
      }
    },

    start: function(action) {
      if (!action) {
        return;
      }
      nextAction = action;
      switchState();
    },

    stop: function(action) {
      // Only stop if we're currently running the action that was
      // requested to be stopped.
      if (nextAction && nextAction === action) {
        nextAction = false;
      }
    },

    stopAll: function() {
      nextAction = false;
    },
  };
}


// TODO revisit the idea of ActionScope. it might have nice properties
//      around multiple action managers

// TODO I wouldn't want Action to depend on ActionManager. Is it possible to build
//      that sort of restriction into a language? The language would steer you towards
//      the SRP?


// TODO this is pretty awkward. need to think of a clean solution
@ObjectScope
function InputBinder(input: Input, scene: Scene, manager: ActionManager) {

  return function(name, action) {

    scene.events.on('tick', function() {

      if (input[name]) {
        manager.start(action);
      } else {
        manager.stop(action);
      }
    });
  }
}

function ActionDriver(config) {

  function driver(injector: Injector, bind: InputBinder) {
    for (var k in config) {
      var action = injector.get(config[k]);
      bind(k, action);
    }
  }
  driver.annotations = [new ObjectScope()];
  return driver;
}
