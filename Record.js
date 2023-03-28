export default class Record{
  constructor(ids) {
    // Construct mp {id: last play}
    var mp = {}
    for(const id in ids){
      mp[id] = null
    }
  }
  // Returns true if a play of record is found
  has_played = (id) => this.plays[id] != null
  // Returns the play of a player and clears it
  use_play(id) {
    play = this.plays[id]
    this.plays[id] = null
    return play
  }
  reset() {
    // Reset all plays to 0.
    for (const id in this.plays) {
      this.plays[id] = null
    }
  }
}