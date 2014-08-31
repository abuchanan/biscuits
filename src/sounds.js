import {ObjectScope} from 'src/scope';
import HowlerLib from 'lib/howler';
export {Sounds};

@ObjectScope
class Sounds {

  create(...args) {
    return new HowlerLib.Howl(...args);
  }
}
