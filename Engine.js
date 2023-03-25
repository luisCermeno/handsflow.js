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
      gamepaused: true,
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
    // Log the play
    this.update_plays(id,play)
    // Check for wrongplay
    if (play == null || this.gamestate.turn != id) {
      this.update({...this.gamestate, gamepaused: true}) // todo: remove player
    }
    
  }

  request_play(turn) {
    return new Promise(async resolve => {
      var move = await this.listen_play(turn, this.waittime * 10)
      this.update({...this.gamestate, gamepaused: false})
      resolve(move)
    })
  }

  listen_play(turn, wait) {
    return new Promise(async resolve => {
      console.log(`Listening for play from index: ${turn}`)
      let ms = 0
      let move = 0
      // Get expected player's id. 
      let id = this.gamestate.players[turn]
      // Check every millisecond until wait time.
      while (move == 0 & ms < wait) {
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
    // Request play to the first alive player (at index 0)
    while (this.gamestate.gameover == false) {
      let curr_play = await this.request_play(this.gamestate.turn)
      while (this.gamestate.gamepaused == false) {
        // If play was not recorded, TODO: kill the player
        if (curr_play == 0) {
          this.update({...this.gamestate, turn: 0, gamepaused: true}) // todo: remove player
          break
        }
        let new_turn = this.tools.mod(this.gamestate.turn + curr_play, this.gamestate.n_players)
        this.update({...this.gamestate, turn: new_turn})
        // Listen for next play for {waittime} milliseconds
        curr_play = await this.listen_play(this.gamestate.turn, this.waittime)
      }
    }
  }
}