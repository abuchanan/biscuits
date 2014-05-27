var keybindings = require('src/keybindings');
var KeyEventsHelper = require('test/utils/KeyEventsHelper');

var element = document.createElement('div');
var helper = KeyEventsHelper(element);

var events, helper;

setup(function() {
  var kb = keybindings(element);
  events = kb.events;
});

function keyCallbackTest(name, keycode) {
  return function() {
    var downcb = sinon.spy();
    var upcb = sinon.spy();
    events.on(name + ' keydown', downcb);
    events.on(name + ' keyup', upcb);
    helper.keydown(keycode);
    helper.keyup(keycode);
    assert(downcb.calledOnce);
    assert(upcb.calledOnce);
  }
}

var keys = [
  ['Up', 38],
  ['Down', 40],
  ['Left', 37],
  ['Right', 39],
  ['Use', 69],
  ['Sword', 70],
];

for (var i = 0; i < keys.length; i++) {
  var keyName = keys[i][0];
  var keyCode = keys[i][1];
  test('key events for ' + keyName, keyCallbackTest(keyName, keyCode));
}

// TODO test enable/disable
