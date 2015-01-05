import random

from biscuits.actions import Actions, CharacterIdle, Walk, TimedAction
from biscuits.character import Character
from biscuits.sprites import SpriteCycle
from biscuits.widgets import CharacterWidget
from biscuits.World import Direction


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


# TODO allow components to refer to "obj" by another name, such as "squirrel"
class SquirrelSporadicActions(Actions):
    parent_name = 'squirrel'

    def __init__(self):
        idle = CharacterIdle(self.squirrel)
        super().__init__(idle)

    def transition(self):

        # For brevity
        cur = self.current

        # TODO might be better if this was done using random durations
        # TODO needs to have path planning so that it doesn't go out of bounds
        # TODO need to be able to walk to a specific location.
        if (isinstance(cur, TimedAction) and cur.done) or cur is self.idle:
            if random.randrange(1000) < 10:
                d = random.choice(list(Direction))
                return SquirrelWalk(self.obj, d)
            else:
                return self.idle


class Squirrel(Character):

    widget = SquirrelWidget()
    actions = SquirrelSporadicActions()
