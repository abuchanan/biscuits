from biscuits.geometry import Rectangle as BoundingBox
from biscuits.World import Body


class CharacterBody(Body):

    def __init__(self, world, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.world = world

    def move(self, direction, distance=1):
        dx = direction.dx * distance
        dy = direction.dy * distance

        n = BoundingBox(self.x + dx, self.y + dy,
                        self.w, self.h)

        blocks = []
        collisions = self.world.query(n)

        for hit in collisions:
            if hit.body.is_block:
                blocks.append(hit)

        if not blocks:
            self.set_from_rectangle(n)

        return blocks
