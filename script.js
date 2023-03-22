import Engine from './Engine.js'

// GET DOC ELEMENTS
const counter = document.querySelector('.counter')
const log = document.querySelector('.log')

  
// START A GAME
const game = new Engine(counter, log, 4)
game.start()

// Listen for local player play
document.addEventListener("keydown", (e) => {game.play(0,e.key)})
