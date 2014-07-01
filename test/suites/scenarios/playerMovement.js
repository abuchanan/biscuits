import {SceneScenario} from 'test/utils/SceneScenario';

/*
TODO

set expectations on events that occur, such as
- sword damage
- load point (rename spawn point?)
- portal loads new scene
- scene waits on async load dependency
- etc
*/

var scenario = injector.get(SceneScenario);

// TODO player config
// {ID: 'player-1', x: 1, y: 1, w: 1, h: 1, type: PlayerLoader},
scenario.maps['mock'] = {
  height: 40,
  width: 40,
  tileheight: 32,
  tilewidth: 32,
  layers: [
    {
      type: "objectgroup",
      objects: [
        {
          height: 1,
          width: 2,
          name: 'wall',
          x: 3,
          y: 2,
        },
        {
          ID: 'coin-1',
          height: 1,
          width: 1,
          name: 'coin',
          x: 4,
          y: 1,
          coinValue: 1,
        },
        {
          ID: 'coin-2',
          height: 1,
          width: 1,
          name: 'coin',
          x: 5,
          y: 1,
          coinValue: 10,
        },
        {
          ID: 'chest-1',
          height: 1,
          width: 1,
          name: 'chest',
          x: 2,
          y: 2,
          chestValue: 1,
        },
        {
          ID: 'chest-2',
          height: 1,
          width: 1,
          name: 'chest',
          x: 2,
          y: 3,
          chestValue: 10,
        },
      ]
    }
  ]
};

scenario.load('mock');

var player = scenario.manager.scene.getObject('player');
var playerBody = player.get(Body);
var playerCoins = player.get(CoinPurse);

// Default player position and direction
assert.deepEqual(playerBody.getPosition(), {x: 1, y: 1});
assert.equal(playerBody.direction, 'down');

// Default player coin balance
assert.equal(playerCoins.balance(), 0);

scenario.keypress('Right');

assert.equal(playerBody.direction, 'right');

scenario.keypress('Right');

// Player position and direction changes according to keypresses
assert.deepEqual(playerBody.getPosition(), {x: 3, y: 1});

scenario.keypress('Right');

// Pick up a coin, default value is 1
assert.equal(playerCoins.balance(), 1);

scenario.keypress('Right');

// Pick up a coin with a different coin value
assert.equal(playerCoins.balance(), 11);

scenario.keypress('Left');

// The coin that was previously picked up is gone,
// so the balance stays the same
assert.equal(playerCoins.balance(), 11);

scenario.keypress('Down');

// Player movement down is blocked by a block (invisible wall).
// The player's position stays the same but the direction changes.
assert.deepEqual(playerBody.getPosition(), {x: 4, y: 1});
assert.equal(playerBody.direction, 'down');

scenario.keypress('Left');
scenario.keypress('Down');

// The invisible wall has a width of two, and succeeds blocking the player.
assert.deepEqual(playerBody.getPosition(), {x: 3, y: 1});
assert.equal(playerBody.direction, 'down');

// Walk over to chest #1
scenario.keypress('Left');
scenario.keypress('Use');

// Chest can only be opened when player is facing it
assert.equal(playerCoins.balance(), 11);

scenario.keypress('Down');

// Chest blocks path
assert.deepEqual(playerBody.getPosition(), {x: 2, y: 1});
assert.equal(playerBody.direction, 'down');

scenario.keypress('Use');

// Chest is opened and coins are deposited. The default coin amount is 1.
assert.equal(playerCoins.balance(), 12);

scenario.keypress('Use');
scenario.keypress('Use');

// Chest is already opened, so coins aren't deposited again.
assert.equal(playerCoins.balance(), 12);

// Walk over to chest #2 and open it.
scenario.keypress('Left');
scenario.keypress('Down');
scenario.keypress('Down');
scenario.keypress('Right');
scenario.keypress('Use');

// Chest #2 has a greater coin value.
assert.equal(playerCoins.balance(), 22);


// TODO I want to test that the coin has been removed from the world.
