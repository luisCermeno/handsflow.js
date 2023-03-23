import Engine from './Engine.js'

// GET DOC ELEMENTS
const gamestate = document.querySelector('.gamestate')
const log = document.querySelector('.log')

// UI HANDLERS
function updateUI (state) {
  gamestate.innerHTML = state.turn.toString()
  let new_log = 'Plays: '

  for(const [k, v] of Object.entries(state.plays)) {
    new_log = new_log + `[${k}:${v}]`
  }
  log.innerHTML = new_log
}
// function updatelog(player,play) {
//   const new_log = document.createElement('div')
//   new_log.innerHTML = `Player ${player} played ${play}`
//   log.append(new_log)
// };

// START A GAME
const game = new Engine(4)
game.onupdate = updateUI
// game.onplay = updatelog
game.start()

// Listen for local player play
document.addEventListener("keydown", (e) => {game.play(0,e.key)})
