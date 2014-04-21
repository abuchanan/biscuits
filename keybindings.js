function KeyBindingsService(document) {

  var keyCodeMap = {
    38: 'up',
    40: 'down',
    37: 'left',
    39: 'right',
  };

  return {
    listen: function(callback) {

      function listener(event) {
        var eventName = keyCodeMap[event.keyCode];
        if (eventName) {
          callback(eventName);
          event.preventDefault();
        }
      }

      document.addEventListener('keydown', listener, true);

      return function() {
        document.removeEventListener('keydown', listener, true);
      }
    },
  };
}
