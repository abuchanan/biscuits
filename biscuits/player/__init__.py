from biscuits.bank import Bank
from biscuits.objects.base import Base

from biscuits.player.actions import PlayerActions
from biscuits.player.body import PlayerBody
from biscuits.player.widget import PlayerWidget
from biscuits.World import Direction



class Player(Base):

    def init(self, x, y, direction=Direction.north):
        self.body = PlayerBody(self, self.world, x, y, 1, 1, direction=direction)
        self.actions = PlayerActions(self)
        self.widget = PlayerWidget()
        self.widget.direction = direction.name
        self.coins = Bank()
        self.keys = Bank()
        self.health = Bank(100)

        # TODO this is a common pattern. make resuable
        self.life = 2
        self.signals.attack.connect(self.on_attack)

    def on_attack(self, *args):
        # TODO this will be a common pattern. needs reusable component
        print('player hit!')
        self.life -= 1

        if self.life <= 0:
            self.signals.load_scene.send('dead')

    def set_position(self, x, y, direction):
        self.body.x = x
        self.body.y = y
        self.body.direction = direction
        self.widget.direction = direction.name
        self.actions.current = self.actions.idle

    def update(self, dt):
        self.actions.update(dt)
        self.widget.update(dt)

    def dispatch_forward(self, signal_name, *args, **kwargs):
        q = self.body.copy()
        q.grow(self.body.direction.forward)
        self.world.dispatch(self, q, signal_name, self, *args, **kwargs)