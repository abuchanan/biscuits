'use strict';

require(['biscuits'], function(biscuits) {

  var meter = new FPSMeter({
    top: 'auto',
    left: 'auto',
    bottom: '5px',
    right: '5px',
  });

  biscuits.addListener('renderFrame', function() {
    meter.tick();
  });
});
