export {valueProvider};

function valueProvider(token, value) {
  var fn = function() { return value; };
  fn.annotations = [new Provide(token)];
  return fn;
}
