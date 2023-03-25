import Bot from "./bot.js";

export default class Tools{
  sleep = ms => new Promise(resolve => setTimeout(() => {resolve()}, ms));
  randint(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
  }
  mod = (n,m) => ((n % m) + m) % m
  generate_play = (moves) => moves[this.randint(0, moves.length)]
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
  construct_bots = (n_players, game) => {
    var bots = {}
    for(let id = 1; id < n_players; id++){
      bots[id] = new Bot(id, game)
    }
    return bots
  }
}