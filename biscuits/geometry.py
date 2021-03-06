"""Point and Rectangle classes.

This code is in the public domain.

Rectangle  -- two points, forming a rectangle
"""

from copy import copy
import math


class Rectangle:

    """
    A rectangle identified by two points.

    The rectangle stores left, top, right, and bottom values.

        y increases
        ^
        |
        +-----> x increases
    origin

    contains  -- is a point inside?
    overlaps  -- does a rectangle overlap?
    """

    __slots__ = ('x', 'y', 'w', 'h')

    def __init__(self, x, y, w, h):
        """Initialize a rectangle from two points."""
        self.x = x
        self.y = y
        self.w = w
        self.h = h

    def __iter__(self):
        return iter((self.x, self.y, self.w, self.h))

    def adjacent(self, other):
        left, bottom, right, top = self.bounds
        other_left, other_bottom, other_right, other_top = other.bounds

        if bottom < other_top and top > other_bottom:
            if left == other_right or right == other_left:
                return True

        if left < other_right and right > other_left:
            if top == other_bottom or bottom == other_top:
                return True

        return False

    def contains_point(self, x, y):
        """Return true if a point is inside the rectangle."""
        left, bottom, right, top = self.bounds
        return left <= x <= right and top <= y <= bottom

    def contains(self, other):
        left, bottom, right, top = self.bounds
        other_left, other_bottom, other_right, other_top = other.bounds
        return (other_left >= left and other_right <= right and
                other_top <= top and other_bottom >= bottom)

    def overlaps(self, other):
        """Return true if a rectangle overlaps this rectangle."""
        left, bottom, right, top = self.bounds
        other_left, other_bottom, other_right, other_top = other.bounds
        return (right > other_left and left < other_right and
                top > other_bottom and bottom < other_top)

    def set_from_rectangle(self, other):
        self.x = other.x
        self.y = other.y
        self.w = other.w
        self.h = other.h

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
                self.x += dx
                self.w -= dx

            if dy > 0:
                self.h += dy
            elif dy < 0:
                self.y += dy
                self.h -= dy
        else:
            self.x -= distance
            self.y -= distance
            self.w += distance * 2
            self.h += distance * 2

    def copy(self):
        return copy(self)

    @property
    def bounds(self):
        return self.x, self.y, self.x + self.w, self.y + self.h

    def __repr__(self):
        return "{}({}, {}, {}, {})".format(self.__class__.__name__,
                                           self.x, self.y, self.w, self.h)
