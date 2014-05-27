// There is almost no agreement between browser APIs about keyboard events.
// Firefox has initKeyEvent, others have initKeyboardEvent. The browsers
// with initKeyboardEvent have take different arguments to that function.
// It's a mess.
// 
// Luckily, it seems like we can sidestep most of that mess by using
// Events instead of KeyboardEvents.
// Many thanks to http://stackoverflow.com/a/14469275/1062565
module.exports = KeyEventsHelper;

function KeyEventsHelper(element) {
  return {
    keydown: function(k) {
      this._dispatchKeyEvent('keydown', k);
    },
    keyup: function(k) {
      this._dispatchKeyEvent('keyup', k);
    },
    _dispatchKeyEvent: function(type, keyCode) {

      var eventObj;
      if (document.createEventObject) {
        eventObj = document.createEventObject();
      } else {
        eventObj = document.createEvent("Events");
      }
    
      if (eventObj.initEvent) {
        eventObj.initEvent(type, true, true);
      }
    
      eventObj.keyCode = keyCode;
      eventObj.which = keyCode;
      
      if (element.dispatchEvent) {
        element.dispatchEvent(eventObj);
      } else {
        element.fireEvent("on" + type, eventObj); 
      }
    }
  };
}
