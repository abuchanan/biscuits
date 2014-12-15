"""Point and Rectangle classes.

This code is in the public domain.

Rectangle  -- two points, forming a rectangle
"""

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
    grow  -- grow (or shrink)
    """

    __slots__ = ('x', 'y', 'w', 'h')

    def __init__(self, x, y, w, h):
        """Initialize a rectangle from two points."""
        self.x = x
        self.y = y
        self.w = w
        self.h = h

    def contains(self, x, y):
        """Return true if a point is inside the rectangle."""
        left, bottom, right, top = self.bounds
        return left <= x <= right and top <= y <= bottom

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

    @property
    def bounds(self):
        return self.x, self.y, self.x + self.w, self.y + self.h

    def __repr__(self):
        return "{}({}, {}, {}, {})".format(self.__class__.__name__,
                                           self.x, self.y, self.w, self.h)
