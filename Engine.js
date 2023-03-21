export default class Engine{
  constructor(output){
    this.output = output
    console.log(`New engine constructed with ${output}`)
  }

  sleep = ms => new Promise(r => setTimeout(r, ms));

  async run(){
    console.log('Game started')
    let i = 0;
    while (i < 100) {
      i = parseInt(this.output.innerHTML);
      this.output.innerHTML = (i + 1).toString()
      await this.sleep(1000)
    }
    this.output.innerHTML = 'Timer reached 100'
  }

  play(player, move) {
    console.log(`Player ${player} played ${move}`)
    this.output.innerHTML = move
  }

  start() {
    this.run()
    document.addEventListener("keydown", (e) => {this.play(0,e.key)});
  }

}