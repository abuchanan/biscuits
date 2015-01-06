import math
import random


from biscuits.actions import Actions, CharacterIdle, Walk, TimedAction
from biscuits.character import Character
from biscuits.sprites import SpriteCycle
from biscuits.widgets import CharacterWidget
from biscuits.World import Direction
from biscuits.player import Player


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


class ZombieWalk(Walk):
    def __init__(self, *args, **kwargs):
        kwargs['speed'] = 1
        super().__init__(*args, **kwargs)


class ZombieTimedWalk(ZombieWalk, TimedAction):

    def __init__(self, zombie, direction):
        ZombieWalk.__init__(self, zombie, direction)
        TimedAction.__init__(self)

    def update(self, dt):
        ZombieWalk.update(self, dt)
        TimedAction.update(self, dt)


class ZombieAttack(TimedAction):

    def __init__(self, player):
        super().__init__()
        self.player = player

    def on_start(self):
        self.player.signals.attacked.send()


class Seeking:
    def __init__(self, zombie, player):
        self.zombie = zombie
        self.player = player
        self.walk_action = ZombieWalk(zombie)
        self.done = False

    def calc_deltas(self):
        zbb = self.zombie.body.bb
        pbb = self.player.body.bb

        dx = pbb.x - zbb.x
        dy = pbb.y - zbb.y
        return dx, dy

    def calc_direction(self):
        dx, dy = self.calc_deltas()
        # TODO how to get this exact?
        close_enough = .3

        if math.fabs(dx) > close_enough:
            if dx < 0:
                return Direction.west
            else:
                return Direction.east

        elif math.fabs(dy) > close_enough:
            if dy < 0:
                return Direction.south
            else:
                return Direction.north

    def update(self, dt):
        direction = self.calc_direction()

        if direction:
            self.walk_action.direction = direction
            self.walk_action.update(dt)
        else:
            self.done = True


# TODO enemy seeks player
#      has "patrol" mode/actions
class ZombieActions(Actions):
    parent_name = 'zombie'

    def __init__(self):
        idle = CharacterIdle(self.zombie)
        super().__init__(idle)

        self.player = self.scene.objects['player']

    def on_player_collision(self, player):
        if not isinstance(self.current, ZombieAttack):
            self.current = ZombieAttack(player)

    # TODO maybe fine tune this so that it's only in front of the zombie
    def can_see_player(self):
        q = self.zombie.body.bb.copy()
        q.grow(distance=5)
        return q.overlaps(self.player.body.bb)

    # TODO might be better if this was done using random durations
    def random_move(self):
        if random.randrange(1000) < 10:
            d = random.choice(list(Direction))
            return ZombieTimedWalk(self.zombie, d)
        else:
            return self.idle

    def transition(self):
        # For brevity
        cur = self.current
        is_seeking = isinstance(cur, Seeking)
        can_see_player = self.can_see_player()

        if not is_seeking and can_see_player:
            return Seeking(self.zombie, self.player)

        elif is_seeking and (cur.done or not can_see_player):
            return self.random_move()

        elif isinstance(cur, TimedAction) and cur.done:
            return self.random_move()

        elif self.is_idle:
            return self.random_move()


class Zombie(Character):

    widget = ZombieWidget()
    actions = ZombieActions()
