from biscuits.character import CharacterBody


class PlayerBody(CharacterBody):

    def __init__(self, player, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.player = player

    def move(self, direction, distance=1):
        blocked, collisions = super().move(direction, distance)

        for hit in collisions:
            hit.signals.player_collision.send(self.player)

        return blocked, collisions
