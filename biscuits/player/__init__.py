from biscuits.bank import Bank
from biscuits.character import Life
from biscuits.objects.base import Base

from biscuits.player.actions import PlayerActions
from biscuits.player.body import PlayerBody
from biscuits.player.widget import PlayerWidget


class Player(Base):

    body = PlayerBody()
    actions = PlayerActions()
    widget = PlayerWidget()

    coins = Bank()
    keys = Bank()
    life = Life(5)

    def on_attack(self, *args):
        # TODO this will be a common pattern. needs reusable component
        self.health.balance -= 1
        self.widget.hit()

    def on_update(self, dt):
        self.trigger_collisions()

    def set_position(self, x, y, direction):
        self.body.x = x
        self.body.y = y
        self.body.direction = direction
        self.widget.direction = direction.name
        self.actions.current = self.actions.idle

    def trigger_collisions(self):
        for hit in self.world.query(self.body):
            if hit is not self:
                hit.signals.player_collision.send(self)

    def dispatch_forward(self, signal_name, *args, **kwargs):
        q = self.body.copy()
        q.grow(self.body.direction.forward)
        self.scene.world.dispatch(self, q, signal_name, self, *args, **kwargs)
