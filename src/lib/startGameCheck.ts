import { GameState } from "./types/GameState"
import { createBot } from "./bots"


export function startGameCheck(game: GameState) {
  if (game.gameStarted) return
  if (game.players.some((player) => !player.readyToStart)) return

  // Check if we need to add bots
  const realPlayerCount = game.players.filter(p => !p.isBot).length

  if (realPlayerCount < 3 && game.useBots) {
    // Add bots to reach minimum player count
    const botsNeeded = 3 - realPlayerCount

    // Create bot players
    game.bots = []
    for (let i = 0; i < botsNeeded; i++) {
      game.bots.push(createBot(i))
    }

    // Add bots to the game
    for (const bot of game.bots) {
      game.players.push({
        id: bot.id,
        readyToStart: true,
        describing: false,
        isImpostor: false,
        secretWord: "",
        score: {
          nonImpostor: 0,
          impostor: 0,
          acting: 0,
          guessing: 0
        },
        latestScore: 0,
        voted: false,
        isBot: true,
        latestRoundScore: {
          acting: 0,
          guessing: 0
        }
      })
    }
  } else if (realPlayerCount < 3 && !game.useBots) {
    // Not enough players and bots are not enabled
    return
  }

  game.gameStarted = true
  game.round = 0
}
