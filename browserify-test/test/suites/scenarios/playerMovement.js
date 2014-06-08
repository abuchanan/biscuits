import {SceneScenario} from 'test/utils/SceneScenario';

// TODO I'd really like these to be automatically located and loaded
// TODO If a map definition had an item and couldn't find a matching plugin
//      that should be an error. Wouldn't want missing items to go by subtly
//      without notice
import 'src/world/plugins/Player';
import 'src/world/plugins/Coin';
import 'src/world/plugins/Block';

/*
TODO

set expectations on events that occur, such as
- player collision
- sword damage
- open chest
- load point (rename spawn point?)
- portal loads new scene
- scene waits on async load dependency
- etc
*/

// TODO a visual scenario editor would be dope
var defs = [
  {ID: 'player-1', x: 1, y: 1, w: 1, h: 1, type: 'player'},
  // TODO don't even bother having a default coin value.
  //      require that it be defined and fail when it's not.
  {ID: 'coin-1', x: 4, y: 1, w: 1, h: 1, type: 'coin'},
  {ID: 'coin-2', x: 5, y: 1, w: 1, h: 1, type: 'coin', coinValue: 10},
  {ID: 'block-1', x: 3, y: 2, w: 2, h: 1, type: 'block'},
  {ID: 'chest-1', x: 2, y: 2, w: 1, h: 1, type: 'chest'},
  {ID: 'chest-2', x: 2, y: 3, w: 1, h: 1, type: 'chest', coinValue: 10},
];

var scenario = SceneScenario();
scenario.loadObjects(defs);

var player = scenario.scene.getElementById('player-1');

// Default player position and direction
assert.deepEqual(player.body.getPosition(), {x: 1, y: 1});
assert.equal(player.body.direction, 'down');

scenario.keypress('Right');
scenario.keypress('Right');

// Player position and direction changes according to keypresses
assert.deepEqual(player.body.getPosition(), {x: 3, y: 1});
assert.equal(player.body.direction, 'right');

// Default player coin balance
assert.equal(player.coins.balance(), 0);

scenario.keypress('Right');

// Pick up a coin, default value is 1
assert.equal(player.coins.balance(), 1);

scenario.keypress('Right');

// Pick up a coin with a different coin value
assert.equal(player.coins.balance(), 11);

scenario.keypress('Left');

// The coin that was previously picked up is gone,
// so the balance stays the same
assert.equal(player.coins.balance(), 11);

scenario.keypress('Down');

// Player movement down is blocked by a block (invisible wall).
// The player's position stays the same but the direction changes.
assert.deepEqual(player.body.getPosition(), {x: 4, y: 1});
assert.equal(player.body.direction, 'down');

scenario.keypress('Left');
scenario.keypress('Down');

// The invisible wall has a width of two, and succeeds blocking the player.
assert.deepEqual(player.body.getPosition(), {x: 3, y: 1});
assert.equal(player.body.direction, 'down');

// Walk over to chest #1
scenario.keypress('Left');
scenario.keypress('Use');

// Chest can only be opened when player is facing it
assert.equal(player.coins.balance(), 11);

scenario.keypress('Down');

// Chest blocks path
assert.deepEqual(player.body.getPosition(), {x: 2, y: 1});
assert.equal(player.body.direction, 'down');

scenario.keypress('Use');

// Chest is opened and coins are deposited. The default coin amount is 1.
assert.equal(player.coins.balance(), 12);

scenario.keypress('Use');
scenario.keypress('Use');

// Chest is already opened, so coins aren't deposited again.
assert.equal(player.coins.balance(), 12);

// Walk over to chest #2 and open it.
scenario.keypress('Left');
scenario.keypress('Down');
scenario.keypress('Down');
scenario.keypress('Right');
scenario.keypress('Use');

// Chest #2 has a greater coin value.
assert.equal(player.coins.balance(), 22);


// TODO I want to test that the coin has been removed from the world.
