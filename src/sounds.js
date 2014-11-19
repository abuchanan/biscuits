import HowlerLib from 'lib/howler';
export {Sounds};

class Sounds {

  create(...args) {
    return new HowlerLib.Howl(...args);
  }
}
