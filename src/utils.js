import {Provide, TransientScope} from 'di';

export {valueProvider, extend, loader};

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

function loader(providers, deps) {
  providers = providers || [];
  deps = deps || [];

  function loader() {
    return {
      providers: providers.slice(0),
      deps: deps.slice(0),
    };
  }
  loader.annotations = [new TransientScope()];

  loader.provides = function(..._providers) {
    providers.push.apply(providers, _providers);
    return loader;
  };
  loader.dependsOn = function(..._deps) {
    deps.push.apply(deps, _deps);
    return loader;
  };
  return loader;
}
