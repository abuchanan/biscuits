import {Provide, SuperConstructor} from 'di';
import {loader, provideBodyConfig} from 'src/utils';
import {Body} from 'src/world';
import {ObjectScope} from 'src/scope';
import {Renderer} from 'src/render';
import {KeyPurse} from 'src/plugins/key';

export {LockedDoorLoader};


@ObjectScope
@Provide(Body)
class LockedDoorBody extends Body {

  constructor(superConstructor: SuperConstructor) {
    superConstructor();
    this.isBlock = true;
  }
}


@ObjectScope
function LockedDoorRenderer(renderer: Renderer, body: Body) {
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
function Collision(body: Body, renderer: LockedDoorRenderer) {

  body.events.on('player collision', function(playerBody) {
    var purse = playerBody.obj.get(KeyPurse);

    // TODO test for this
    if (purse.balance() > 0) {
      purse.withdraw(1);
      renderer.clear();
      body.remove();
    }
  });
}

var LockedDoorLoader = loader()
  .provides(
    provideBodyConfig,
    // TODO one downside to this approach is that I can't put a comma at the end here
    LockedDoorBody
  )
  .dependsOn(Body, LockedDoorRenderer, Collision);
