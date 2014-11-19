define([
  'lib/Shortcut',
  'lib/EventEmitter',
  'utils'

], function(Shortcut, EventEmitter, utils) {

    function Input(scene) {

        var previous = {};
        var current = {};
        var events = new EventEmitter();

        scene.events.on('tick', function() {
          for (var k in previous) {
            if (!current[k]) {
              events.trigger('stop ' + k);
            }
          }

          for (var k in current) {
            if (!previous[k]) {
              events.trigger('start ' + k);
            }
          }

          previous = utils.extend({}, current);
        });

        function start(name) {
          current[name] = true;
        }

        function stop(name) {
          if (previous[name]) {
            delete current[name];
          }
        }

        scene.input = {
            start: start,
            stop: stop,
            events: events,
        };
    }


    function KeyboardInput(scene) {

        var shortcutjs = new Shortcut();
        var input = scene.input;

        var keyDownOptions = {
          propagate: false,
        };

        var keyUpOptions = {
          type: 'keyup',
        };

        function add(keyname, eventname) {
          eventname = eventname || keyname;

          shortcutjs.add(keyname, function() {
              input.start(eventname);
          }, keyDownOptions);

          shortcutjs.add(keyname, function() {
              input.stop(eventname);
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
    return {
        Input: Input,
        KeyboardInput: KeyboardInput,
    };
});
