define(['lib/pixi'], function(PIXI) {


    function Renderer(scene) {

        var layers = {};
        var renderer = PIXI.autoDetectRenderer();
        var stage = new PIXI.Stage(0x000000);
        // TODO this was causing an error. why?
        stage.interactive = false;
        stage.width = renderer.width;
        stage.height = renderer.height;

        scene.config.container.appendChild(renderer.view);

        function createGraphic() {
          return new PIXI.Graphics();
        }

        function getLayer(name) {
            var layer = layers[name];

            if (!layer) {
                layer = layers[name] = new PIXI.DisplayObjectContainer();
                stage.addChild(layer);
            }

            return layer;
        }

        function addLayers() {
            for (var i = 0; i < arguments.length; i++) {
                getLayer(arguments[i]);
            }
        }

        scene.events.on('tick', function() {
          renderer.render(stage);
        });

        scene.events.on('unload', function() {
          scene.config.container.removeChild(renderer.view);
        });


        // Renderer API
        scene.renderer = {
            createGraphic: createGraphic,
            getLayer: getLayer,
            addLayers: addLayers,
        };
    }

    // Module exports
    return Renderer;
});
