define(['scope'], function(Scope) {

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

            // TODO allow unload to be blocked
            if (currentScene) {
              currentScene.trigger('destroy');
            }

            currentScene = Scope();
            // TODO use event instead?
            currentScene.start = start;

            loadpoint(currentScene);

            currentScene.trigger('loaded');

            if (!started) {
                requestAnimationFrame(tick);
                started = true;
            }
        }

        function tick() {
          currentScene.trigger('tick');
          currentScene.clean();
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
