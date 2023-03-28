import Tools from './Tools.js'

export default class Bot{
  static spawn = (n_players, game) => {
    var bots = {}
    for(let id = 1; id < n_players; id++){
      bots[id] = new Bot(id, game)
    }
    return bots
  }
  constructor(id, game) {
    this.id = id
    this.game = game
  }
  async listen_state(new_state){
    // If its bot's turn, disptach play.
    if (new_state.request_id == null & new_state.table[new_state.index] == this.id) {
      // Get a random delay time to simulate human doubt behaviour.
      var delay = Tools.randint(this.game.waittime / 4 , this.game.waittime)
      // Wait half the waiting time before plays
      await Tools.sleep(delay)
      // Dispatch play
      console.log(`BOT ${this.id}: My turn!`)
      this.game.play(this.id, Tools.generate_play(this.game.moves))
    }
  }
}