import random

from biscuits.actions import Actions, CharacterIdle, Walk, TimedAction
from biscuits.character import Character
from biscuits.sprites import SpriteCycle
from biscuits.widgets import CharacterWidget
from biscuits.World import Direction


class IdleCycle(SpriteCycle):

    speed = 0.7

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

    speed = 0.5

    image_paths = [
        'media/squirrel/move-{direction}-0.png',
        'media/squirrel/move-{direction}-1.png',
        'media/squirrel/move-{direction}-2.png',
    ]


class ZombieWidget(CharacterWidget):

    _cycles = {
        'idle': IdleCycle,
        'walk': WalkCycle,
    }

    clear_color = (0, 1, 0)


class ZombieWalk(Walk, TimedAction):

    def __init__(self, zombie, direction):
        Walk.__init__(self, zombie, direction, 1)
        TimedAction.__init__(self)

    def update(self, dt):
        Walk.update(self, dt)
        TimedAction.update(self, dt)


class ZombieAttack(TimedAction):

    def __init__(self, player):
        super().__init__()
        self.player = player

    def on_start(self):
        self.player.signals.attacked.send()


class ZombieActions(Actions):
    parent_name = 'zombie'

    def __init__(self):
        idle = CharacterIdle(self.zombie)
        super().__init__(idle)

    def on_player_collision(self, player):
        if not isinstance(self.current, ZombieAttack):
            self.current = ZombieAttack(player)

    def transition(self):

        # For brevity
        cur = self.current

        # TODO might be better if this was done using random durations
        # TODO needs to have path planning so that it doesn't go out of bounds
        # TODO need to be able to walk to a specific location.
        if (isinstance(cur, TimedAction) and cur.done) or cur is self.idle:
            if random.randrange(1000) < 10:
                d = random.choice(list(Direction))
                return ZombieWalk(self.zombie, d)
            else:
                return self.idle


class Zombie(Character):

    widget = ZombieWidget()
    actions = ZombieActions()

    # TODO enemy seeks player
    #      has "patrol" mode/actions
