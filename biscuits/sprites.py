import itertools

class SpriteCycle:

    speed = 1
    image_paths = []

    def __init__(self):
        self._time = 0
        self._last_frame = 0
        self._cycle = itertools.cycle(self.image_paths)
        self.current = next(self._cycle)

    def update(self, dt):
        self._time += dt

        if self._time - self._last_frame >= self.speed:
            self._last_frame = self._time
            self.current = next(self._cycle)
