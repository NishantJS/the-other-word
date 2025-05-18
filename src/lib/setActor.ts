import { GameState } from "./types/GameState"

export function setActor(game: GameState, which: "first" | "next") {
  // Find the current actor (or describing player)
  const actorIndex = game.players.findIndex((player) => player.actor || player.describing)
  const nextActorIndex = which === "first" ? 0 : actorIndex + 1

  // Reset the current actor/describing player
  if (~actorIndex) {
    if (game.players[actorIndex].actor !== undefined) {
      game.players[actorIndex].actor = false
    }
    game.players[actorIndex].describing = false
  }

  // Set the new actor/describing player
  if (game.players[nextActorIndex]) {
    if (game.players[nextActorIndex].actor !== undefined) {
      game.players[nextActorIndex].actor = true
    }
    game.players[nextActorIndex].describing = true
  }
}
