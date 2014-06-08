(function(requirejs) {

  System.baseURL = '/base/';

  window.__karma__.start = function() {

    System
      .import('test/suites/scenarios/playerMovement')
      .catch(function(err) {
        setTimeout(function() {
          //console.error(err);
          //console.log(err);
          //console.log(System.failed);
          throw err;
        });
      });
  };
})();
