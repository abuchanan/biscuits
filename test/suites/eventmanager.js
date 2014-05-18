suite('EventManager', function() {

/*
  Testing the EventManager exists and can be called without error.
*/
test('basic create', function() {
  EventManager();
});

/*
  EventManager is a simple utility for managing a set of event listeners,
  and invoking those listeners.

  Create a manager:
    var manager = EventManager();

  Add a listener:
    manager.addListener('some event name', callbackFunction);

  Invoke that event listener:
    manager.fire('some event name');
*/
test('event listener management', function() {
  var m = EventManager();
  var listenerOne = sinon.spy();
  var listenerTwo = sinon.spy();

  m.addListener('event A', listenerOne);
  m.addListener('event A', listenerTwo);
  m.addListener('event B', listenerTwo);

  m.fire('event A');

  assert(listenerOne.calledOnce);
  assert(listenerTwo.calledOnce);

  listenerOne.reset();
  listenerTwo.reset();

  m.fire('event B');

  assert(listenerOne.notCalled);
  assert(listenerTwo.calledOnce);
});

/*
  Adding a listener callback multiple times will result in the callback
  being invoked multiple times.

  In other words, listener callback functions do not have a unique identity
  in the eyes of EventManager.
*/
test('add listener multiple times', function() {
  var m = EventManager();
  var listenerOne = sinon.spy();

  m.addListener('event A', listenerOne);
  m.addListener('event A', listenerOne);

  m.fire('event A');

  assert.equal(listenerOne.callCount, 2);
});


/*
  EventManager can fire an event with no listeners without error.
*/
test('will fire an event with no listeners without error', function() {
  var m = EventManager();
  m.fire('event A');
});


});
