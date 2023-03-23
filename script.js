import Engine from './Engine.js'

// GET DOC ELEMENTS
const gamestate = document.querySelector('.gamestate')
const log = document.querySelector('.log')

// UI HANDLERS
function update_UI (state) {
  if (state.gameover == true) {
    gamestate.innerHTML = 'GAMEOVER!'
  } else{
    gamestate.innerHTML = state.turn.toString()
  }
  
}

function update_log(player,play) {
  console.log(`Player ${player} played ${play}`)
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
document.addEventListener("keydown", (e) => {game.play(0,e.key)})
