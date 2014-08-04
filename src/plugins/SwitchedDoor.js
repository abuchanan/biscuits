import {Provide, SuperConstructor} from 'di';
import {loader, provideBodyConfig} from 'src/utils';
import {Body} from 'src/world';
import {ObjectScope} from 'src/scope';
import {Renderer} from 'src/render';
import {ObjectConfig} from 'src/config';
import {Scene} from 'src/scene';

export {SwitchedDoorLoader, DoorSwitchLoader};


@ObjectScope
@Provide(Body)
class SwitchedDoorBody extends Body {

  constructor(superConstructor: SuperConstructor) {
    superConstructor();
    this.isBlock = true;
  }
}


@ObjectScope
function SwitchedDoorRenderer(renderer: Renderer, body: Body) {
  var layer = renderer.getLayer('objects');
  var rect = body.getRectangle();

  var g = renderer.createGraphic();
  g.beginFill(0xD10000);
  g.drawRect(rect.x, rect.y, rect.w, rect.h);
  g.endFill();
  layer.addChild(g);

  return {
    clear: function() {
      layer.removeChild(g);
    }
  }
}


@ObjectScope
function Collision(body: Body, config: ObjectConfig, scene: Scene) {
  body.events.on('player collision', function(playerBody) {
    var door = scene.getObject(config.target);
    console.log('collision', door);
    // TODO allow open()/close() methods on the door object
    door.get(SwitchedDoorRenderer).clear();
    door.get(Body).isBlock = false;
  });
}


var SwitchedDoorLoader = loader()
  .provides(
    provideBodyConfig,
    SwitchedDoorBody
  )
  .dependsOn(Body, SwitchedDoorRenderer);


var DoorSwitchLoader = loader()
  .provides(
    // TODO I hate putting this everywhere
    provideBodyConfig
  )
  .dependsOn(Collision);
