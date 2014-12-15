class Block: pass

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
            if rect.overlaps(obj.bb):
                hits.append(obj)

        return hits

    def hits_block(self, rect):
        for hit in self.query(rect):
            if isinstance(hit, Block):
                return True

        return False
