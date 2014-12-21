from biscuits.bank import Bank
from biscuits.objects.base import Base

from biscuits.player.actions import PlayerActions
from biscuits.player.body import PlayerBody
from biscuits.player.widget import PlayerWidget
from biscuits.World import Direction



class Player(Base):

    def init(self, x, y, direction=Direction.north):
        self.body = PlayerBody(self.world, x, y, 1, 1, direction=direction)
        self.actions = PlayerActions(self)
        self.widget = PlayerWidget()
        self.widget.direction = direction.name
        self.coins = Bank()
        self.keys = Bank()
        # TODO this will be a common pattern. needs reusable component
        self.health = Bank(100)

        self.signals.attack.connect(self.on_attack)

    def on_attack(self, *args):
        # TODO this will be a common pattern. needs reusable component
        self.health.balance -= 1

        if self.health.balance <= 0:
            self.signals.load_scene.send('dead')

    def set_position(self, x, y, direction):
        self.body.x = x
        self.body.y = y
        self.body.direction = direction
        self.widget.direction = direction.name
        self.actions.current = self.actions.idle

    def trigger_collisions(self):
        for hit in self.world.query(self.body):
            hit.signals.player_collision.send(self)

    def update(self, dt):
        self.actions.update(dt)
        self.trigger_collisions()
        self.widget.update(dt)

    def dispatch_forward(self, signal_name, *args, **kwargs):
        q = self.body.copy()
        q.grow(self.body.direction.forward)
        self.world.dispatch(self, q, signal_name, self, *args, **kwargs)
