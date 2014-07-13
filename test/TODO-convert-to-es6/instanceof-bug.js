// There was a bug with the es6-module-loader + traceur setup.
// That setup has since been replaced with requirejs + karma-traceur-preprocessor.

class Foo {}

class Bar extends Foo {
  constructor() {
    this.baz = 'baz';
  }
}

var b = new Bar();
assert.instanceOf(b, Foo);
//console.log(b instanceof Foo);
