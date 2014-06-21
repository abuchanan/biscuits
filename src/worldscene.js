import {Injector, Provide} from 'di';
import {WorldConfig} from 'src/world';
import {Scene, SceneObject, SceneLoader} from 'src/scene';
import {Renderer} from 'src/render';
import {ObjectScope} from 'src/scope';
import {valueProvider} from 'src/utils';

export {WorldScene};

function WorldScene(providers, definitions, extras) {
  extras = extras || [];

  var worldConfigProvider = valueProvider(WorldConfig, worldConfig);
  
  // TODO test that render layers are removed from renderer when scene is unloaded
  // TODO maybe renderer should be scene scoped? object scoped?

  @Provide(SceneLoader)
  function loadScene(injector: Injector, scene: Scene, renderer: Renderer) {
    renderer.getLayer('background');
    renderer.getLayer('objects');
    renderer.getLayer('player');
    renderer.getLayer('hud');

    definitions.forEach((def) => {
      var objectInjector = injector.createChild(def.providers, [ObjectScope]);

    // TODO the error message from this probably sucks. how to improve?
    //      that is, if dep is undefined.
      def.deps.forEach((dep) => {
        objectInjector.get(dep);
      });
      var obj = objectInjector.get(SceneObject);
      scene.addObject(def.ID, obj);
    });

    // TODO the error message from this sucks. how to improve?
    //      that is, if extra is undefined.
    extras.forEach((extra) => {
      injector.get(extra);
    });
  }

  return providers.concat([loadScene]);
}
