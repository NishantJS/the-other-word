import { GameState } from "./types/GameState"
import { getRandomItem } from "./getRandomItem"
import { animals, emotions } from "./types/GameState"

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
    // For backward compatibility
    animal: getRandomItem(animals),
    emotion: getRandomItem(emotions),
    latestActingStartedAt: Rune.gameTime() / 1000,
    showSkipGuessButton: false,
  }
}
