from biscuits.character import CharacterBody


class PlayerBody(CharacterBody):

    def move(self, direction, distance=1):
        blocks = super().move(direction, distance)

        for block in blocks:
            block.signals.player_collision.send(self.obj)

        return blocks
