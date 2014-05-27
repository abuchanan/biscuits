/* Helpers for integration testing of a scene */

function MockKeybindings() {
  var events = new EventEmitter();
  return {
    enable: function() { enabled = true; },
    disable: function() { enabled = false; },
    events: events,
    trigger: 
  };
}

// TODO how to get ahold of player to verify things like position?
//   or how to get ahold of a chest to verify that it opened?
//   maybe pass in a mock world that can keep track of the objects added
//   for every load() call?
loader.load({x: 1, y: 1, w: 1, h: 1, type: 'block'});
loader.load({x: 1, y: 1, w: 1, h: 1, type: 'chest'});
loader.load({x: 1, y: 1, w: 1, h: 1, type: 'player'});

// TODO create some test util to support this pattern
var player = world.add.lastReturned();

function buildState() {
  return {
    player: {
      position: player.getPosition(),
      direction: 'down',
    }
  };
}

// TODO
var expectedState = 

// ...etc
var scene = 

keys.trigger('Up');
keys.trigger('Use');

// TODO this style, or set the expected state of the whole scene,
//      and check everything? that way, if a coin was accidentally added
//      that you weren't expecting to test, you'd catch it.
expectedState.player.position.y = 0;
expectedState.player.direction = 'up';

assert.deepEqual(state, expectedState);

/*
TODO

log events
set expectations on events that occur, such as
- player collision
- player change position
- player move blocked
- sword damage
- open chest
- pickup coins
- load point (rename spawn point?)
- etc
*/
