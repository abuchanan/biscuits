from biscuits.actions import TimedAction, Walk, Idle, Attack
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

        elif cur is self.idle:

            if inp.use.active:
                return Use(self.player)

            elif inp.attack.active:
                return Attack(self.player)

            elif inp.up.active:
                return Walk(self.player, Direction.north)

            elif inp.down.active:
                return Walk(self.player, Direction.south)

            elif inp.left.active:
                return Walk(self.player, Direction.west)

            elif inp.right.active:
                return Walk(self.player, Direction.east)

        elif isinstance(cur, Walk):

            d = cur.direction

            if inp.use.first:
                return Use(self.player)

            elif inp.attack.first:
                return Attack(self.player)

            elif inp.up.first:
                return Walk(self.player, Direction.north)

            elif inp.down.first:
                return Walk(self.player, Direction.south)

            elif inp.left.first:
                return Walk(self.player, Direction.west)

            elif inp.right.first:
                return Walk(self.player, Direction.east)

            elif d == Direction.north and inp.up.last:
                return self.idle

            elif d == Direction.south and inp.down.last:
                return self.idle

            elif d == Direction.west and inp.left.last:
                return self.idle

            elif d == Direction.east and inp.right.last:
                return self.idle


    def update(self, dt):
        self._input.update(dt)
        _next = self.transition()
        if _next:
            self.current = _next
        self.current.update(dt)


# TODO be able to walk and attack at the same time
# TODO different attack strengths, weapons, etc


class Use(TimedAction):

    def __init__(self, player):
        super().__init__()
        self.player = player

    def on_start(self):
        self.player.dispatch_forward('use')
