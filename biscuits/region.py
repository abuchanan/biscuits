from kivy.uix.relativelayout import RelativeLayout


class Region:

    def __init__(self, loader, region_config):

        self.loader = loader
        self.widget = RelativeLayout()
        self.objects = set()

        for tile in region_config.tiles:
            self.widget.add_widget(tile.image)

        for ID in region_config.object_IDs:
            self.load_object(ID)


    def update(self, dt):
        for obj in self.objects:
            obj.signals.update.send(dt)


    def load_object(self, ID):
        obj = self.loader.load(ID)

        obj.signals.destroy.connect(self.cleanup)
        self.objects.add(obj)

        try:
            # TODO
            self.widget.add_widget(obj.widget._kivy_widget)
        except AttributeError:
            pass

    def cleanup(self, obj):
        self.objects.remove(obj)

        # TODO consider using weakref.finalize
        try:
            self.widget.remove_widget(obj.widget._kivy_widget)
        except AttributeError:
            pass
