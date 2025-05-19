import { GameState } from "./types/GameState"

export function setActor(game: GameState, which: "first" | "next") {
  // Find the current describing player
  const actorIndex = game.players.findIndex((player) => player.describing)
  const nextActorIndex = which === "first" ? 0 : actorIndex + 1

  // Reset the current describing player
  if (actorIndex >= 0) {
    game.players[actorIndex].describing = false
  }

  // Set the new describing player
  if (game.players[nextActorIndex]) {
    game.players[nextActorIndex].describing = true
  }
}
