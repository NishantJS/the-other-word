import { GameState, GameActions } from "../lib/types/GameState"
import { PlayerId } from "rune-sdk/multiplayer"

declare global {
  interface RuneClient<G, A, M> {
    players: {
      [playerId: string]: {
        displayName: string
        avatarUrl: string
      }
    }
    game: G
  }
}

export {}
