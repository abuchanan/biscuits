from kivy.uix.anchorlayout import AnchorLayout
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.button import Button
from kivy.uix.label import Label


class StartSceneWidget(AnchorLayout):

    def __init__(self, scene, *args, **kwargs):
        super().__init__(*args, **kwargs)

        container = BoxLayout(orientation='vertical', anchor_x='center',
                              anchor_y='center', size_hint=(.75, .25))
        self.add_widget(container)

        label = Label(text="Biscuits")
        container.add_widget(label)

        button = Button(text='Start', height=50, width=200,
                        size_hint=(None, None), pos_hint={'center_x': 0.5})
        button.bind(on_press=lambda *args: scene.start_game())
        container.add_widget(button)


class StartScene:

    def __init__(self, app):
        self.app = app
        self.widget = StartSceneWidget(self)

    def start_game(self):
        self.app.load_scene('Loadpoint 1a')

    def update(self, dt):
        pass

    def unload(self):
        pass
