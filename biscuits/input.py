from collections import defaultdict

from kivy.core.window import Window


class Keybindings:

    _map = {
        'up': 'up',
        'down': 'down',
        'left': 'left',
        'right': 'right',
        'e': 'use',
        'f': 'attack',
    }

    def __init__(self, _input):
        self._input = _input
        self._keyboard = Window.request_keyboard(self._keyboard_closed, self)
        self._keyboard.bind(on_key_down=self._on_key_down,
                            on_key_up=self._on_key_up)

    def _keyboard_closed(self):
        self._keyboard.unbind(on_key_down=self._on_key_down,
                              on_key_up=self._on_key_up)
        self._keyboard = None

    def _on_key_up(self, keyboard, keycode):
        k = self._map.get(keycode[1], keycode[1])
        self._input.deactivate(k)

    def _on_key_down(self, keyboard, keycode, text, modifiers):
        k = self._map.get(keycode[1], keycode[1])
        self._input.activate(k)


class Key:

    def __init__(self):
        self.first = False
        self.active = False
        self.repeat = False
        self.last = False


class Input:

    def __init__(self):
        self._keys = defaultdict(Key)
        self._updates = {}
        Keybindings(self)

    def __getitem__(self, name):
        return self._keys[name]

    def __getattr__(self, name):
        return self._keys[name]

    def activate(self, name):
        self._updates[name] = 'activate'

    def deactivate(self, name):
        self._updates[name] = 'deactivate'

    def update(self, dt):
        _updates = self._updates
        self.updates = {}

        for name, type in _updates.items():
            key = self._keys[name]

            if type == 'activate':
                if key.first:
                    key.first = False
                    key.repeat = True
                elif not key.repeat:
                    key.first = True

                key.active = True
                key.last = False

            elif type == 'deactivate':
                key.first = False
                key.repeat = False
                key.active = False
                key.last = True
                self._updates[name] = 'clear'

            elif type == 'clear':
                key.first = False
                key.repeat = False
                key.active = False
                key.last = False
