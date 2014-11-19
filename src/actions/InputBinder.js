define(function() {

    function InputBinder(input, manager) {

      return function(name, action) {

        input.events.on('start ' + name, function() {
          manager.start(action);
        });

        input.events.on('stop ' + name, function() {
          manager.stop(action);
        });
      }
    }

    return InputBinder;
});
