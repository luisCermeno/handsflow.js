export default class Engine{
  // CONSTRUCTOR
  constructor(n_players){
    this.n_players = n_players
    this.turn = 0
    this.gameover = false
    this.onupdate = (new_state) => {console.log(`New state: ${new_state}`)}
    this.onplay = (player,play) => {console.log(`Player ${player} played ${play}`)}
  }

  // HELPER PRIVATE METHODS
  sleep = ms => new Promise(resolve => setTimeout(() => {resolve()}, ms));
  
  async run() {
    console.log('Game started')
    // Print first turn
    // Start game loop
    while (this.gameover == false) {
      this.turn = (this.turn + 1) % this.n_players
      this.onupdate(this.turn)
      await this.sleep(2000)
    }
  }

  // PUBLIC METHODS
  play(player, play) {
    if (this.gameover) {
      return
    }
    // Log the play
    this.onplay(player,play)

    // Check for gameover
    if (this.turn != player) {
      this.gameover = true
    }
  }

  start() {
    this.run()
  }

}