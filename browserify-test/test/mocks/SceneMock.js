'use strict';

var WorldMock = require('test/mocks/World');
var EventsMock = require('test/mocks/EventEmitter');

module.exports = function() {

  var events = new EventsMock();

  var scene = {
    world: WorldMock(),
    container: {},
    load: function() {},
    events: events
  };
  scene.mock = sinon.mock(scene);

  return scene;
}
