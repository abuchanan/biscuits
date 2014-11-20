define([
  './PlayerBody',
  './PlayerRenderer',
  './actions',
  './life',

], function(PlayerBody, PlayerRenderer, PlayerActions, PlayerLife) {

    function PlayerPlugin(scene) {

      var position = scene.config.initialPlayerPosition;
      var world = scene.world;
      var body = PlayerBody(position.x, position.y, world);
      body.direction = position.direction;

      var renderable = PlayerRenderer(scene);
      var actionManager = PlayerActions(body, scene.input, scene);

      var life = PlayerLife(scene, body);

      scene.player = {
        body: body,
        renderable: renderable,
        actionManager: actionManager,
        life: life,
      };
    }

    return PlayerPlugin;

});
// TODO when keyup event happens during a different window
//      e.g. keydown, cmd+tab away, let go of key, then cmd+tab back
//      window focus/blur events?


    // TODO mechanism for telling scene that it needs to wait on a promise
    //      when loading
    //      scene.loadDependsOn(loadPlayerTextures());
    // TODO PlayerCombat(keybindings, worldObj);
    // TODO how to allow player to move and swing sword at same time?
    //      how to coordinate separate action manager with the renderer?

/*
function setupSounds(sounds: Sounds) {
  sounds.swingSword = sounds.create({
    urls: ['media/sounds/swings.wav'],
  });
}
*/
