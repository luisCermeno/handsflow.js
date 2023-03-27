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
      gameover: false,
      request_id: 0,
    }
    this.waittime = waittime
    this.bots = this.tools.construct_bots(n_players, this)
    this.moves = [-1,1,2]
    this.onupdate = () => {}
    this.onplay = () => {}
  }

  // ****************************************
  // ******** PRIVATE METHODS ***************
  // ****************************************
  update(new_state) {
    // Update state
    this.gamestate = new_state
    // Dispatch update to client
    this.onupdate(new_state)
    // Dispatch update to bots
    for (const id in this.bots) {
      this.bots[id].listen_state(new_state)
    }

  }
  update_plays(id,play) {
    // Update plays
    this.plays = {...this.plays, [id]: play}
    // Dispatch update to client
    this.onplay(id,play)
  }
  reset_plays() {
    // Set all active plays to 0.
    for (const id in this.plays) {
      this.plays[id] = 0
    }
  }
  pause(){
    // Pause the game and set a new play request_id.
    var request_index = 0
    this.update({...this.gamestate, index: request_index, request_id: this.gamestate.players[request_index]}) // todo: remove player
  }
  unpause(){
    // Unpause the game and unset current play request_id.
    this.update({...this.gamestate,  request_id: null})
  }
  valid_play(play) {
    // Validate a play
    return (play != null) & (play != 0)
  }
  judge(id,play){
    // Pause the game if play is invalid or not in not correct turn
    if (!this.valid_play(play) || this.gamestate.players[this.gamestate.index] != id){
      this.pause()
    }
  }

  // ****************************************
  // ******** PUBLIC METHODS ****************
  // ****************************************
  play(id, play) {
    // Only consider the play if game is not paused OR if its been requested.
    if ((this.gamestate.request_id == null) || (this.gamestate.request_id == id)) {
      console.log(`PLAY: Player ${id} played *${play}*!`)
      // Record and dispatch the play
      this.update_plays(id,play)
      // First play judge: Handles wrong play and wrong turn
      this.judge(id,play)
    }
  }

  request_play(id) {
    return new Promise(async resolve => {
      this.reset_plays()
      var play = null
      while (!this.valid_play(play)) {
        var response = await this.listen_play(id, this.waittime)
        play = response.play
      }
      resolve(play)
      this.unpause()
    })
  }

  listen_play(id, wait) {
    return new Promise(async resolve => {
      console.log(`LISTENING: Waiting for Player ${id} to play...`)
      let ms = 0
      let play = 0
      let interrupted = false
      // Get expected player's id. 
      // Check for a play every millisecond until:
      // - Play is recorded.
      // - Game has paused and its waiting for another player.
      while (play == 0 & ms < wait) {
        // If an interruption occurs before player can play, break inmediately.
        if (this.gamestate.request_id != null & this.gamestate.request_id != id) {
          interrupted = true
          break
        }
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
      resolve({interrupted: interrupted, play: play})
    })
  }
  
  async start() {
    console.log('Game Started')
    // Start game loop
    // Request play to the first alive player (at index 0)
    while (this.gamestate.gameover == false) {
      // Request kick off play after a pause or at start.
      let play = await this.request_play(this.gamestate.request_id)
      while (this.gamestate.request_id == null) {
        let next_index = this.tools.mod(this.gamestate.index + play, this.gamestate.n_players)
        this.update({...this.gamestate, index: next_index})
        // Listen for next play for {waittime} milliseconds (TODO: Handle concurrency bug. Unexpected play should interrupt this promise)
        let id = this.gamestate.players[this.gamestate.index]
        let response = await this.listen_play(id , this.waittime)
        play = response.play
        // Second play judge: Handle missing play. (Only if player was not interrupted).
        if (response.interrupted == false) {
          this.judge(id,play)
        }
        else {
          console.log(`Player ${id} was interrupted. Dont judge him!`)
        }
      }
    }
  }
}