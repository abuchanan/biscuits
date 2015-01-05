from kivy.graphics import *
from kivy.properties import StringProperty
from kivy.uix.widget import Widget

from biscuits.actions import TimedAction


class CharacterWidget(Widget):

    action = StringProperty('idle')
    direction = StringProperty('south')

    def __init__(self, obj, **kwargs):
        super().__init__(**kwargs)

        self.obj = obj
        self._current = self._cycles[self.action]()
        self.hit_action = HitAction(self)

        self.color = Color(1, 1, 1)
        self.canvas.before.add(self.color)

        with self.canvas:
            self.rect = Rectangle()

        self.bind(direction=self._change_cycle, action=self._change_cycle)
        obj.signals.update.connect(self.update)

        # TODO scale squirrel images
        self.pos = (rectangle.x * 32, rectangle.y * 32)
        # TODO 32 is hard-coded
        self.size = (32, 32)
        # TODO this size_hint stuff sucks! Need to get away from relative layout
        self.size_hint = (None, None)


    def _change_cycle(self, *args):
        self._current = self._cycles[self.action]()

    def hit(self):
        self.hit_action.running = True
        
    def on_update(self, dt):
        self.hit_action.update(dt)
        self._current.update(dt)
        source = self._current.current
        source = source.format(direction=self.direction)
        self.rect.source = source

        # TODO 32 is hard-coded
        self.pos = (self.obj.body.x * 32, self.obj.body.y * 32)
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
