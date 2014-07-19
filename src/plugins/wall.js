import {Provide, SuperConstructor} from 'di';
import {loader, provideBodyConfig} from 'src/utils';
import {Body} from 'src/world';
import {ObjectScope} from 'src/scope';

export {WallLoader};


@ObjectScope
@Provide(Body)
class WallBody extends Body {

  constructor(superConstructor: SuperConstructor) {
    superConstructor();
    this.isBlock = true;
  }
}

var WallLoader = loader([provideBodyConfig], [WallBody]);
