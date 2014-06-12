import {Inject, Injector} from 'di';
import {Input} from 'src/input';
import {WorldScene, Scene} from 'src/scene';
import {SceneScope} from 'src/scope';
import {SceneScenario} from 'test/utils/SceneScenario';

/*
TODO
- portal loads new scene
- scene waits on async load dependency
*/

var injector = new Injector();
var scenario = injector.get(SceneScenario);

// TODO this @SceneScope thing is really easy to forget and very difficult
//      to track down...not very happy with this so far.
@SceneScope
@Inject(Scene, Input)
function MockLoader(scene, input) {
  return function(def, obj) {
    obj.loaded = true;
    obj.useCallback = sinon.spy();

    // TODO make a helper for this pattern
    scene.events.on('scene tick', function() {
      if (input.event == 'Use keydown') {
        obj.useCallback();
      }
    });
  }
}

var sceneOne = WorldScene(
  {x: 0, y: 0, w: 40, h: 40}, 
  [{ID: 'Mock-1', type: MockLoader}]);

var sceneTwo = WorldScene({x: 0, y: 0, w: 40, h: 40}, [
  {ID: 'Mock-2', type: MockLoader},
]);

scenario.manager.register('sceneOne', sceneOne);
scenario.manager.register('sceneTwo', sceneTwo);

scenario.load('sceneOne');

var mock1 = scenario.manager.scene.getObject('Mock-1');

scenario.load('sceneTwo');

var mock2 = scenario.manager.scene.getObject('Mock-2');

scenario.keypress('Use');

assert(mock1.useCallback.notCalled, 'mock1.useCallback not called');
assert(mock2.loaded, 'mock2.loaded is true');
assert(mock2.useCallback.called, 'mock2.useCallback is called');
