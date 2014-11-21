define(['lib/pixi'], function(PIXI) {


    function Renderer(s, container) {

        var layers = {};
        var renderer = PIXI.autoDetectRenderer();
        var stage = new PIXI.Stage(0x000000);
        // TODO this was causing an error. why?
        stage.interactive = false;
        stage.width = renderer.width;
        stage.height = renderer.height;

        container.appendChild(renderer.view);

        s.createGraphic = function() {
          return new PIXI.Graphics();
        };

        s.getLayer = function(name) {
            var layer = layers[name];

            if (!layer) {
                layer = layers[name] = new PIXI.DisplayObjectContainer();
                stage.addChild(layer);
            }

            return layer;
        };

        s.addLayers = function() {
            for (var i = 0; i < arguments.length; i++) {
                s.getLayer(arguments[i]);
            }
        }

        s.on('tick', function() {
            renderer.render(stage);
        });

        s.on('destroy', function() {
            container.removeChild(renderer.view);
        });
    }

    // Module exports
    return Renderer;
});
