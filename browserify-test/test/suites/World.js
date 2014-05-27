var World = require('../../src/World').World;

/*
  Testing that World exists and can be called without error.
*/
test('basic create', function() {
  World(0, 0, 10, 10);
});

/*
  A World object manages objects in a 2D grid.
  World.add() is used to add objects to this grid, and
  World.query() is used to find objects in the grid.

  This is testing the most basic use of those methods.
*/
test('basic add and query', function() {
  var world = World(0, 0, 10, 10);
  var objA = world.add(2, 2, 1, 1);

  var res = world.query(0, 0, 10, 10);
  assert.deepEqual(res, [objA]);

  var res = world.query(2, 2, 1, 1);
  assert.deepEqual(res, [objA]);
});

/*
  Sometimes it's handy to query multiple rectangles at once,
  resulting in a unique list of objects in all those rectangles.

  That's what world.queryMany(rects) is for.
*/
test('queryMany', function() {
  var world = World(0, 0, 10, 10);
  var objA = world.add(2, 2, 2, 2);
  var objB = world.add(6, 6, 2, 2);

  var res = world.queryMany([2, 2, 1, 1], [6, 6, 4, 4]);
  assert.deepEqual(res, [objA, objB]);
});

/*
  World objects can be removed with obj.remove()
*/
test('remove', function() {
  var world = World(0, 0, 10, 10);
  var objA = world.add(2, 2, 1, 1);
  objA.remove();

  var res = world.query(0, 0, 10, 10);
  assert.equal(res.length, 0);
});

/*
  Get the position of a world object with obj.getPosition()
*/
test('getPosition', function() {
  var world = World(0, 0, 10, 10);
  var objA = world.add(2, 2, 1, 1);
  var pos = objA.getPosition();
  assert.deepEqual(pos, {x: 2, y: 2});
});

/*
  World objects can be moved with obj.setPosition(x, y)
*/
test('setPosition', function() {
  var world = World(0, 0, 10, 10);
  var objA = world.add(2, 2, 1, 1);
  objA.setPosition(3, 3);

  var pos = objA.getPosition();
  assert.deepEqual(pos, {x: 3, y: 3});

  var res = world.query(3, 3, 1, 1);
  assert.deepEqual(res, [objA]);
});

/*
  World objects come with event managers.
*/
test('world object event managers', function() {
  var world = World(0, 0, 10, 10);
  var objA = world.add(2, 2, 1, 1);
  var listener = sinon.spy();
  objA.events.on('some event', listener);
  assert(listener.notCalled);
  objA.events.trigger('some event');
  assert(listener.calledOnce);
});

/*
  It's very handy to be able to broadcast an event to all the objects
  in some area of the grid.

  For example, in gameplay you might attack an area of the grid, so
  you want to broadcast a "hit" event to part of the grid, affecting
  all objects in that rectangle. You'd use World.broadcast() to do that.

  World objects can register event listeners with obj.events.on().
*/
test('broadcast events', function() {
  var world = World(0, 0, 10, 10);
  var objA = world.add(2, 2, 1, 1);
  var objB = world.add(3, 3, 2, 2);
  var objC = world.add(6, 6, 1, 1);

  var listenerA = sinon.spy();
  var listenerB = sinon.spy();
  var listenerC = sinon.spy();

  objA.events.on('event foo', listenerA);
  objB.events.on('event foo', listenerB);
  objC.events.on('event foo', listenerC);

  world.broadcast('event foo', 2, 2, 4, 4);

  assert(listenerA.calledOnce);
  assert(listenerB.calledOnce);
  assert(listenerC.notCalled);
});
