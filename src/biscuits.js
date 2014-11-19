define(['lib/EventEmitter', 'lib/lodash'], function(EventEmitter, lodash) {

    var currentSceneID = 1;

    function Biscuits(loadpoints) {

        var currentScene = undefined;
        var started = false;

        function start(name) {

            var loadpoint = loadpoints[name];

            if (!loadpoint) {
              throw 'Unknown loadpoint: ' + name;
            }

            var config = loadpoint.config;
            var plugins = loadpoint.plugins;

            // TODO allow unload to be blocked
            if (currentScene) {
              currentScene.events.trigger('unload');
            }

            currentScene = {
                ID: currentSceneID++,
                config: config,
                events: new EventEmitter(),
                start: start,
            };

            for (var i = 0; i < plugins.length; i++) {
                var plugin = plugins[i];
                var ret = plugin(currentScene);
                lodash.merge(currentScene, ret);
            }

            currentScene.events.trigger('loaded');

            if (!started) {
                requestAnimationFrame(tick);
                started = true;
            }
        }

        function tick() {
          currentScene.events.trigger('tick', [Date.now()]);
          requestAnimationFrame(tick);
        }

        // Biscuits public API
        return {
          start: start,
        };
    }


    // Module exports
    return Biscuits;
});
