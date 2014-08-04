import {Provide, SuperConstructor} from 'di';
import {loader, provideBodyConfig} from 'src/utils';
import {Body} from 'src/world';
import {ObjectScope} from 'src/scope';
import {Renderer} from 'src/render';
import {ObjectConfig} from 'src/config';
import {Scene, SceneObject} from 'src/scene';

export {
  SwitchedDoorLoader,
  DoorSwitchLoader,
  UseableDoorSwitchLoader,
};


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
@Provide(SceneObject)
class SwitchedDoor extends SceneObject {

  // TODO can't inject Body here because it creates a circular dependency,
  //      Body -> SceneObject -> Body.
  //      Body and World need to be rethought, refactored. Maybe a Body
  //      shouldn't be adding itself to the World? For now I'm working
  //      around this using `this.get(Body)`
  //
  //      Turns out I can't inject SwitchedDoorRenderer for the same reason
  //      so it's pretty bad to have Body depend on SceneObject
  //      SceneObjects need to have Bodies and SceneObjects need to be
  //      added to a World outside of the Body constructor.
  //constructor(superConstructor: SuperConstructor,
  //            body: Body,
  //            renderer: SwitchedDoorRenderer) {

  open() {
    this.get(Body).isBlock = false;
    this.get(SwitchedDoorRenderer).clear();
  }
}


@ObjectScope
function Collision(body: Body, config: ObjectConfig, scene: Scene) {
  body.events.on('player collision', function() {
    scene.getObject(config.target).open();
  });
}


var SwitchedDoorLoader = loader()
  .provides(
    provideBodyConfig,
    SwitchedDoorBody,
    SwitchedDoor
  )
  .dependsOn(Body, SwitchedDoorRenderer);


var DoorSwitchLoader = loader()
  .provides(
    // TODO I hate putting this everywhere
    provideBodyConfig
  )
  .dependsOn(Collision);


@ObjectScope
function Useable(body: Body, config: ObjectConfig, scene: Scene) {
  body.events.on('use', function() {
    scene.getObject(config.target).open();
  });
}

var UseableDoorSwitchLoader = loader()
  .provides(provideBodyConfig)
  .dependsOn(Useable);
