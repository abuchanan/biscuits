from enum import Enum

from biscuits.objects.base import Component
from biscuits.geometry import Rectangle as BoundingBox


class Direction(Enum):

    north = (0, 0, 1)
    east  = (1, 1, 0)
    south = (2, 0, -1)
    west  = (3, -1, 0)

    def __init__(self, index, dx, dy):
        self.index = index
        self.dx = dx
        self.dy = dy

    @property
    def forward(self):
        return self

    @property
    def backward(self):
        return Direction((self.index + 2) % 4)

    @property
    def left(self):
        return Direction((self.index + 3) % 4)

    @property
    def right(self):
        return Direction((self.index + 1) % 4)


class Body(Component):

    def __init__(self, x, y, w, h, direction=Direction.south, is_block=False):
        self.bb = BoundingBox(x, y, w, h)
        self.is_block = is_block
        self.direction = direction

    def move(self, *args, **kwargs):
        self.bb.move(*args, **kwargs)


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
            if rect.overlaps(obj.body.bb):
                hits.append(obj)

        return hits

    def hits_block(self, rect):
        for hit in self.query(rect):
            if hit.body.is_block:
                return True

        return False

    def dispatch(self, source, q, signal_name, *args, **kwargs):
        for hit in self.query(q):
            if hit is not source:
                method = getattr(hit.signals, signal_name)
                method.send(*args, **kwargs)
