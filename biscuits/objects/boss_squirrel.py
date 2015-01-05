from biscuits.objects.squirrel import Squirrel
from biscuits.character import Life


class BossSquirrel(Squirrel):

    life = Life(10)

    def destroy(self):
        super().destroy()
        self.app.load_scene('win comic')
