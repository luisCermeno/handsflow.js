export default class Tools{
  sleep = ms => new Promise(resolve => setTimeout(() => {resolve()}, ms));
  randint = max => Math.floor(Math.random() * max); // max not inclusive
  mod = (n,m) => ((n % m) + m) % m
  generate_play = (moves) => moves[this.randint(moves.length)]
  construct_plays = (n_players) => {
    var plays_obj = {}
    for(let i = 0; i < n_players; i++){
      plays_obj[i] = false
    }
    return plays_obj
  }
  construct_players = (n_players) => {
    var players_l = []
    for(let id = 0; id < n_players; id++){
      players_l.push(id)
    }
    return players_l
  }
}