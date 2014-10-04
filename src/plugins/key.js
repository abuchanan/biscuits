import {Provide} from 'di';
import {Body} from 'src/world';
import {ObjectScope} from 'src/scope';
import {Renderer} from 'src/render';
import {Types} from 'src/types';
import {Loader} from 'src/utils';
import {ObjectConfig} from 'src/config';


class KeyConfig {}


@ObjectScope
function KeyRenderer(renderer: Renderer, body: Body) {
  var layer = renderer.getLayer('objects');
  var rect = body.getRectangle();

  var g = renderer.createGraphic();
  g.beginFill(0xFFB300);
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
class KeyPurse {

  constructor() {
    this._balance = 0;
  }

  // TODO needs type checking, should be integer
  //      best if it happens at compile time?
  deposit(amount) {
    this._balance += amount;
  }

  withdraw(amount) {
    this._balance -= amount;
  }

  balance() {
    return this._balance;
  }
}


@ObjectScope
function KeyCollision(config: KeyConfig, body: Body,
                      renderer: KeyRenderer) {

  // TODO should be getting the player object, not the body
  body.events.on('player collision', function(playerBody) {
    body.remove();

    var purse = playerBody.obj.get(KeyPurse);
    purse.deposit(1);

    // TODO test for this
    renderer.clear();
  });
}

Types['key'] = new Loader()
  .runs(Body, KeyRenderer, KeyCollision);

// TODO test that renderables are removed from renderer when scene is unloaded
