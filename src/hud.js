define(['lib/pixi'], function(PIXI) {
  
    function HUDPlugin(scene) {
        var layer = scene.renderer.getLayer('hud');
        var healthText = new PIXI.Text('Health: ' + 0, {fill: 'white'});
        layer.addChild(healthText);

        scene.events.on('tick', function() {
            healthText.setText('Health: ' + scene.player.life.get(), {fill: 'white'});
        });
    }

    return HUDPlugin;
});
