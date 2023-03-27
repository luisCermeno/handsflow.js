import Tools from './tools.js'

export default class Bot{
  constructor(id, game) {
    this.id = id
    this.game = game
    this.tools = new Tools()
  }

  async listen_state(new_state){
    // If its bot's turn, disptach play.
    if (new_state.request_id == null & new_state.players[new_state.index] == this.id) {
      console.log(`Bot ${this.id} says: my turn!`)
      // Get a random delay time to simulate human doubt behaviour.
      var delay = this.tools.randint(this.game.waittime / 4 , this.game.waittime)
      // Wait half the waiting time before plays
      await this.tools.sleep(delay)
      // Dispatch play
      this.game.play(this.id, this.tools.generate_play(this.game.moves))
    }
  }
}