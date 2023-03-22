export default class Engine{
  // CONSTRUCTOR
  constructor(output,log,n_players){
    this.output = output
    this.log = log
    this.turn = 0
    this.n_players = n_players
    this.gameover = false
    console.log(`New engine constructed with ${output}`)
  }

  // HELPER PRIVATE METHODS
  sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  async run() {
    console.log('Game started')
    // Print first turn
    // Start game loop
    while (this.gameover == false) {
      this.turn = (this.turn + 1) % this.n_players
      this.output.innerHTML = this.turn.toString()
      await this.sleep(1000)
    }
    this.output.innerHTML = 'Game Over'
  }

  // PUBLIC METHODS
  play(player, move) {
    if (this.gameover) {
      return
    }
    // Log the play
    const new_log = document.createElement('div')
    new_log.innerHTML = `Player ${player} played ${move}`
    this.log.append(new_log)

    // Check for gameover
    if (this.turn != player) {
      this.gameover = true
    }
  }

  start() {
    this.run()
  }

}