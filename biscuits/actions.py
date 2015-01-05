from biscuits.World import Direction


class Actions(Component):

    def init_component(self, idle=None):
        if idle is None:
            self.idle = Idle()
        else:
            self.idle = idle
        self.current = idle

    @property
    def is_idle(self):
        return self.current is self.idle

    def transition(self):
        raise NotImplementedError()

    def update(self, dt):
        _next = self.transition()
        if _next:
            self.current = _next
        self.current.update(dt)


class TimedAction:

    def __init__(self, duration=1):
        self.duration = duration
        self.reset()

    def reset(self):
        self.elapsed_time = 0
        self.done = False
        self.running = True

    def on_start(self):
        pass

    def on_done(self):
        pass

    def update(self, dt):
        if self.running:
            if self.elapsed_time == 0:
                self.on_start()

            self.elapsed_time += dt

            if self.elapsed_time >= self.duration:
                self.done = True
                self.running = False
                self.on_done()


class Idle:
    pass


class CharacterIdle:
    def __init__(self, character):
        self.character = character

    def update(self, dt):
        self.character.widget.action = 'idle'


class Attack(TimedAction):

    def __init__(self, character, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.character = character

    def on_start(self):
        self.character.dispatch_forward('attack')
        self.character.widget.action = 'attack'


class Walk:

    def __init__(self, character, direction=Direction.north):
        self.character = character
        self.direction = direction
        self.blocked = False

    def update(self, dt):
        self.character.body.direction = self.direction
        self.character.widget.action = 'walk'
        self.character.widget.direction = self.direction.name

        speed = .3
        progress = dt / speed
        blocks = self.character.body.move(self.direction, progress)
        self.blocked = len(blocks) > 0
