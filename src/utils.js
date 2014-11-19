define(function() {

    // Module exports
    return {
        extend: extend,
    };


    // Extend a given object with all the properties in passed-in object(s).
    function extend(obj) {
      Array.prototype.slice.call(arguments, 1).forEach(function(source) {
        if (source) {
          for (var prop in source) {
            obj[prop] = source[prop];
          }
        }
      });
      return obj;
    }
});
