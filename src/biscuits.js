'use strict';

define(['events', 'requestAnimFrame'], function(events, requestAnimFrame) {

  var running = false;

	function animate() {
    if (running) {
      requestAnimFrame(animate);
      obj.fire('renderFrame');
    }
	}

  var obj = {
    start: function() {
      running = true;
      requestAnimFrame(animate);
    },

    stop: function() {
      running = false;
    },
  };

  events.addMethods(obj);

  return obj;
});
