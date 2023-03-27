import Tools from './tools.js'

export default class Engine{
  // CONSTRUCTOR
  constructor(n_players, waittime){
    this.tools = new Tools()
    this.plays = this.tools.construct_plays(n_players) // {id: play (0,-1,2)}
    this.gamestate = {
      n_players: n_players, // number of alive players
      players: this.tools.construct_players(n_players), // [deque of alive ids]
      index: 0, // index in which curr turn is
      gamepaused: true,
      gameover: false,
      request_id: 0,
    }
    this.waittime = waittime
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
  reset_plays() {
    for (const id in this.plays) {
      this.plays[id] = 0
    }
  }

  pause(){
    var request_index = 0
    this.update({...this.gamestate, index: request_index, request_id: this.gamestate.players[request_index]}) // todo: remove player
  }
  unpause(){
    this.update({...this.gamestate,  request_id: null})
  }
  valid_play(play) {
    return (play != null) & (play != 0)
  }
  

  // PUBLIC METHODS
  play(id, play) {
    // Only consider the play if its been requested or game is not paused
    if ((this.gamestate.request_id == null) || (this.gamestate.request_id == id)) {
      // Log the play
      this.update_plays(id,play)
      // Check for wrong turn!
      if (this.gamestate.players[this.gamestate.index] != id) {
        this.pause()
      }
    }
  }

  request_play(id) {
    return new Promise(async resolve => {
      this.reset_plays()
      var play = null
      while (!this.valid_play(play)) {
        var play = await this.listen_play(id, this.waittime)
      }
      resolve(play)
      this.unpause()
    })
  }

  listen_play(id, wait) {
    return new Promise(async resolve => {
      console.log(`Listening for player with id: ${id}`)
      let ms = 0
      let play = 0
      // Get expected player's id. 
      // Check every millisecond until wait time.
      while (play == 0 & ms < wait) {
        // If play was recorded in gamestate, player has played!
        if (this.plays[id] != 0) {
          // Save the play before resetting
          play = this.plays[id]
          // Reset the state
          this.plays = {...this.plays, [id] : 0}
        }
        // Wait one ms before next check
        await this.tools.sleep(1)
        ms = ms + 1
      }
      // Return the played play. (0 if no play recorded.)
      resolve(play)
    })
  }
  
  async start() {
    console.log('Game started')
    // Start game loop
    // Request play to the first alive player (at index 0)
    while (this.gamestate.gameover == false) {
      // Request kick off play after a pause or at start.
      let play = await this.request_play(this.gamestate.request_id)
      while (this.gamestate.request_id == null) {
        let next_index = this.tools.mod(this.gamestate.index + play, this.gamestate.n_players)
        this.update({...this.gamestate, index: next_index})
        // Listen for next play for {waittime} milliseconds
        play = await this.listen_play(this.gamestate.players[this.gamestate.index], this.waittime)
        if (!this.valid_play(play)){
          this.pause()
        }
      }
    }
  }
}