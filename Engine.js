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
    
    this.onupdate = (new_state) => {}
  }


  // HELPER PRIVATE METHODS
  sleep = ms => new Promise(resolve => setTimeout(() => {resolve()}, ms));
  update(new_state) {
    this.onupdate(new_state)
    this.gamestate = new_state
  }

  // PUBLIC METHODS
  play(player, play) {
    if (this.gamestate.gameover == true) {
      return
    }
    // Log the play
    this.update({...this.gamestate, plays: {...this.gamestate.plays, [player]: true}})
    // Check for gameover
    if (this.gamestate.turn != player) {
      this.update({...this.gamestate, gameover: true})
    }
  }

  waitplay = player => new Promise(async resolve => {
    let ms = 0
    let hasplayed = false
    while (hasplayed == false & ms < 500) {
      // AI always plays after half the time allowed
      if (ms > 250 & player != 0) {
        this.play(player,'2')
      }
      // CHECK for play recorded in gamestate. Reset to false if found
      if (this.gamestate.plays[player] == true) {
        this.gamestate = {...this.gamestate, plays: {...this.gamestate.plays, [player]: false}}
        hasplayed = true
      }
      // Wait one ms and continue
      await this.sleep(1)
      ms = ms + 1
    }
    // After time allowed is done, return whether player has player or not
    resolve(hasplayed) 
  })
  
  async start() {
    console.log('Game started')
    // Print first turn
    // Start game loop
    while (this.gamestate.gameover == false) {
      this.update({...this.gamestate, turn: (this.gamestate.turn + 1) % this.gamestate.n_players})
      // Wait for play
      let hasplayed = await this.waitplay(this.gamestate.turn)
      // After waiting for play, gameover is user didnt play (TODO: remove one hand!)
      if (hasplayed == false) {
        this.update({...this.gamestate, gameover: true})
      }
    }
  }
}