from biscuits.objects.squirrel import Squirrel

class BossSquirrel(Squirrel):

    def init(self, *args, **kwargs):
        super().init(*args, **kwargs)
        self.life = 10

    def destroy(self):
        super().destroy()
        self.app.load_scene('win comic')
