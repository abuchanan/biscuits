import random

from biscuits.actions import Idle, Walk, TimedAction
from biscuits.character import CharacterBody
from biscuits.objects.base import Base
from biscuits.sprites import SpriteCycle
from biscuits.widgets import CharacterWidget
from biscuits.World import Direction


class Squirrel(Base):

    def init(self, rectangle):

        self.widget = SquirrelWidget()
        # TODO this size_hint stuff sucks! Need to get away from relative layout
        # TODO scale squirrel images
        self.widget.pos = (rectangle.x * 32, rectangle.y * 32)
        self.widget.size = (32, 32)
        self.widget.size_hint = (None, None)
        self.body = CharacterBody(self.world, *rectangle)

        self.actions = SquirrelSporadicActions(self)
        self.hit_actions = SquirrelHitActions()

        self.life = 2
        self.signals.attack.connect(self.on_attack)
        self.signals.player_collision.connect(self.on_player_collision)

    def init_from_config(self, config):
        self.init(config.rectangle)

    def update(self, dt):
        self.actions.update(dt)
        self.hit_actions.update(dt)
        self.widget.update(dt)
        self.widget.pos = (self.body.x * 32, self.body.y * 32)

    def on_player_collision(self, player):
        self.hit_actions.hit(player)

    def on_attack(self, player):
        # TODO this will be a common pattern. needs reusable component
        self.life -= 1

        if self.life <= 0:
            self.destroy()


class IdleCycle(SpriteCycle):

    speed = 0.4

    image_paths = [
        'media/squirrel/idle-{direction}-0.png',
        'media/squirrel/idle-{direction}-1.png',
        'media/squirrel/idle-{direction}-2.png',
        'media/squirrel/idle-{direction}-3.png',
        'media/squirrel/idle-{direction}-4.png',
        'media/squirrel/idle-{direction}-5.png',
        'media/squirrel/idle-{direction}-6.png',
        'media/squirrel/idle-{direction}-7.png',
    ]


class WalkCycle(SpriteCycle):

    speed = 0.2

    image_paths = [
        'media/squirrel/move-{direction}-0.png',
        'media/squirrel/move-{direction}-1.png',
        'media/squirrel/move-{direction}-2.png',
    ]


# TODO duplicated with player widget
class SquirrelWidget(CharacterWidget):

    _cycles = {
        'idle': IdleCycle,
        'walk': WalkCycle,
    }


class SquirrelWalk(Walk, TimedAction):

    def __init__(self, squirrel, direction):
        Walk.__init__(self, squirrel, direction)
        TimedAction.__init__(self)

    def update(self, dt):
        Walk.update(self, dt)
        TimedAction.update(self, dt)


class SquirrelSporadicActions:

    def __init__(self, squirrel):
        self.squirrel = squirrel
        self.idle = Idle(squirrel)
        self.current = self.idle

    def transition(self):

        # For brevity
        cur = self.current

        # TODO might be better if this was done using random durations
        # TODO needs to have path planning so that it doesn't go out of bounds
        # TODO need to be able to walk to a specific location.
        if (isinstance(cur, TimedAction) and cur.done) or cur is self.idle:
            if random.randrange(1000) < 10:
                d = random.choice(list(Direction))
                return SquirrelWalk(self.squirrel, d)
            else:
                return self.idle
                

    def update(self, dt):
        _next = self.transition()
        if _next:
            self.current = _next
        self.current.update(dt)


class SquirrelHitActions:
    def __init__(self):
        self.current = None

    def update(self, dt):
        if self.current is not None and self.current.done:
            self.current = None

        if self.current is not None:
            self.current.update(dt)

    def hit(self, player):
        if self.current is None:
            self.current = TimedAction()
            player.signals.attack.send()
