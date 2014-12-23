from kivy.graphics import *
from kivy.properties import StringProperty
from kivy.uix.widget import Widget

from biscuits.actions import TimedAction


class CharacterWidget(Widget):

    action = StringProperty('idle')
    direction = StringProperty('south')

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

        self._current = self._cycles[self.action]()
        self.hit_action = HitAction(self)

        self.color = Color(1, 1, 1)
        self.canvas.before.add(self.color)

        with self.canvas:
            self.rect = Rectangle()

        self.bind(direction=self._change_cycle, action=self._change_cycle)


    def _change_cycle(self, *args):
        self._current = self._cycles[self.action]()

    def hit(self):
        self.hit_action.running = True
        
    def update(self, dt):
        self.hit_action.update(dt)
        self._current.update(dt)
        source = self._current.current
        source = source.format(direction=self.direction)
        self.rect.source = source

        self.rect.size = self.size
        self.rect.pos = self.pos


# TODO this works, but it feels like there's probably a nicer way to compose
#      character animations.
class HitAction(TimedAction):

    def __init__(self, widget, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.widget = widget
        self.duration = .8

    def reset(self):
        super().reset()
        self.running = False

    def on_start(self):
        self.widget.color.rgb = (1, 0, 0)

    def on_done(self):
        self.widget.color.rgb = (1, 1, 1)
        self.reset()
