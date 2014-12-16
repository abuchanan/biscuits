
class TimedAction:

    def __init__(self, duration=1):
        self.duration = duration
        self.elapsed_time = 0
        self.done = False
        self.started = False

    def on_start(self):
        pass

    def update(self, dt):
        self.elapsed_time += dt

        if not self.started:
            self.on_start()
            self.started = True

        if self.elapsed_time >= self.duration:
            self.done = True
