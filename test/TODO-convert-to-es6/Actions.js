export var skip = true;

var Actions = require('src/Actions.js');
var MockBody = require('test/mocks/Body');

var manager;

setup(function() {
  manager = Actions.Manager();
  actionOne = Actions.Action();
  actionTwo = Actions.Action();
});

test('action default duration', function() {
  var action = Actions.Action();
  assert.equal(action.duration, Actions.actionDefaults.duration);
});


test('movement', function() {
  var body = MockBody();
  var moveRight = Actions.Movement(body, 'right', {deltaX: 1});

  // Just to make the initial state obvious...
  assert.deepEqual(body.getPosition(), {x: 0, y: 0});
  assert.equal(body.getDirection(), 'down');

  // Now move
  moveRight.events.trigger('action start');
  assert.deepEqual(body.getPosition(), {x: 1, y: 0});
  assert.equal(body.getDirection(), 'right');
  moveRight.events.trigger('action start');
  assert.deepEqual(body.getPosition(), {x: 2, y: 0});
});

test('movement.interpolatePosition(percentage) when never moved', function() {
  var body = MockBody();
  var move = Actions.Movement(body, 'noop');
  var pos = move.interpolatePosition(.5);
  assert.deepEqual(pos, {x: 0, y: 0});

  var move = Actions.Movement(body, 'right', {deltaX: 1});
  move.events.trigger('action start');
  var pos = move.interpolatePosition(.5);
  assert.deepEqual(pos, {x: 0.5, y: 0});
});


// TODO the reset are manager tests
test('default state', function() {
  var state = manager.getState();
  assert.deepEqual(state, {action: 'stop', percentComplete: 0});
});

test('action duration', function() {
  var actionOneStart = sinon.spy();
  var actionOneEnd = sinon.spy();
  actionOne.events.on('action start', actionOneStart);
  actionOne.events.on('action end', actionOneEnd);

  manager.start(actionOne);
  manager.tick(1);
  assert(actionOneStart.called);
  assert(actionOneEnd.notCalled);

  manager.tick(151);
  // We're past the duration of the action, but we haven't switched/stopped
  // actions so it keeps running.
  assert(actionOneEnd.notCalled);

  manager.start(actionTwo);
  manager.tick(155);
  assert(actionOneEnd.notCalled);

  manager.tick(352);
  assert(actionOneEnd.called);
  assert.equal(manager.getState().action, actionTwo);
});

test('state percent complete', function() {
  manager.start(actionOne);
  manager.tick(0);
  assert.equal(manager.getState().percentComplete, 0);
  manager.tick(15);
  assert.equal(manager.getState().percentComplete, 0.1);
});

test('action loop', function() {
  manager.start(actionOne);
  manager.tick(0);
  assert.equal(manager.getState().percentComplete, 0);

  var start = sinon.spy();
  var end = sinon.spy();
  actionOne.events.on('action start', start);
  actionOne.events.on('action end', end);

  manager.tick(225);
  assert.equal(manager.getState().percentComplete, 0.5);
  assert(start.notCalled);
  assert(end.notCalled);

  manager.tick(375);
  assert.equal(manager.getState().percentComplete, 0.5);
  assert(start.notCalled);
  assert(end.notCalled);
});

test('start action that is already started', function() {
  manager.start(actionOne);
  manager.tick(0);
  assert.equal(manager.getState().percentComplete, 0);

  var actionOneStart = sinon.spy();
  var actionOneEnd = sinon.spy();
  actionOne.events.on('action start', actionOneStart);
  actionOne.events.on('action end', actionOneEnd);

  // This has no effect because the action is already running
  manager.start(actionOne);
  manager.tick(75);
  assert.equal(manager.getState().percentComplete, 0.5);
  assert(actionOneStart.notCalled);
  assert(actionOneEnd.notCalled);

  manager.tick(225);
  assert.equal(manager.getState().percentComplete, 0.5);
  assert(actionOneStart.notCalled);
  assert(actionOneEnd.notCalled);
});

test('start action before previous action finished', function() {
  manager.start(actionOne);
  manager.tick(1);
  assert.equal(manager.getState().action, actionOne);
  manager.start(actionTwo);
  manager.tick(2);
  assert.equal(manager.getState().action, actionOne);
  manager.tick(152);
  assert.equal(manager.getState().action, actionTwo);
});

test('stop action', function() {
  manager.start(actionOne);
  manager.tick(1);
  assert.equal(manager.getState().action, actionOne);
  manager.stop(actionOne);
  manager.tick(152);
  assert.equal(manager.getState().action, 'stop');
});

test('stop action when already finished', function() {
  manager.start(actionOne);
  manager.tick(1);
  assert.equal(manager.getState().action, actionOne);
  manager.stop(actionOne);
  manager.tick(152);
  assert.equal(manager.getState().action, 'stop');
  manager.stop(actionOne);
  manager.tick(153);
  assert.equal(manager.getState().action, 'stop');
});

test('stop action that is not currently running', function() {
  manager.start(actionOne);
  manager.tick(1);
  assert.equal(manager.getState().action, actionOne);
  manager.stop(actionTwo);
  manager.tick(152);
  assert.equal(manager.getState().action, actionOne);
  manager.tick(400);
  assert.equal(manager.getState().action, actionOne);
});

test('stop all', function() {
  manager.start(actionOne);
  manager.tick(1);
  assert.equal(manager.getState().action, actionOne);
  manager.stopAll();
  manager.tick(152);
  assert.equal(manager.getState().action, 'stop');
});
