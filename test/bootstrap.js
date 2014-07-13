(function(karma) {
  // Normalize paths to RequireJS module names.
  var modules = [];
  Object.keys(karma.files).forEach(function(path) {
    var name = path.replace(/^\/base\//, '').replace(/\.js$/, '');
    modules.push(name);
  });


  karma.start = function() {
    require(['test/runner'], function(mod) {
      var runner = new mod.BiscuitsTestRunner();
      var run = runner.run.bind(runner, karma);
      runner.discoverTests(modules).then(run);
    });
  };

  require.config({
    // Karma serves files under /base, which is the basePath from your config file
    baseUrl: '/base',
    callback: karma.start,

    map: {
      '*': {
        'di': 'lib/di.js/index'
      }
    },
  });

})(window.__karma__);
