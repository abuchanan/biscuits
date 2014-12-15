from collections import defaultdict
from functools import partial

from kivy.animation import Animation
from kivy.clock import Clock
from kivy.core.window import Window
from kivy.event import EventDispatcher
from kivy.graphics import *
from kivy.properties import NumericProperty, ReferenceListProperty, \
                            ObjectProperty, StringProperty
from kivy.uix.image import Image
from kivy.uix.widget import Widget

from geometry import Rectangle as BoundingBox


class PlayerWidget(Widget):

    background = StringProperty('media/player/south-0.png')

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

        with self.canvas:
            self.rect = Rectangle(source=self.background, pos=self.pos)

        # TODO defining this stuff in kv language might be cleaner
        self.bind(pos=self.redraw, size=self.redraw, background=self.redraw)

    def redraw(self, *args):
        self.rect.size = self.size
        self.rect.pos = self.pos
        self.rect.source = self.background


class Player:

    def __init__(self, world):
        self.bb = BoundingBox(10, 10, 1, 1)
        self.world = world
        self.actions = PlayerActions(self)
        self.widget = PlayerWidget()

    def move(self, dx, dy):
        n = BoundingBox(self.bb.x + dx, self.bb.y + dy,
                        self.bb.w, self.bb.h)

        if self.world.hits_block(n):
            return

        self.bb = n

    def update(self, dt):
        self.actions.update(dt)


class Keybindings:

    def __init__(self, _input):
        self._input = _input
        self._keyboard = Window.request_keyboard(self._keyboard_closed, self)
        self._keyboard.bind(on_key_down=self._on_key_down,
                            on_key_up=self._on_key_up)

    def _keyboard_closed(self):
        self._keyboard.unbind(on_key_down=self._on_key_down,
                              on_key_up=self._on_key_up)
        self._keyboard = None

    def _on_key_up(self, keyboard, keycode):
        k = keycode[1]
        self._input.deactivate(k)

    def _on_key_down(self, keyboard, keycode, text, modifiers):
        k = keycode[1]
        self._input.activate(k)


class Idle:
    def update(self, dt):
        pass


class Key:

    def __init__(self):
        self.keydown = False
        self.repeat = False
        self.keyup = False


class Input:

    def __init__(self):
        self._keys = defaultdict(Key)
        self._updates = {}

    def __getitem__(self, name):
        return self._keys[name]

    def __getattr__(self, name):
        return self._keys[name]

    def activate(self, name):
        self._updates[name] = 'activate'

    def deactivate(self, name):
        self._updates[name] = 'deactivate'

    def update(self, dt):
        _updates = self._updates
        self.updates = {}

        for name, type in _updates.items():
            key = self._keys[name]

            if type == 'activate':
                if key.keydown:
                    key.keydown = False
                    key.repeat = True
                elif not key.repeat:
                    key.keydown = True

                key.keyup = False

            elif type == 'deactivate':
                key.keydown = False
                key.repeat = False
                key.keyup = True
                self._updates[name] = 'clear'

            elif type == 'clear':
                key.keydown = False
                key.repeat = False
                key.keyup = False


class PlayerActions:

    def __init__(self, player):
        self.player = player
        self._input = Input()
        Keybindings(self._input)
        self.idle = Idle()
        self.current = self.idle

    def update(self, dt):

        self._input.update(dt)
        self.current.update(dt)

        if self.current is self.idle or isinstance(self.current, Walk):
            if self._input.up.keydown:
                self.current = Walk(self.player, 'north')

            elif self._input.down.keydown:
                self.current = Walk(self.player, 'south')

            elif self._input.left.keydown:
                self.current = Walk(self.player, 'west')

            elif self._input.right.keydown:
                self.current = Walk(self.player, 'east')

        if isinstance(self.current, Walk):
            d = self.current.direction

            if d == 'north' and self._input.up.keyup:
                self.current = self.idle

            elif d == 'south' and self._input.down.keyup:
                self.current = self.idle

            elif d == 'west' and self._input.left.keyup:
                self.current = self.idle

            elif d == 'east' and self._input.right.keyup:
                self.current = self.idle
                

class Walk:

    def __init__(self, player, direction='north'):
        self.player = player
        self.direction = direction

    def update(self, dt):
        # TODO sprite animation
        self.player.widget.background = 'media/player/' + self.direction + '-0.png'

        dx = 0
        dy = 0

        if self.direction == 'north':
            dy = 1
        elif self.direction == 'south':
            dy = -1
        elif self.direction == 'east':
            dx = 1
        elif self.direction == 'west':
            dx = -1

        self.player.move(dx * .5, dy * .5)
