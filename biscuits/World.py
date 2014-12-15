from enum import Enum

from geometry import Rectangle as BoundingBox


class Direction(Enum):

    north = 0
    east = 1
    south = 2
    west = 3

    @property
    def forward(self):
        return self

    @property
    def backward(self):
        return Direction((self.value + 2) % 4)

    @property
    def left(self):
        return Direction((self.value + 3) % 4)

    @property
    def right(self):
        return Direction((self.value + 1) % 4)


class Body(BoundingBox):

    def __init__(self, x, y, w, h, direction=Direction.south, is_block=False):
        super().__init__(x, y, w, h)
        self.is_block = is_block
        self.direction = direction

    def move(self, direction, distance=1):
        pass


class World:

    def __init__(self):
        self._objects = []

    def add(self, obj):
        self._objects.append(obj)

    def remove(self, obj):
        self._objects.remove(obj)

    def __iter__(self):
        return iter(self._objects)

    def query(self, rect):
        hits = []

        for obj in self._objects:
            if rect.overlaps(obj.body):
                hits.append(obj)

        return hits

    def hits_block(self, rect):
        for hit in self.query(rect):
            if hit.body.is_block:
                return True

        return False
