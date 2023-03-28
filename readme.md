# Handsflow JavaScript Implementation

Videogame implemented with vanilla JS that exhausts JS's concurrent programming
capabilities.

## TODO's

1. (FIXED) Handle unexpected play by incorrect turn concurrency bug. Should interrupt this promise:
play = await this.listen_play(this.gamestate.players[this.gamestate.index], this.waittime)
So we dont wait for this before firing request for a new play. Causes delay).

      * Fix: Add condition in listen_play's loop. If game is requesting play from another player,
break the loop and resolve promise inmediately.

1. (FIXED) If after interruption by wrong key, player kicks offs the game inmediately. Record cant be cleared up 
on time and game stops again!
      * Fix: Added loading state and buffer time between rounds.