import Tools from './Tools.js'
import Record from './Record.js'
import Bot from './Bot.js'

export default class Engine{
  constructor(n_players, waittime){
    this.gamestate = {
      n_players: n_players, // number of alive players in table
      table: Tools.create_table(n_players), // [deque of alive player ids]
      index: 0, // current turn (index in table)
      gameover: false,
      request_id: 0, // if not null, game is requesting for a play to continue.
      loading: true,
    }
    this.plays = new Record(this.gamestate.table) // plays record {id: play (0,-1,2)}
    this.waittime = waittime // time given to react on turn.
    this.bots = Bot.spawn(n_players, this)
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
  is_paused = () => this.gamestate.request_id != null
  pause(){
    // Pause the game and set a new play request_id.
    var request_index = 0
    this.update({...this.gamestate, loading: true, index: request_index, request_id: this.gamestate.table[request_index]}) // todo: remove player
  }
  unpause(){
    // Unpause the game and unset current play request_id.
    this.update({...this.gamestate,  request_id: null})
  }
  judge(id,play){
    // Pause the game if play is invalid (missing or wrong key) or not in not correct turn
    if (!Tools.valid_play(play) || this.gamestate.table[this.gamestate.index] != id){
      this.pause()
    }
  }
  async buffer(ms){
    console.log('Loading...')
    // Clear plays record between rounds
    this.plays.reset()
    // Buffer time
    await Tools.sleep(ms)
    console.log('Load finished!')
    this.update({...this.gamestate, loading:false})
  }

  request_play(id) {
    return new Promise(async resolve => {
      var response = null
      // Do not return until requested player has made a play, even if invalid.
      while (response == null) {
        var response = await this.listen_play(id, this.waittime)
      }
      // Resolve promise with the play.
      resolve(response)
    })
  }

  // ****************************************
  // ******** PUBLIC METHODS ****************
  // ****************************************
  play(id, play) {
    if (this.gamestate.loading) {
      console.log('LOADING: Plays on loading not allowed!')
      return
    }
    // Only consider the play if game is not paused OR if its been requested.
    if (!(this.is_paused()) || (this.gamestate.request_id == id)) {
      console.log(`PLAY: Player ${id} played *${play}*!`)
      // Record and dispatch the play
      this.plays.record(id,play)
      this.onplay(id,play)
      // Judge from invalid or missing play.
      this.judge(id,play)
    }
  }

  listen_play(id, wait) {
    return new Promise(async resolve => {
      console.log(`LISTENING: Waiting for Player ${id} to play...`)
      let ms = 0
      let response = {interrupted: false, play: 0} // default: {no interruption and missing play}
      // Check every millisecond until {wait} ms has passed
      while (ms < wait) {
        // Break and resolve as soon as:
        // 1. An interruption occurs before player can play.
        if (this.is_paused() & this.gamestate.request_id != id) {
          response.interrupted = true
          break
        }
        // 2. Player plays , as play is found in record.
        if (this.plays.has(id)) {
          response.play = this.plays.get(id)
          break
        }
        // 3. In the last second: Force the player play the missing play
        if (ms == wait - 1) {
          this.play(id, 0)
        }
        await Tools.sleep(1)
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
      // Loading time between rounds.
      await this.buffer(2000)
      // Request kick off play.
      let response = await this.request_play(this.gamestate.request_id)
      // Only unpause after checking play is valid.
      if (Tools.valid_play(response.play)) {
        this.unpause()
      }
      // Start round loop
      while (!this.is_paused()) {
        let next_index = Tools.mod(this.gamestate.index + response.play, this.gamestate.n_players)
        this.update({...this.gamestate, index: next_index})
        // Listen for next play for {waittime} milliseconds (TODO: Handle concurrency bug. Unexpected play should interrupt this promise)
        let id = this.gamestate.table[this.gamestate.index]
        response = await this.listen_play(id , this.waittime)
        // At the end of any round, a play always happens regardless of whether it is a valid, invalid, missing, interruption play.
        // Thus, the play method is always called and therefore the judge method is always called.
        // The judge method will determine whether the round loop continues by pausing or unpausing the game.
      }
    }
  }
}