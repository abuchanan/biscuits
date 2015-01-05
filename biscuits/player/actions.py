from biscuits.actions import Actions, TimedAction, Walk, CharacterIdle, Attack
from biscuits.World import Direction


class PlayerAttack(Attack):
    def __init__(self, *args, **kwargs):
        kwargs['duration'] = 0.4
        super().__init__(*args, **kwargs)


class PlayerActions(Actions):

    parent_name = 'player'

    def __init__(self):
        self.input = input
        self.idle = CharacterIdle(self.player)
        self.current = self.idle

    def transition(self):

        # For brevity
        cur = self.current
        inp = self.scene.input

        if isinstance(cur, Use) and cur.done:
            return self.idle

        elif isinstance(cur, Attack) and cur.done:
            return self.idle

        elif cur is self.idle:

            if inp.use.active:
                return Use(self.player)

            elif inp.attack.active:
                return PlayerAttack(self.player)

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
                return PlayerAttack(self.player)

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


class Use(TimedAction):

    def __init__(self, player):
        super().__init__()
        self.player = player

    def on_start(self):
        self.player.dispatch_forward('use')
        self.player.widget.action = 'use'
