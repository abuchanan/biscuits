from biscuits.objects.squirrel import Squirrel
from biscuits.character import Life


class BossSquirrel(Squirrel):

    life = Life(10)

    def on_destroy(self, *args):
        self.scene.load_scene('win comic')
