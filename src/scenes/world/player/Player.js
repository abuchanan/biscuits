define([
  './PlayerBody',
  './PlayerRenderer',
  './actions',
  './life',

], function(PlayerBody, PlayerRenderer, PlayerActions, PlayerLife) {

    function Player(s) {

      var position = s.config.initialPlayerPosition;

      s.body = s.create(PlayerBody, position.x, position.y);
      s.body.direction = position.direction;

      s.playerRenderer = s.create(PlayerRenderer);
      s.actions = s.create(PlayerActions, s.body);
      s.life = s.create(PlayerLife, s.body);
    }

    return Player;
});


// TODO when keyup event happens during a different window
//      e.g. keydown, cmd+tab away, let go of key, then cmd+tab back
//      window focus/blur events?


    // TODO mechanism for telling scene that it needs to wait on a promise
    //      when loading
    //      scene.loadDependsOn(loadPlayerTextures());
    // TODO how to allow player to move and swing sword at same time?
    //      how to coordinate separate action manager with the renderer?

/*
function setupSounds(sounds: Sounds) {
  sounds.swingSword = sounds.create({
    urls: ['media/sounds/swings.wav'],
  });
}
*/
