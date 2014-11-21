define(function() {

    function InputBinder(s, manager) {

      s.bind = function(name, action) {

          s.on('start ' + name, function() {
              manager.start(action);
          });

          s.on('stop ' + name, function() {
              manager.stop(action);
          });
      };
    }

    return InputBinder;
});
