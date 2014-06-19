'use strict';

module.exports = function() {
  var world = {
    add: function() {},
  };
  world.mock = sinon.mock(world);
  return world;
};
