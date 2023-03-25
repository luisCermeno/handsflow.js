import Tools from './tools.js'

export default class Engine{
  // CONSTRUCTOR
  constructor(n_players){
    this.tools = new Tools()
    this.plays = this.tools.construct_plays(n_players)
    this.gamestate = {
      n_players: n_players,
      players: this.tools.construct_players(n_players),
      turn: 0,
      gameover: false,
    }
    this.onupdate = () => {}
    this.onplay = () => {}
    this.moves = [-1,1,2]
  }


  // HELPER PRIVATE METHODS
  update(new_state) {
    this.onupdate(new_state)
    this.gamestate = new_state
  }
  update_plays(id,play) {
    this.onplay(id,play)
    this.plays = {...this.plays, [id]: play}
  }
  

  // PUBLIC METHODS
  play(id, play) {
    if (this.gamestate.gameover == true) {
      return
    }
    // Check for gameover
    if (play == null || this.gamestate.turn != id) {
      this.update({...this.gamestate, gameover: true}) // todo: remove player
    }
    // Log the play
    this.update_plays(id,play)

  }

  waitplay(turn) {
    return new Promise(async resolve => {
      let ms = 0
      let play = 0
      let id = this.gamestate.players[turn]
      while (play == 0 & ms < 500) {
        // AI always plays after half the time allowed
        if (ms > 250 & id != 0) {
          this.play(turn, this.tools.generate_play(this.moves))
        }
        // CHECK for play recorded in gamestate. Reset to false if found
        if (this.plays[id] != 0) {
          play = this.plays[id]
          this.plays = {...this.plays, [id] : 0}
        }
        // Wait one ms and continue
        await this.tools.sleep(1)
        ms = ms + 1
      }
      // After time allowed is done, return whether player has player or not
      resolve(play)
    })
  }
  
  async start() {
    console.log('Game started')
    // Print first turn
    // Start game loop
    let curr_play = 1
    while (this.gamestate.gameover == false) {
      let new_turn = this.tools.mod(this.gamestate.turn + curr_play, this.gamestate.n_players)
      this.update({...this.gamestate, turn: new_turn})
      // Wait for play
      curr_play = await this.waitplay(this.gamestate.turn)
      // After waiting for play
      if (curr_play == 0) {
        this.update({...this.gamestate, gameover: true}) // todo: remove player
      }
    }
  }
}