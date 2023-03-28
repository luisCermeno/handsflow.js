import Tools from './tools.js'
import Record from './Record.js'
export default class Engine{
  // CONSTRUCTOR
  constructor(n_players, waittime){
    this.tools = new Tools() // tools library
    this.gamestate = {
      n_players: n_players, // number of alive players in table
      table: this.tools.construct_table(n_players), // [deque of alive player ids]
      index: 0, // current turn (index in table)
      gameover: false,
      request_id: 0, // if not null, game is requesting for a play to continue.
    }
    this.plays = new Record(this.gamestate.table) // plays record {id: play (0,-1,2)}
    this.waittime = waittime // time given to react on turn.
    this.bots = this.tools.construct_bots(n_players, this)
    this.moves = [-1,1,2] // allowed moves.
    this.onupdate = () => {} // client dispatcher on gamestate change
    this.onplay = () => {} // client dispatcher on plays change
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
    // Record play
    this.plays.record(id,play)
    // Dispatch update to client
    this.onplay(id,play)
  }
  is_paused = () => this.gamestate.request_id != null
  pause(){
    // Pause the game and set a new play request_id.
    var request_index = 0
    this.update({...this.gamestate, index: request_index, request_id: this.gamestate.table[request_index]}) // todo: remove player
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
    // Pause the game if play is invalid (missing or wrong key) or not in not correct turn
    if (!this.valid_play(play) || this.gamestate.table[this.gamestate.index] != id){
      this.pause()
    }
  }

  // ****************************************
  // ******** PUBLIC METHODS ****************
  // ****************************************
  play(id, play) {
    // Only consider the play if game is not paused OR if its been requested.
    if (!(this.is_paused()) || (this.gamestate.request_id == id)) {
      console.log(`PLAY: Player ${id} played *${play}*!`)
      // Record and dispatch the play
      this.update_plays(id,play)
      // First play judge: Handles wrong play and wrong turn
      this.judge(id,play)
    }
  }

  request_play(id) {
    return new Promise(async resolve => {
      var response = null
      // Freeze the game until requested player has made a valid play.
      while (response == null || !this.valid_play(response.play)) {
        var response = await this.listen_play(id, this.waittime)
      }
      // Resolve promise with a guaranteed valid play in response. 
      resolve(response)
      // Unpause the game
      this.unpause()
    })
  }

  listen_play(id, wait) {
    return new Promise(async resolve => {
      console.log(`LISTENING: Waiting for Player ${id} to play...`)
      let ms = 0
      let response = {interrupted: false, play: null}
      // Check every millisecond until {wait} ms has passed
      while (ms < wait) {
        // Break and resolve as soon as:
        // 1. An interruption occurs before player can play.
        if (this.is_paused() & this.gamestate.request_id != id) {
          response.interrupted = true
          break
        }
        // 2. Player plays , a play is found in record.
        if (this.plays.has(id)) {
          // Construct response
          response.play = this.plays.use(id)
          break
        }
        await this.tools.sleep(1)
        ms = ms + 1
      }
      // Resolve promise with the concluded response.
      resolve(response)
    })
  }
  
  async start() {
    console.log('Game Started')
    // Start game loop
    while (this.gamestate.gameover == false) {
      // Clear plays record between rounds
      this.plays.reset()
      // Request kick off play.
      let response = await this.request_play(this.gamestate.request_id)
      // Start round loop
      while (!this.is_paused()) {
        let next_index = this.tools.mod(this.gamestate.index + response.play, this.gamestate.n_players)
        this.update({...this.gamestate, index: next_index})
        // Listen for next play for {waittime} milliseconds (TODO: Handle concurrency bug. Unexpected play should interrupt this promise)
        let id = this.gamestate.table[this.gamestate.index]
        response = await this.listen_play(id , this.waittime)
        // Second play judge: Handle missing play. (Only if player was not interrupted).
        if (response.interrupted == false) {
          this.judge(id,response.play)
        }
        else {
          console.log(`Player ${id} was interrupted. Dont judge him!`)
        }
      }
    }
  }
}