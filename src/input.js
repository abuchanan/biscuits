define([
  'lib/Shortcut',

], function(Shortcut) {

    function KeyboardInput(s) {

        var shortcutjs = new Shortcut();

        var keyDownOptions = {
          propagate: false,
        };

        var keyUpOptions = {
          type: 'keyup',
        };

        function add(keyname, eventname) {
          eventname = eventname || keyname;

          shortcutjs.add(keyname, function() {
              s.trigger('start ' + eventname);
          }, keyDownOptions);

          shortcutjs.add(keyname, function() {
              s.trigger('stop ' + eventname);
          }, keyUpOptions);
        }

        add('Up');
        add('Down');
        add('Left');
        add('Right');
        add('E', 'Use');
        add('F', 'Attack');
    }

    // Module exports
    return KeyboardInput;
});
