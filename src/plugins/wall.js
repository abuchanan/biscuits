import {Provide, SuperConstructor} from 'di';
import {Types} from 'src/types';
import {Loader} from 'src/utils';
import {Body} from 'src/world';
import {ObjectScope} from 'src/scope';


@ObjectScope
@Provide(Body)
class WallBody extends Body {

  constructor(superConstructor: SuperConstructor) {
    superConstructor();
    this.isBlock = true;
  }
}

Types['wall'] = new Loader()
  .provides(WallBody)
  .runs(Body);
