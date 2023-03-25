import Tools from './tools.js'

export default class Engine{
  // CONSTRUCTOR
  constructor(n_players, waittime){
    this.tools = new Tools()
    this.plays = this.tools.construct_plays(n_players)
    this.gamestate = {
      n_players: n_players,
      players: this.tools.construct_players(n_players),
      index: 0,
      gamepaused: true,
      gameover: false,
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
  pause(){
    this.update({...this.gamestate, index: 0, gamepaused: true}) // todo: remove player
  }
  valid_play(play) {
    return (play != null) & (play != 0)
  }
  

  // PUBLIC METHODS
  play(id, play) {
    // Log the play
    this.update_plays(id,play)
    // Check for wrong turn!
    if (this.gamestate.players[this.gamestate.index] != id) {
      this.pause()
    }
    
  }

  request_play(index) {
    return new Promise(async resolve => {
      var move = await this.listen_play(index, this.waittime * 10)
      this.update({...this.gamestate,  gamepaused: false})
      resolve(move)
    })
  }

  listen_play(index, wait) {
    return new Promise(async resolve => {
      console.log(`Listening for play from index: ${index}`)
      let ms = 0
      let move = 0
      // Get expected player's id. 
      let id = this.gamestate.players[index]
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
      // Request kick off play after a pause or at start.
      let curr_play = await this.request_play(this.gamestate.index)
      while (this.valid_play(curr_play) & this.gamestate.gamepaused == false) {
        let new_turn = this.tools.mod(this.gamestate.index + curr_play, this.gamestate.n_players)
        this.update({...this.gamestate, index: new_turn})
        // Listen for next play for {waittime} milliseconds
        curr_play = await this.listen_play(this.gamestate.index, this.waittime)
      }
      this.pause()
    }
  }
}