import Engine from './engine.js'

// GET DOC ELEMENTS
const gamestate = document.querySelector('.gamestate')
const log = document.querySelector('.log')
const moves = {
  0: 'No Play!',
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
  let ui = ''
  if (state.loading) {
    ui = 'Loading...'
  }
  else if (state.request_id != null) {
    ui = `Player ${state.request_id} starts the round! <br><br> Press S: Skip , F: Forward or R: Reverse!`
  } else{
    let index = state.index
    let table = state.table
    for(const i in table){
      if (i == index) {
        ui += `<b>${table[i]}</b>, `
      } else{
        ui += `${table[i]}, `
      }
    }
  }
  gamestate.innerHTML = ui
  
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
const game = new Engine(4, 1000)
game.onupdate = update_UI
game.onplay = update_log

// game.onplay = updatelog
game.start()

// Listen for local player play
document.addEventListener("keydown", (e) => {game.play(0,keys[e.key.toUpperCase()])})
