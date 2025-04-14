export enum CommonEvents {
  EVENT_KEYDOWN = "onKeyDown",
  EVENT_KEYUP = "onKeyUp",
  EVENT_KEYPRESS = "onKeyPress",
  EVENT_KEY_LONG_PRESS = "onKeyLongPress",
  EVENT_KEY_REPEAT = "onKeyRepeat",
  EVENT_KEY_COMBINATION = "onKeyCombination",
  EVENT_KEY_SEQUENCE = "onKeySequence",
  EVENT_KEY_FOCUS = "onKeyFocus",
  EVENT_KEY_BLUR = "onKeyBlur",

  // Mouse Events
  EVENT_MOUSE_DOWN = "onMouseDown",
  EVENT_MOUSE_UP = "onMouseUp",
  EVENT_MOUSE_MOVE = "onMouseMove",
  EVENT_MOUSE_ENTER = "onMouseEnter",
  EVENT_MOUSE_LEAVE = "onMouseLeave",
  EVENT_MOUSE_OVER = "onMouseOver",
  EVENT_MOUSE_OUT = "onMouseOut",
  EVENT_MOUSE_CLICK = "onClick",
  EVENT_MOUSE_DOUBLE_CLICK = "onDoubleClick",
  EVENT_MOUSE_RIGHT_CLICK = "onContextMenu",
  EVENT_MOUSE_WHEEL = "onWheel",
  EVENT_MOUSE_DRAG_START = "onDragStart",
  EVENT_MOUSE_DRAG = "onDrag",
  EVENT_MOUSE_DRAG_END = "onDragEnd",
  EVENT_MOUSE_DROP = "onDrop",


  // Game Events
  EVENT_UPDATE = "onGameUpdate",
  EVENT_WORLD_INIT = "onWorldInitialized",
  EVENT_PRE_RENDER = "onGamePreRender"
}