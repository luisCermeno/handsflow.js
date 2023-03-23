export default class Engine{
  // CONSTRUCTOR
  constructor(n_players){
    var plays_obj = {}
    for(let i = 0; i < n_players; i++){
      plays_obj[i] = false
    }

    this.plays = plays_obj
    this.gamestate = {
      n_players: n_players,
      turn: 0,
      gameover: false,
    }
    
    this.onupdate = () => {}
    this.onplay = () => {}
    this.moves = [-1,1,2]
  }


  // HELPER PRIVATE METHODS
  sleep = ms => new Promise(resolve => setTimeout(() => {resolve()}, ms));
  getRandomInt = max => Math.floor(Math.random() * max); // max not inclusive
  mod = (n,m) => ((n % m) + m) % m
  generate_play = () => this.moves[this.getRandomInt(this.moves.length)]

  update(new_state) {
    this.onupdate(new_state)
    this.gamestate = new_state
  }
  update_plays(player,play) {
    this.onplay(player,play)
    this.plays = {...this.plays, [player]: play}
  }
  

  // PUBLIC METHODS
  play(player, play) {
    if (this.gamestate.gameover == true) {
      return
    }
    // Check for gameover
    if (play == null || this.gamestate.turn != player) {
      this.update({...this.gamestate, gameover: true})
    }
    // Log the play
    this.update_plays(player,play)

  }

  waitplay = player => new Promise(async resolve => {
    let ms = 0
    let play = 0
    while (play == 0 & ms < 500) {
      // AI always plays after half the time allowed
      if (ms > 250 & player != 0) {
        this.play(player, this.generate_play())
      }
      // CHECK for play recorded in gamestate. Reset to false if found
      if (this.plays[player] != 0) {
        play = this.plays[player]
        this.plays = {...this.plays, [player] : 0}
      }
      // Wait one ms and continue
      await this.sleep(1)
      ms = ms + 1
    }
    // After time allowed is done, return whether player has player or not
    resolve(play) 
  })
  
  async start() {
    console.log('Game started')
    // Print first turn
    // Start game loop
    let curr_play = 1
    while (this.gamestate.gameover == false) {
      this.update({...this.gamestate, turn: this.mod(this.gamestate.turn + curr_play, this.gamestate.n_players) })
      // Wait for play
      curr_play = await this.waitplay(this.gamestate.turn)
      // After waiting for play, gameover is user didnt play (TODO: remove one hand!)
      if (curr_play == 0) {
        this.update({...this.gamestate, gameover: true})
      }
    }
  }
}