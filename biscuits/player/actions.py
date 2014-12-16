from biscuits.actions import TimedAction
from biscuits.World import Direction
from biscuits.input import Input


class PlayerActions:

    def __init__(self, player):
        self.player = player
        # TODO this doesn't belong here. but where does it belong?
        self._input = Input()
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
        self.player.widget.action = 'sword'


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
