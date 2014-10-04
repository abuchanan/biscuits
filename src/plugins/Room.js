import {Body} from 'src/world';
import {BackgroundGrid} from 'src/background';
import {ObjectScope} from 'src/scope';
import {ObjectConfig} from 'src/config';
import {Types} from 'src/types';
import {Loader} from 'src/utils';

@ObjectScope
function setupRoom(grid: BackgroundGrid, config: ObjectConfig) {
  config.roomTiles = [];

  grid.forEach(function(tile) {

    if (tile.x >= config.x &&
        tile.x <= config.x + config.w &&
        tile.y >= config.y &&
        tile.y <= config.y + config.h) {

      config.roomTiles.push(tile);
      tile.visible = false;
    }
  });
}

// TODO need initial check for locatino of player to know which room
//      is initiallly visible

// TODO need event for when player leaves room, for hiding/dimming tiles


// TODO this should not be background specific, but generic to all objects
//      in a region. e.g. when a player leaves a room, the jars/coins/etc
//      need to be hidden/dimmed too
/*
  need to:
  - be able to query all objects in a given rectangle
  - send active/inactive events to those objects
  - those objects should render appropriately

  questions:
  - need to ensure that all areas are covered by a region?
  - how to handle locked room?
  - maybe want containing layer, so that objects don't have to worry about rendering
    active/inactive styles are applied to the container.
*/

@ObjectScope
function RoomCollision(config: ObjectConfig, body: Body) {

  body.events.on('player collision', function(playerBody) {
    console.log('room', config.roomTiles.length);
    config.roomTiles.forEach((tile) => {
      tile.visible = true;
    });
  });
}


Types['room'] = new Loader().runs(Body, setupRoom, RoomCollision);
