from kivy.graphics import *
from kivy.properties import StringProperty
from kivy.uix.widget import Widget

# TODO duplicated with player widget
class CharacterWidget(Widget):

    action = StringProperty('idle')
    direction = StringProperty('south')

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

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
