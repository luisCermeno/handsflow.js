export default class Bot{
  constructor(id, game) {
    this.id = id
    this.game = game
  }

  listen_state(new_state){
    if (new_state.turn == this.id) {
      console.log(`Bot ${this.id} says: my turn!`)
    }
  }
}