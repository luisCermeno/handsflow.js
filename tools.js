export default class Tools{
  static sleep = ms => new Promise(resolve => setTimeout(() => {resolve()}, ms));
  static randint(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
  }
  static mod = (n,m) => ((n % m) + m) % m
  static generate_play = (moves) => moves[this.randint(0, moves.length)]
  static valid_play = play => (play != null) & (play != 0)
  static create_table = (n_players) => {
    var table = []
    for(let id = 0; id < n_players; id++){
      table.push(id)
    }
    return table
  }
}