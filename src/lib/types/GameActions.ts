import { Animal, Emotion, GameState } from "./GameState"
import { PlayerId } from "rune-sdk/multiplayer"

export type GameActions = {
  setReadyToStart: () => void
  submitVote: (vote: {
    suspectId: PlayerId
    round: GameState["round"]
  }) => void
  nextRound: () => void
  finishDescribing: () => void

  // For backward compatibility
  makeGuess?: (guess: {
    animal: Animal
    emotion: Emotion
    round: GameState["round"]
  }) => void
  skipGuess?: () => void
}
