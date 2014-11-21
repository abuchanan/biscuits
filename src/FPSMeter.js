define(['lib/fpsmeter'], function(FPSMeter) {

    function startMeter(s) {

      var meter = new FPSMeter.FPSMeter({
        top: 'auto',
        left: 'auto',
        bottom: '5px',
        right: '5px',
      });

      s.on('tick', function(time) {
        meter.tick();
      });
    }

    return startMeter;
});
