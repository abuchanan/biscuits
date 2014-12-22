from biscuits.character import CharacterBody


class PlayerBody(CharacterBody):

    def __init__(self, player, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.player = player

    def move(self, direction, distance=1):
        blocks = super().move(direction, distance)

        for block in blocks:
            block.signals.player_collision.send(self.player)

        return blocks
