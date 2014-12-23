from kivy.core.audio import SoundLoader
from kivy.properties import NumericProperty
from kivy.uix.floatlayout import FloatLayout
from kivy.uix.button import Button
from kivy.uix.image import Image
from kivy.uix.label import Label


class ComicSceneWidget(FloatLayout):

    page = NumericProperty(1)

    def __init__(self, scene, loadpoint, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.scene = scene
        self.image = Image(source=self.get_source())
        self.bind(page=self.update_source)
        self.add_widget(self.image)

        if loadpoint.sound:
            self._sound = SoundLoader.load(loadpoint.sound)
            self._sound.play()

    def get_source(self):
        return str(self.scene.loadpoint.path / 'page-{}.png'.format(self.page))

    def update_source(self, *args):
        self.image.source = self.get_source()
        


class ComicScene:

    def __init__(self, app, loadpoint):
        self.app = app
        self.loadpoint = loadpoint
        self.widget = ComicSceneWidget(self, loadpoint)

    def update(self, dt):
        if self.app.input.right.first:
            if self.widget.page < self.loadpoint.pages:
                self.widget.page += 1
            else:
                self.app.load_scene(self.loadpoint.exitpoint)

        elif self.app.input.left.first:
            if self.widget.page > 1:
                self.widget.page -= 1

    def unload(self):
        pass
