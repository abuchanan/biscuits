import {Inject, Injector, Provide, TransientScope} from 'di';

export {
  valueProvider,
  extend,
  Loader,
};

function valueProvider(token, value, ScopeCls) {
  var fn = function() { return value; };
  fn.annotations = [new Provide(token)];
  if (ScopeCls) {
    fn.annotations.push(new ScopeCls.constructor());
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


function Loader(providers = [], deps = [], scope = TransientScope) {

  var func = function(injector) {
    var scopes = [];
    if (scope) {
      scopes.push(scope);
    }

    var childInjector = injector.createChild(providers, scopes);

    // TODO the error message from this probably sucks. how to improve?
    //      that is, if dep is undefined.
    for (var dep of deps) {
      try {
        childInjector.get(dep);
      } catch (e) {
        console.error('load dependency error');
        console.log(dep);
        console.log(e);
        throw e;
      }
    }

    return childInjector;
  };
  func.annotations = [new Inject(Injector), new TransientScope()];

  func.binds = function(token, value, scope) {
    var p = valueProvider(token, value, scope);
    return func.provides(p);
  };

  func.provides = function(...args) {
    return Loader(flatten(providers, ...args), deps, scope);
  };

  func.runs = function(...args) {
    return Loader(providers, flatten(deps, ...args), scope);
  };

  func.hasScope = function(s) {
    return Loader(providers, deps, s);
  };

  return func;
}

function flatten(...args) {
  var res = [];
  for (var x of args) {
    if (Array.isArray(x)) {
      res.push.apply(res, x);
    } else {
      res.push(x);
    }
  }
  return res;
}
