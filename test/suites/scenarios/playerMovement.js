import {Body} from 'src/world';
import {CoinPurse} from 'src/plugins/Player';
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
export function testPlayerMovement() {
  var scenario = new SceneScenario();

  var playerConfig = {x: 0, y: 0};

  scenario.loadpoints.addWorldScene('mock', '/base/test/maps/mock-1.json', playerConfig);
  scenario.load('mock');

  var player = scenario.manager.scene.getObject('player');
  var playerBody = player.get(Body);
  var playerCoins = player.get(CoinPurse);

  var coinBody = scenario.manager.scene.getObject('chest-1').get(Body);
  console.log(coinBody.getPosition());

  // Default player position and direction
  assert.deepEqual(playerBody.getPosition(), {x: 0, y: 0});
  assert.equal(playerBody.direction, 'down');

  // Default player coin balance
  assert.equal(playerCoins.balance(), 0);

  scenario.keypress('Right');
  assert.equal(playerBody.direction, 'right');

  // Player position and direction changes according to keypresses
  assert.deepEqual(playerBody.getPosition(), {x: 32, y: 0});

  scenario.keypress('Down');

  // Player position and direction changes according to keypresses
  assert.deepEqual(playerBody.getPosition(), {x: 32, y: 32});
  assert.equal(playerBody.direction, 'down');

  scenario.keypress('Right');
  scenario.keypress('Down');

  assert.deepEqual(playerBody.getPosition(), {x: 64, y: 32});
  assert.equal(playerBody.direction, 'down');

  scenario.keypress('Right');
  scenario.keypress('Down');

  assert.deepEqual(playerBody.getPosition(), {x: 96, y: 32});
  assert.equal(playerBody.direction, 'down');

  scenario.keypress('Right');

  // Pick up a coin, default value is 1
  assert.equal(playerCoins.balance(), 1);

  scenario.keypress('Down');

  assert.deepEqual(playerBody.getPosition(), {x: 128, y: 32});
  assert.equal(playerBody.direction, 'down');

  scenario.keypress('Right');

  // Pick up a coin with a different coin value
  assert.equal(playerCoins.balance(), 11);

  scenario.keypress('Left');

  // The coin that was previously picked up is gone,
  // so the balance stays the same
  assert.equal(playerCoins.balance(), 11);

  scenario.keypress('Left');
  scenario.keypress('Left');
  scenario.keypress('Left');
  scenario.keypress('Down');

  assert.deepEqual(playerBody.getPosition(), {x: 32, y: 64});

  // Chest can only be opened when player is facing it
  scenario.keypress('Use');
  assert.equal(playerCoins.balance(), 11);

  // Now face the chest and open it
  scenario.keypress('Right');
  scenario.keypress('Use');
  assert.equal(playerCoins.balance(), 12);

  scenario.keypress('Down');
  scenario.keypress('Right');
  scenario.keypress('Use');
  assert.equal(playerCoins.balance(), 22);

  // TODO I want to test that the coin has been removed from the world.
}

