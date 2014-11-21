define(['lib/pixi'], function(PIXI) {
  
    function HUDPlugin(s) {
        var layer = s.renderer.getLayer('hud');
        var healthText = new PIXI.Text('Health: ' + 0, {fill: 'white'});
        layer.addChild(healthText);

        s.on('tick', function() {
            healthText.setText('Health: ' + s.player.life.get(), {fill: 'white'});
        });
    }

    return HUDPlugin;
});
