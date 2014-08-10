import {Provide, SuperConstructor} from 'di';
import {Types} from 'src/worldscene';
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

Types['wall'] = Loader()
  .provides(WallBody)
  .runs(Body);
