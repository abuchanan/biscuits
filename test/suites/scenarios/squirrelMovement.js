import {Inject, Injector, Provide, TransientScope} from 'di';
import {SceneScenario} from 'test/utils/SceneScenario';
import {WorldScene, Scene} from 'src/scene';

import {SquirrelLoader, SquirrelActions, SquirrelDriver} from 'src/plugins/squirrel';
import {ChestLoader} from 'src/plugins/Chest';
import {BlockLoader} from 'src/plugins/Block';


/*
TODO this is a great use case for di.js issue #38
     code where a child injector is created, which you don't have access to
     and need to mock a dependency in the child injectors.
     (if you don't have @TransientScope)
*/
var driver;

@TransientScope
@Provide(SquirrelDriver)
@Inject(SquirrelActions)
class MockDriver {
  constructor(actions) {
    this.actions = actions;
    driver = this;
  }

  right() {
    this.actions.manager.start(this.actions.walkRight);
  }

  left() {
    this.actions.manager.start(this.actions.walkLeft);
  }

  up() {
    this.actions.manager.start(this.actions.walkUp);
  }

  down() {
    this.actions.manager.start(this.actions.walkDown);
  }
}

var injector = new Injector([MockDriver]);

var scenario = injector.get(SceneScenario);

var sceneOne = WorldScene({x: 0, y: 0, w: 40, h: 40}, [
  {ID: 'squirrel-1', x: 1, y: 1, w: 1, h: 1, type: SquirrelLoader},
  {ID: 'block-1', x: 3, y: 2, w: 2, h: 1, type: BlockLoader},
  {ID: 'chest-1', x: 2, y: 2, w: 1, h: 1, type: ChestLoader},
]);

scenario.manager.register('sceneOne', sceneOne);
scenario.load('sceneOne');

var sq = scenario.manager.scene.getObject('squirrel-1');

assert.deepEqual(sq.body.getPosition(), {x: 1, y: 1});
assert.equal(sq.body.direction, 'down');

driver.right();
scenario.tick(200);

assert.deepEqual(sq.body.getPosition(), {x: 2, y: 1});
assert.equal(sq.body.direction, 'right');
