from kivy.properties import ObjectProperty
from kivy.uix.gridlayout import GridLayout
from kivy.uix.image import Image


class TileGrid(GridLayout):
    """Creates a Kivy grid and puts the tiles in a TiledMap in it."""

    def __init__(self, layer, tileheight, tilewidth, **kwargs):

        super().__init__(
            rows=layer.height,
            cols=layer.width,
            row_force_default=True,
            col_force_default=True,
            row_default_height=tileheight,
            col_default_width=tilewidth,
            **kwargs
        )

        for tile in layer.tiles():
            x, y, texture = tile
            image = Image(texture=texture, size=texture.size)
            self.add_widget(image)

        self.bind(minimum_size=self.update)
        self.size_hint = (None, None)

    def update(self, *args):
        self.size = self.minimum_size
