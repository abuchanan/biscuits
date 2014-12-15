from copy import copy
from enum import Enum

from geometry import Rectangle as BoundingBox


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


class Body(BoundingBox):

    def __init__(self, x, y, w, h, direction=Direction.south, is_block=False):
        super().__init__(x, y, w, h)
        self.is_block = is_block
        self.direction = direction

    def move(self, direction, distance=1):
        self.x += direction.dx * distance
        self.y += direction.dy * distance

    def grow(self, direction=None, distance=1):
        if direction:
            dx = direction.dx * distance
            dy = direction.dy * distance

            if dx > 0:
                self.w += dx
            elif dx < 0:
                self.x -= dx

            if dy > 0:
                self.h += dy
            elif dy < 0:
                self.y -= dy
        else:
            self.x -= distance
            self.y -= distance
            self.w += distance
            self.h += distance

    def copy(self):
        return copy(self)


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

    def dispatch(self, q, event_name, *args, **kwargs):
        for hit in self.query(q):
            method = getattr(hit, 'on_' + event_name, None)
            if method:
                method(*args, **kwargs)
