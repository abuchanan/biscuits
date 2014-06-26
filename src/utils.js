import {Provide} from 'di';

export {valueProvider, extend};

function valueProvider(token, value, scope) {
  var fn = function() { return value; };
  fn.annotations = [new Provide(token)];
  if (scope) {
    fn.annotations.push(scope);
  }
  return fn;
}

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
