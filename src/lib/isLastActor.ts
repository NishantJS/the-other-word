import { GameState } from "./types/GameState"

export function isLastActor(game: GameState) {
  // Find the current describing player
  const actorIndex = game.players.findIndex((player) => player.describing)
  return actorIndex + 1 === game.players.length
}
