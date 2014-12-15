"""Point and Rectangle classes.

This code is in the public domain.

Rectangle  -- two points, forming a rectangle
"""

import math


class Rectangle:

    """
    A rectangle identified by two points.

    The rectangle stores left, top, right, and bottom values.

    Coordinates are based on window coordinates (to match Kivy).

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

    @property
    def bounds(self):
        return self.x, self.y, self.x + self.w, self.y + self.h

    
    def grow(self, n):
        """Return a rectangle with extended borders.

        Create a new rectangle that is wider and taller than the
        immediate one. All sides are extended by "n" points.
        """
        return Rectangle(self.x - n, self.y - n, self.w + n, self.h + n)

    def shrink(self, n):
        return self.grow(-n)
    
    def __repr__(self):
        return "{}({}, {}, {}, {})".format(self.__class__.__name__,
                                           self.x, self.y, self.w, self.h)
