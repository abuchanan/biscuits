from collections import defaultdict
import itertools

from kivy.core.window import Window
from kivy.graphics import *
from kivy.properties import StringProperty
from kivy.uix.widget import Widget

from biscuits.World import Body, Direction
from biscuits.geometry import Rectangle as BoundingBox
from biscuits.objects.base import Base


class SpriteCycle:

    speed = 1
    image_paths = []

    def __init__(self):
        self._time = 0
        self._last_frame = 0
        self._cycle = itertools.cycle(self.image_paths)
        self.current = next(self._cycle)

    def update(self, dt):
        self._time += dt

        if self._time - self._last_frame >= self.speed:
            self._last_frame = self._time
            self.current = next(self._cycle)


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


class Bank:
    def __init__(self, initial=0):
        self._balance = initial

    @property
    def balance(self):
        return self._balance

    @balance.setter
    def balance(self, val):
        self._balance = max(val, 0)


class PlayerBody(Body):

    def __init__(self, player, world, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.player = player
        self.world = world

    def move(self, direction, distance=1):
        dx = direction.dx * distance
        dy = direction.dy * distance

        n = BoundingBox(self.x + dx, self.y + dy,
                        self.w, self.h)

        blocked = False

        collisions = self.world.query(n)

        for hit in collisions:
            hit.signals.player_collision.send(self.player)
            if hit.body.is_block:
                blocked = True

        if not blocked:
            self.set_from_rectangle(n)


class Player(Base):

    def __init__(self, world, x, y, direction):
        super().__init__()

        self.body = PlayerBody(self, world, x, y, 1, 1, direction=direction)
        self.world = world
        self.actions = PlayerActions(self)
        self.widget = PlayerWidget()
        self.widget.direction = direction.name
        self.coins = Bank()
        self.keys = Bank()
        self.health = Bank(100)
        world.add(self)

    def update(self, dt):
        self.actions.update(dt)
        self.widget.update(dt)

    def dispatch_forward(self, signal_name, *args, **kwargs):
        q = self.body.copy()
        q.grow(self.body.direction.forward)
        self.world.dispatch(q, signal_name, self, *args, **kwargs)


class Keybindings:

    _map = {
        'up': 'up',
        'down': 'down',
        'left': 'left',
        'right': 'right',
        'e': 'use',
        'f': 'attack',
    }

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
        k = self._map.get(keycode[1], keycode[1])
        self._input.deactivate(k)

    def _on_key_down(self, keyboard, keycode, text, modifiers):
        k = self._map.get(keycode[1], keycode[1])
        self._input.activate(k)


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
        self.idle = Idle(player)
        self.current = self.idle

    def transition(self):

        # For brevity
        cur = self.current
        inp = self._input

        if isinstance(cur, Use) and cur.done:
            return self.idle

        elif isinstance(cur, Attack) and cur.done:
            return self.idle

        elif cur is self.idle or isinstance(cur, Walk):

            if inp.use.keydown:
                return Use(self.player)

            elif inp.attack.keydown:
                return Attack(self.player)

            elif inp.up.keydown:
                return Walk(self.player, Direction.north)

            elif inp.down.keydown:
                return Walk(self.player, Direction.south)

            elif inp.left.keydown:
                return Walk(self.player, Direction.west)

            elif inp.right.keydown:
                return Walk(self.player, Direction.east)

            elif isinstance(cur, Walk):
                d = cur.direction

                if d == Direction.north and inp.up.keyup:
                    return self.idle

                elif d == Direction.south and inp.down.keyup:
                    return self.idle

                elif d == Direction.west and inp.left.keyup:
                    return self.idle

                elif d == Direction.east and inp.right.keyup:
                    return self.idle


    def update(self, dt):
        self._input.update(dt)
        _next = self.transition()
        if _next:
            self.current = _next
        self.current.update(dt)


class TimedAction:

    def __init__(self, duration=1):
        self.duration = duration
        self.elapsed_time = 0
        self.done = False
        self.started = False

    def on_start(self):
        pass

    def update(self, dt):
        self.elapsed_time += dt

        if not self.started:
            self.on_start()
            self.started = True

        if self.elapsed_time >= self.duration:
            self.done = True


# TODO be able to walk and attack at the same time
# TODO different attack strengths, weapons, etc


class Idle:
    def __init__(self, player):
        self.player = player

    def update(self, dt):
        self.player.widget.action = 'idle'


class Attack(TimedAction):

    def __init__(self, player):
        super().__init__()
        self.player = player

    def on_start(self):
        self.player.dispatch_forward('attack')


class Use(TimedAction):

    def __init__(self, player):
        super().__init__()
        self.player = player

    def on_start(self):
        self.player.dispatch_forward('use')


class Walk:

    def __init__(self, player, direction=Direction.north):
        self.player = player
        self.direction = direction

    def update(self, dt):
        self.player.body.direction = self.direction
        self.player.widget.action = 'walk'
        self.player.widget.direction = self.direction.name

        speed = .6
        progress = dt / speed
        self.player.body.move(self.direction, progress)
