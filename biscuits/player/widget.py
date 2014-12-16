from kivy.graphics import *
from kivy.properties import StringProperty
from kivy.uix.widget import Widget

from biscuits.sprites import SpriteCycle


class WalkCycle(SpriteCycle):

    speed = 0.36
    image_paths = [
        'media/player/{direction}-0.png',
        'media/player/{direction}-1.png',
        'media/player/{direction}-2.png',
        'media/player/{direction}-3.png',
    ]


class IdleCycle(SpriteCycle):

    image_paths = [
        'media/player/{direction}-0.png',
    ]


class PlayerWidget(Widget):

    action = StringProperty('idle')
    direction = StringProperty('south')

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

        self._cycles = {
            'idle': IdleCycle,
            'walk': WalkCycle,
        }

        self._current = self._cycles[self.action]()

        with self.canvas:
            self.rect = Rectangle()

        self.bind(direction=self._change_cycle, action=self._change_cycle)


    def _change_cycle(self, *args):
        self._current = self._cycles[self.action]()
        
    def update(self, dt):
        self._current.update(dt)
        source = self._current.current
        source = source.format(direction=self.direction)
        self.rect.source = source

        self.rect.size = self.size
        self.rect.pos = self.pos
