'use strict';

define(['EventManager', 'requestAnimFrame'],
  function(EventManager, requestAnimFrame) {

  var running = false;
  var events = EventManager();

	function animate() {
    if (running) {
      requestAnimFrame(animate);
      events.fire('renderFrame');
    }
	}

  return {
    start: function() {
      running = true;
      requestAnimFrame(animate);
    },

    stop: function() {
      running = false;
    },

    addListener: events.addListener,
  };
});
