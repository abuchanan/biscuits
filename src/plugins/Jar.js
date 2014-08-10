import {Provide, SuperConstructor} from 'di';
import {Body} from 'src/world';
import {SceneObject} from 'src/scene';
import {ObjectScope} from 'src/scope';
// TODO rename Renderer to Graphics
import {Renderer} from 'src/render';
import {Types} from 'src/worldscene';
import {Loader} from 'src/utils';
import {ObjectConfig} from 'src/config';


@ObjectScope
@Provide(Body)
class JarBody extends Body {

  constructor(superConstructor: SuperConstructor) {
    superConstructor();
    this.isBlock = true;
  }
}


@ObjectScope
function JarRenderer(renderer: Renderer, body: Body, sceneObject: SceneObject) {
  var layer = renderer.getLayer('objects');
  var rect = body.getRectangle();

  var g = renderer.createGraphic();
  g.beginFill(0x994D00);
  g.drawRect(rect.x, rect.y, rect.w, rect.h);
  g.endFill();
  layer.addChild(g);

  // TODO wouldn't it be interesting if DI allowed for many
  //      instances of the same type? Then I could have a Destructor type
  //      instead of an event emitter.
  sceneObject.events.on('destruct', function() {
    clear();
  });

  function clear() {
    layer.removeChild(g);
  }

  return {clear};
}


Types['jar'] = Loader()
  .provides(JarBody)
  .runs(Body, JarRenderer);
