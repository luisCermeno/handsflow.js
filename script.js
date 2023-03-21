import Engine from './Engine.js'

// DOC ELEMENTS
const counter = document.querySelector('.counter')
const ui = document.querySelector('.ui')

  
// MAIN
// timer(counter)
const game = new Engine(counter)
game.start()
console.log('Executing other stuff')
