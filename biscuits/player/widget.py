from kivy.core.audio import SoundLoader

from biscuits.sprites import SpriteCycle
from biscuits.widgets import CharacterWidget


class WalkCycle(SpriteCycle):

    speed = 0.25
    image_paths = [
        'media/player/{direction}-1.png',
        'media/player/{direction}-2.png',
        'media/player/{direction}-3.png',
    ]


class IdleCycle(SpriteCycle):

    image_paths = [
        'media/player/{direction}-0.png',
    ]


# TODO 
class UseCycle(IdleCycle):
    pass


class SwordCycle(SpriteCycle):

    image_paths = [
        'media/player/sword-{direction}-0.png',
    ]


class PlayerWidget(CharacterWidget):

    _cycles = {
        'idle': IdleCycle,
        'walk': WalkCycle,
        'attack': SwordCycle,
        'use': UseCycle,
    }
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self._attack_sound = SoundLoader.load('media/sounds/swings.wav')
        self.bind(action=self._change_action)

    def _change_action(self, *args):
        if self.action == 'attack':
            self._attack_sound.play()
