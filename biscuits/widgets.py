from kivy.graphics import *
from kivy.uix.widget import Widget

from biscuits.actions import TimedAction
from biscuits.objects.base import Component


class CharacterKivyWidget(Widget):

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

        self.color = Color()
        self.canvas.before.add(self.color)

        with self.canvas:
            self.rect = Rectangle()

        # TODO scale squirrel images
        self.size = (32, 32)
        # TODO this size_hint stuff sucks! Need to get away from relative layout
        self.size_hint = (None, None)


class CharacterWidget(Component):

    clear_color = (1, 1, 1)
    hit_color = (1, 0, 0)

    def __init__(self):
        bb = self.parent.body.bb
        self._kivy_widget = CharacterKivyWidget(pos=(bb.x * 32, bb.y * 32))
        self._kivy_widget.color.rgb = self.clear_color
        self._hit_timer = HitTimer()
        self._action = None

        self.action = 'idle'

    @property
    def action(self):
        return self._action

    @action.setter
    def action(self, value):
        if value != self._action:
            self._current = self._cycles[value]()
        self._action = value

    def on_hit(self, *args):
        self._hit_timer.running = True
        
    def on_update(self, dt):
        self._hit_timer.update(dt)
        self._current.update(dt)

        if self._hit_timer.running:
            self._kivy_widget.color.rgb = self.hit_color
        else:
            self._kivy_widget.color.rgb = self.clear_color

        source = self._current.current
        source = source.format(direction=self.parent.body.direction.name)
        self._kivy_widget.rect.source = source

        # TODO 32 is hard-coded
        bb = self.parent.body.bb
        self._kivy_widget.pos = (bb.x * 32, bb.y * 32)
        self._kivy_widget.rect.pos = self._kivy_widget.pos
        self._kivy_widget.rect.size = self._kivy_widget.size


# TODO this works, but it feels like there's probably a nicer way to compose
#      character animations.
class HitTimer(TimedAction):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.duration = .8

    def reset(self):
        super().reset()
        self.running = False

    def on_done(self):
        self.reset()
