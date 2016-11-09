export function startGame() {
  return {
    type: 'START_GAME',
  };
}

export function tick() {
  return {
    type: 'TICK',
  };
}

export function moveLeft() {
  return {
    type: 'MOVE_LEFT',
  };
}

export function moveRight() {
  return {
    type: 'MOVE_RIGHT',
  };
}

export function drop() {
  return {
    type: 'DROP',
  };
}

export function rotate() {
  return {
    type: 'ROTATE',
  };
}

export function pause() {
  return {
    type: 'PAUSE',
  };
}

export function unpause() {
  return {
    type: 'UNPAUSE',
  };
}
