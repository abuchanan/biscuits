define(['lib/fpsmeter'], function(FPSMeter) {

    var meter = new FPSMeter.FPSMeter({
      top: 'auto',
      left: 'auto',
      bottom: '5px',
      right: '5px',
    });

    function startMeter(scene) {

      scene.events.on('tick', function(time) {
        meter.tick();
      });
    }

    return startMeter;
});
