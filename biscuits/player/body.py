from biscuits.character import CharacterBody
from biscuits.geometry import Rectangle


class PlayerBody(CharacterBody):

    def move(self, direction, distance=1):
        blocks = super().move(direction, distance)

        for block in blocks:
            block.signals.player_collision.send(self.obj)

        return blocks
