import {SceneScenario} from 'test/utils/SceneScenario';

import {CoinLoader} from 'src/world/plugins/Coin';
import {PlayerLoader} from 'src/world/plugins/Player';
import {ChestLoader} from 'src/world/plugins/Chest';
import {BlockLoader} from 'src/world/plugins/Block';


// TODO a visual scenario editor would be dope
// TODO could provide as SceneConfig dep.
var scenario = new SceneScenario({

  world: {x: 0, y: 0, w: 40, h: 40},

  objects: [
    {ID: 'player-1', x: 1, y: 1, w: 1, h: 1, type: PlayerLoader},
    // TODO don't even bother having a default coin value.
    //      require that it be defined and fail when it's not.
    {ID: 'coin-1', x: 4, y: 1, w: 1, h: 1, type: CoinLoader},
    {ID: 'coin-2', x: 5, y: 1, w: 1, h: 1, type: CoinLoader, coinValue: 10},
    {ID: 'block-1', x: 3, y: 2, w: 2, h: 1, type: BlockLoader},
    {ID: 'chest-1', x: 2, y: 2, w: 1, h: 1, type: ChestLoader},
    {ID: 'chest-2', x: 2, y: 3, w: 1, h: 1, type: ChestLoader, coinValue: 10},
  ]
});

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


var player = scenario.scene.getObject('player-1');

// Default player position and direction
assert.deepEqual(player.body.getPosition(), {x: 1, y: 1});
assert.equal(player.body.direction, 'down');
// Default player coin balance
assert.equal(player.coins.balance(), 0);

scenario.keypress('Right');

assert.equal(player.body.direction, 'right');

scenario.keypress('Right');

// Player position and direction changes according to keypresses
assert.deepEqual(player.body.getPosition(), {x: 3, y: 1});

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
