import Engine from './engine.js'

// GET DOC ELEMENTS
const gamestate = document.querySelector('.gamestate')
const log = document.querySelector('.log')
const moves = {
  1: 'Forward!',
  [-1]: 'Reverse!',
  2: 'Skip!',
  
}
const keys = {
  'F': 1,
  'R': -1,
  'S': 2,
}
// UI HANDLERS
function update_UI (state) {
  if (state.gamepaused == true) {
    gamestate.innerHTML = 'GAME PAUSED!'
  } else{
    gamestate.innerHTML = state.index.toString()
  }
  
}

function update_log(id,play) {
  let newlog = document.createElement('div')
  let parsed_play = moves[play]
  if (parsed_play == null) {
    newlog.innerHTML = `Player ${id} played a Wrong Key!`
  } else {
    newlog.innerHTML = `Player ${id} played ${parsed_play}`
  }
  log.appendChild(newlog)
}


// START A GAME
const game = new Engine(4, 500)
game.onupdate = update_UI
game.onplay = update_log

// game.onplay = updatelog
game.start()

// Listen for local player play
document.addEventListener("keydown", (e) => {game.play(0,keys[e.key.toUpperCase()])})
