function KeyBindings(document) {

  var keybindings = this;

  document.addEventListener('keypress', function(event) {

    var keyCodeMap = {
      38: 'up',
      40: 'down',
      37: 'left',
      39: 'right',
    };

    var eventName = keyCodeMap[event.keyCode];
    if (eventName) {
      keybindings._fire(eventName);
      event.preventDefault();
    }

  }, true);

  this.listeners = {};
}

KeyBindings.prototype = {
  _fire: function(name) {
    var listeners = this.listeners[name] || [];
    for (var i = 0, ii = listeners.length; i < ii; i++) {
      listeners[i](name);
    }
  },
  on: function(name, callback) {
    var listeners = this.listeners[name];

    if (!listeners) {
      var listeners = [];
      this.listeners[name] = listeners;
    }

    this.listeners[name].push(callback);
  },
};
