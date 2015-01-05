from kivy.graphics import *
from kivy.core.audio import SoundLoader
from kivy.uix.widget import Widget

from biscuits.sprites import SpriteCycle
from biscuits.objects.base import Component


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


class PlayerKivyWidget(Widget):

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

        self.color = Color()
        self.canvas.before.add(self.color)

        # TODO need to find a good home for this stuff
        self.pos_hint = {'center_x': 0.5, 'center_y': 0.5}
        # TODO scale self images
        self.size = (32, 32)
        # TODO this size_hint stuff sucks! Need to get away from relative layout
        self.size_hint = (None, None)

        with self.canvas:
            self.rect = Rectangle()

    def update(self):
        self.rect.pos = self.pos
        self.rect.size = self.size


# TODO lots duplicated here with character widget
class PlayerWidget(Component):

    _cycles = {
        'idle': IdleCycle,
        'walk': WalkCycle,
        'attack': SwordCycle,
        'use': UseCycle,
    }

    def __init__(self):
        super().__init__()

        self._kivy_widget = PlayerKivyWidget()
        self._action = None

        self.action = 'idle'
    
        # TODO move this to the Cycle. a cycle can handle more that just sprites
        #self._attack_sound = SoundLoader.load('media/sounds/swings.wav')

    @property
    def action(self):
        return self._action

    @action.setter
    def action(self, value):
        if value != self._action:
            self._current = self._cycles[value]()
        self._action = value

    def on_update(self, dt):
        self._current.update(dt)
        source = self._current.current
        source = source.format(direction=self.parent.body.direction.name)
        self._kivy_widget.rect.source = source
        self._kivy_widget.update()
