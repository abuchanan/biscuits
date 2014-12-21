from biscuits.World import Direction


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


class Idle:
    def __init__(self, character):
        self.character = character

    def update(self, dt):
        self.character.widget.action = 'idle'


class Attack(TimedAction):

    def __init__(self, character):
        super().__init__()
        self.character = character

    def on_start(self):
        self.character.dispatch_forward('attack')
        self.character.widget.action = 'attack'


class Walk:

    def __init__(self, character, direction=Direction.north):
        self.character = character
        self.direction = direction

    def update(self, dt):
        self.character.body.direction = self.direction
        self.character.widget.action = 'walk'
        self.character.widget.direction = self.direction.name

        speed = .3
        progress = dt / speed
        self.character.body.move(self.direction, progress)
