import Engine from './Engine.js'

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
  if (state.gameover == true) {
    gamestate.innerHTML = 'GAMEOVER!'
  } else{
    gamestate.innerHTML = state.turn.toString()
  }
  
}

function update_log(player,play) {
  let newlog = document.createElement('div')
  let parsed_play = moves[play]
  if (parsed_play == null) {
    newlog.innerHTML = `Player ${player} played a Wrong Key!`
  } else {
    newlog.innerHTML = `Player ${player} played ${parsed_play}`
  }
  log.appendChild(newlog)
}


// function updatelog(player,play) {
//   const new_log = document.createElement('div')
//   new_log.innerHTML = `Player ${player} played ${play}`
//   log.append(new_log)
// };

// START A GAME
const game = new Engine(4)
game.onupdate = update_UI
game.onplay = update_log

// game.onplay = updatelog
game.start()

// Listen for local player play
document.addEventListener("keydown", (e) => {game.play(0,keys[e.key.toUpperCase()])})
