from biscuits.geometry import Rectangle as BoundingBox
from biscuits.World import Body

from biscuits.objects.base import Base, Component


class CharacterBody(Body):

    def move(self, direction, distance=1):
        dx = direction.dx * distance
        dy = direction.dy * distance

        n = BoundingBox(self.bb.x + dx, self.bb.y + dy,
                        self.bb.w, self.bb.h)

        blocks = []
        collisions = self.scene.world.query(n)

        for hit in collisions:
            if hit.body.is_block:
                blocks.append(hit)

        if not blocks:
            self.bb.set_from_rectangle(n)

        return blocks


class Life(Component):

    def __init__(self, max_amount):
        self.max_amount = max_amount
        self._amount = max_amount

    @property
    def amount(self):
        return self._amount

    @amount.setter
    def amount(self, val):
        if val < 0:
            val = 0
        if val > self.max_amount:
            val = self.max_amount

        self._amount = val

    def on_update(self, dt):
        if self.amount == 0:
            self.parent.signals.dead.send()



class Attackable(Component):

    def on_attacked(self, attacker):
        # TODO different types of attacks will yield different decrement amounts
        # TODO chance to block attack
        self.parent.life.amount -= 1
        # TODO use hit signal
        self.parent.widget.signals.hit.send()


class Character(Base):

    body = CharacterBody()
    life = Life(2)
    attackable = Attackable()

    def on_dead(self, *args):
        self.destroy()
