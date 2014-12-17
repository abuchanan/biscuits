from biscuits.sprites import SpriteCycle
from biscuits.widgets import CharacterWidget


class WalkCycle(SpriteCycle):

    speed = 0.36
    image_paths = [
        'media/player/{direction}-0.png',
        'media/player/{direction}-1.png',
        'media/player/{direction}-2.png',
        'media/player/{direction}-3.png',
    ]


class IdleCycle(SpriteCycle):

    image_paths = [
        'media/player/{direction}-0.png',
    ]


class SwordCycle(SpriteCycle):

    image_paths = [
        'media/player/sword-{direction}-0.png',
    ]


class PlayerWidget(CharacterWidget):

    _cycles = {
        'idle': IdleCycle,
        'walk': WalkCycle,
        'attack': SwordCycle,
    }
