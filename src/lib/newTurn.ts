import { GameState } from "./types/GameState"

export function newTurn(game: GameState) {
  // Create a random order for descriptions
  const playerIds = game.players.map(player => player.id)
  const shuffledPlayerIds = [...playerIds].sort(() => Math.random() - 0.5)

  game.currentTurn = {
    stage: "countdown",
    timerStartedAt: Rune.gameTime() / 1000,
    currentDescriberId: shuffledPlayerIds[0],
    descriptionOrder: shuffledPlayerIds,
    votingComplete: false,
    impostorCaught: false,
    remainingPlayers: game.players.length,
  }
}
