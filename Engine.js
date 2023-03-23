export default class Engine{
  // CONSTRUCTOR
  constructor(n_players){
    var plays_obj = {}
    for(let i = 0; i < n_players; i++){
      plays_obj[i] = false
    }

    this.gamestate = {
      n_players: n_players,
      turn: 0,
      gameover: false,
      plays: plays_obj
    }
    
    this.onupdate = (new_state) => {console.log(`New state: ${new_state}`)}
    this.onplay = (player,play) => {console.log(`Player ${player} played ${play}`)}
  }


  // HELPER PRIVATE METHODS
  sleep = ms => new Promise(resolve => setTimeout(() => {resolve()}, ms));
  update(new_state) {
    this.gamestate = new_state
    this.onupdate(new_state)
  }

  // PUBLIC METHODS
  play(player, play) {
    if (this.gamestate.gameover == true) {
      return
    }
    // Log the play
    this.onplay(player,play)
    this.update({...this.gamestate, plays: {...this.gamestate.plays, [player]: true}})
    // Check for gameover
    if (this.gamestate.turn != player) {
      this.update({...this.gamestate, gameover: true})
    }
  }

  async start() {
    console.log('Game started')
    // Print first turn
    // Start game loop
    while (this.gamestate.gameover == false) {
      this.update({...this.gamestate, turn: (this.gamestate.turn + 1) % this.gamestate.n_players})
      await this.sleep(2000) // TODO: await for checkplay!!s

    }
  }

}