import {TransientScope} from 'di';

export {factory};

function factory(cls) {
  function wrapper() {
    Array.prototype.unshift.call(arguments, {});
    return Function.prototype.bind.apply(cls, arguments);
  }
  var annotations = cls.annotations || [];
  wrapper.annotations = annotations.slice(0);
  wrapper.annotations.push(new TransientScope());
  return wrapper;
}
