export default class Record{
  constructor(ids) {
    // Construct mp {id: last play}
    this.mp = {}
    for(const id in ids){
      this.mp[id] = null
    }
  }
  // Returns true if a play of record is found
  has = (id) => this.mp[id] != null
  // Returns the play of a player and clears it
  get(id) {
    let play = this.mp[id]
    this.mp[id] = null
    return play
  }
  record(id, play) {
    this.mp[id] = play
  }
  reset() {
    // Reset all plays to 0.
    for (const id in this.mp) {
      this.mp[id] = null
    }
  }
}