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


class Loader {

  constructor(providers = [], deps = [], scope = TransientScope) {
    this._providers = providers;
    this._deps = deps;
    this._scope = scope;

    var loader = this;
    this.Injector = function(injector) {
      return loader._Injector(injector);
    };
    this.Injector.annotations = [new Inject(Injector), new TransientScope()];
  }

  _Injector(injector) {
    var scopes = [];
    if (this._scope) {
      scopes.push(this._scope);
    }

    var childInjector = injector.createChild(this._providers, scopes);

    // TODO the error message from this probably sucks. how to improve?
    //      that is, if dep is undefined.
    for (var dep of this._deps) {
      try {
        childInjector.get(dep);
      } catch (e) {
        console.error('load dependency error');
        console.log(dep);
        console.log(this._deps, this._providers);
        console.log(e);
        throw e;
      }
    }

    return childInjector;
  }

  binds(token, value, scope) {
    var p = valueProvider(token, value, scope);
    return this.provides(p);
  }

  provides(...args) {
    var providers = flatten(this._providers, ...args);
    return new this.constructor(providers, this._deps, this._scope);
  }

  runs(...args) {
    var deps = flatten(this._deps, ...args);
    return new this.constructor(this._providers, deps, this._scope);
  }

  hasScope(scope) {
    return new this.constructor(this._providers, this._deps, scope);
  }
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
