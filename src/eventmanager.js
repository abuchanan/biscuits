function EventManager() {
    var listeners = {};

    return {
      addListener: function(name, callback) {
          var l = listeners[name];
          // TODO removeListener function
          if (!l) {
            // TODO probably linked list
            l = [];
            listeners[name] = l;
          }
          l.push(callback);
      },

      fire: function(name) {
        var l = listeners[name];
        if (l) {
          for (var i = 0, ii = l.length; i < ii; i++) {
            l[i]();
          }
        }
      },
    };
}
