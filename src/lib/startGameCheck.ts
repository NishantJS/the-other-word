import { GameState } from "./types/GameState"

export function startGameCheck(game: GameState) {
  if (game.gameStarted) return
  if (game.players.some((player) => !player.readyToStart)) return

  // Check if we have enough players
  if (game.players.length < 3) {
    // Not enough players to start the game
    return
  }

  game.gameStarted = true
  game.round = 0
}
