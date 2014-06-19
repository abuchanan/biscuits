// es6-module-loader + systemjs, compile in browser
// this one has a bug with instanceof
var __moduleName = "test/suites/scenarios/playerMovement"; with(__global) { (function() { System.register("test/suites/scenarios/playerMovement", [], function($__0) {
  "use strict";
  var __moduleName = "test/suites/scenarios/playerMovement";
  var Foo,
      Bar,
      b;
  return {
    exports: {},
    execute: function() {
      Foo = (function() {
        var Foo = function Foo() {};
        return ($traceurRuntime.createClass)(Foo, {}, {});
      }());
      Bar = (function() {
        var Bar = function Bar() {
          this.baz = 'baz';
        };
        return ($traceurRuntime.createClass)(Bar, {}, {});
      }());
      b = new Bar();
      console.log(b instanceof Foo);
    }
  };
});

 
 }).call(__global); }
// Traceur direct
System.register("test/suites/scenarios/playerMovement", [], function() {
  "use strict";
  var __moduleName = "test/suites/scenarios/playerMovement";
  var Foo = function Foo() {};
  ($traceurRuntime.createClass)(Foo, {}, {});
  var Bar = function Bar() {
    this.baz = 'baz';
  };
  ($traceurRuntime.createClass)(Bar, {}, {}, Foo);
  var b = new Bar();
  console.log(b instanceof Foo);
  return {};
});
System.get("test/suites/scenarios/playerMovement" + '');


// karma-traceur-preprocessor, amd version
define([], function() {
  "use strict";
  var Foo = function Foo() {};
  ($traceurRuntime.createClass)(Foo, {}, {});
  var Bar = function Bar() {
    this.baz = 'baz';
  };
  ($traceurRuntime.createClass)(Bar, {}, {}, Foo);
  var b = new Bar();
  console.log(b instanceof Foo);
  return {};
});
