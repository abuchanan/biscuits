from biscuits.bank import Bank
from biscuits.objects.base import Base

from biscuits.player.actions import PlayerActions
from biscuits.player.body import PlayerBody
from biscuits.player.widget import PlayerWidget



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

        self.signals.attack.connect(self.on_attack)

    def on_attack(self, *args):
        print('player hit!')

    def update(self, dt):
        self.actions.update(dt)
        self.widget.update(dt)

    def dispatch_forward(self, signal_name, *args, **kwargs):
        q = self.body.copy()
        q.grow(self.body.direction.forward)
        self.world.dispatch(q, signal_name, self, *args, **kwargs)
