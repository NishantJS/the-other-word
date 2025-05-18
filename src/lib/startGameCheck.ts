import { GameState } from "./types/GameState"

export function startGameCheck(game: GameState) {
  if (game.gameStarted) return
  if (game.players.some((player) => !player.readyToStart)) return
  if (game.players.length < 3) return // Ensure we have at least 3 players

  game.gameStarted = true
  game.round = 0
}
