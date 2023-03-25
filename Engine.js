import Tools from './tools.js'

export default class Engine{
  // CONSTRUCTOR
  constructor(n_players, waittime){
    this.tools = new Tools()
    this.plays = this.tools.construct_plays(n_players)
    this.gamestate = {
      n_players: n_players,
      players: this.tools.construct_players(n_players),
      turn: 0,
      gameover: false,
    }
    this.waittime = 1000
    this.bots = this.tools.construct_bots(n_players, this)
    this.moves = [-1,1,2]
    this.onupdate = () => {}
    this.onplay = () => {}
  }


  // HELPER PRIVATE METHODS
  update(new_state) {
    this.onupdate(new_state)
    this.gamestate = new_state
    for (const id in this.bots) {
      this.bots[id].listen_state(new_state)
    }

  }
  update_plays(id,play) {
    this.onplay(id,play)
    this.plays = {...this.plays, [id]: play}
  }
  

  // PUBLIC METHODS
  play(id, play) {
    // Ignore the play if game is over
    if (this.gamestate.gameover == true) {
      return
    }
    // Log the play
    this.update_plays(id,play)
    // Check for wrongplay
    if (play == null || this.gamestate.turn != id) {
      this.update({...this.gamestate, gameover: true}) // todo: remove player
    }
    
  }

  listen_play(turn) {
    return new Promise(async resolve => {
      let ms = 0
      let move = 0
      // Get expected player's id. 
      let id = this.gamestate.players[turn]
      // Check every millisecond until waittime.
      while (move == 0 & ms < this.waittime) {
        // If play was recorded in gamestate, player has played!
        if (this.plays[id] != 0) {
          // Save the move before resetting
          move = this.plays[id]
          // Reset the state
          this.plays = {...this.plays, [id] : 0}
        }
        // Wait one ms before next check
        await this.tools.sleep(1)
        ms = ms + 1
      }
      // Return the played move. (0 if no move recorded.)
      resolve(move)
    })
  }
  
  async start() {
    console.log('Game started')
    // Start game loop
    let curr_play = 1
    while (this.gamestate.gameover == false) {
      let new_turn = this.tools.mod(this.gamestate.turn + curr_play, this.gamestate.n_players)
      this.update({...this.gamestate, turn: new_turn})
      // Listen for next play for {waittime} milliseconds
      curr_play = await this.listen_play(this.gamestate.turn)
      // After waiting for play, go to next round or remove player and pause the game.
      if (curr_play == 0) {
        this.update({...this.gamestate, gameover: true}) // todo: remove player
      }
    }
  }
}