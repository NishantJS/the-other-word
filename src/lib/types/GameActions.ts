import { GameState } from "./GameState"
import { PlayerId } from "rune-sdk/multiplayer"

export type GameActions = {
  setReadyToStart: () => void
  toggleBots: () => void  // Toggle bot usage
  toggleAI: () => void    // Toggle AI features
  toggleSpeech: () => void // Toggle speech synthesis and recognition
  storeAIRequest: (request: {
    requestId: string
    botId?: PlayerId
    impostorAnalysis?: {
      playerId: PlayerId
    }
  }) => void
  submitVote: (vote: {
    suspectId: PlayerId
    round: GameState["round"]
  }) => void
  nextRound: () => void
  finishDescribing: () => void
  sendReaction: (reaction: {
    emoji: string
  }) => void
}
