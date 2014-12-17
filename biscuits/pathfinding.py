from collections import namedtuple

from biscuits.geometry import Rectangle

Children = namedtuple('Children', 'north_east north_west south_east south_west')


class MinimumSizeError(Exception): pass
class Blocked(Exception): pass

class QuadTree(Rectangle):

    def __init__(self, x, y, w, h, parent=None, minimum_size=1, blocks=None):
        if parent:
            self.minimum_size = parent.minimum_size
        else:
            self.minimum_size = minimum_size

        if w <= self.minimum_size or h <= self.minimum_size:
            raise MinimumSizeError()

        super().__init__(x, y, w, h)
        self.parent = parent

        if blocks:
            self.children = self._subdivide(blocks)
        else:
            self.children = None


    def _subdivide(self, blocks):
        w = self.w / 2
        h = self.h / 2

        overlapping = []

        for block in blocks:
            if block.contains(self):
                raise Blocked()
            elif block.overlaps(self):
                overlapping.append(block)

        def ChildNode(x, y):
            try:
                return QuadTree(x, y, w, h, self, blocks=overlapping)
            except Blocked:
                return None

        if overlapping:
            try:
                ne = ChildNode(self.x + w, self.y + h)
                nw = ChildNode(self.x, self.y + h)
                se = ChildNode(self.x + w, self.y)
                sw = ChildNode(self.x, self.y)

                return Children(ne, nw, se, sw)
            except MinimumSizeError:
                raise Blocked()


    def walk_nodes(self):
        if self.children:
            for node in self.children:
                if node is not None:
                    yield from node.walk_nodes()

        yield self

    def find_neighbors(self):
        all = self.list_nodes()
        for op, one in all:
            for tp, two in all:
                if one is two: continue
                if one.left == two.right and (one.bottom < two.top and one.top > two.bottom):
                    one.n_left.append(two)
                elif one.right == two.left and (one.bottom < two.top and one.top > two.bottom):
                    one.n_right.append(two)
                elif one.top == two.bottom and (one.left < two.right and one.right > two.left):
                    one.n_top.append(two)
                elif one.bottom == two.top and (one.left < two.right and one.right > two.left):
                    one.n_bottom.append(two)
