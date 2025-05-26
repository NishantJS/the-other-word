import { GameState } from "./GameState"
import { PlayerId } from "rune-sdk/multiplayer"

export type GameActions = {
  setReadyToStart: () => void
  submitVote: (vote: {
    suspectId: PlayerId
    round: GameState["round"]
  }) => void
  nextRound: () => void
  finishDescribing: () => void
  sendReaction: (reaction: {
    emoji: string
  }) => void
  clearPlayerLeavingNotification: () => void
}
