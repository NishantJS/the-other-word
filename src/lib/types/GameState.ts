import { PlayerId } from "rune-sdk/multiplayer"

// List of words that can be assigned to players
export const wordsList = [
  "apple", "banana", "carrot", "diamond", "elephant",
  "flower", "guitar", "hamburger", "igloo", "jacket",
  "kangaroo", "lemon", "mountain", "notebook", "octopus",
  "penguin", "queen", "rainbow", "sunshine", "tiger",
  "umbrella", "volcano", "waterfall", "xylophone", "yogurt",
  "zebra", "airplane", "butterfly", "chocolate", "dolphin"
] as const

// Similar words that will be assigned to the impostor
export const similarWordPairs: [string, string][] = [
  ["apple", "pear"],
  ["banana", "plantain"],
  ["carrot", "parsnip"],
  ["diamond", "crystal"],
  ["elephant", "mammoth"],
  ["flower", "blossom"],
  ["guitar", "ukulele"],
  ["hamburger", "sandwich"],
  ["igloo", "cabin"],
  ["jacket", "sweater"],
  ["kangaroo", "wallaby"],
  ["lemon", "lime"],
  ["mountain", "hill"],
  ["notebook", "journal"],
  ["octopus", "squid"],
  ["penguin", "seagull"],
  ["queen", "princess"],
  ["rainbow", "spectrum"],
  ["sunshine", "daylight"],
  ["tiger", "lion"],
  ["umbrella", "parasol"],
  ["volcano", "mountain"],
  ["waterfall", "cascade"],
  ["xylophone", "marimba"],
  ["yogurt", "pudding"],
  ["zebra", "horse"],
  ["airplane", "helicopter"],
  ["butterfly", "moth"],
  ["chocolate", "candy"],
  ["dolphin", "porpoise"]
]

// For backward compatibility with existing components
export const animals = wordsList
export const emotions = ["happy", "sad", "angry", "surprised", "confused", "excited", "scared", "bored"] as const
export type Animal = typeof animals[number]
export type Emotion = typeof emotions[number]
export type Guess = {
  playerId: PlayerId
  animal: Animal
  emotion: Emotion
  correct: boolean
}

export type Word = typeof wordsList[number]

export type Vote = {
  voterId: PlayerId
  suspectId: PlayerId
  round: number
}

type Score = {
  nonImpostor: number  // Points earned as a non-impostor
  impostor: number     // Points earned as an impostor
  // For backward compatibility
  acting?: number
  guessing?: number
}

export interface GameState {
  players: {
    id: PlayerId
    readyToStart: boolean
    describing: boolean  // True when it's this player's turn to describe
    isImpostor: boolean  // True if this player is the impostor
    secretWord: string   // The word assigned to this player
    score: Score
    latestScore: number  // Score earned in the latest round
    voted: boolean       // Whether this player has voted in the current round
    // For backward compatibility
    actor?: boolean
    latestTurnScore?: {
      acting: number
      guessing: number
    }
    latestRoundScore?: {
      acting: number
      guessing: number
    }
  }[]
  gameStarted: boolean
  round: number
  currentWord: string    // The main word for the current round
  impostorWord: string   // The similar but different word for the impostor
  currentTurn: {
    stage: "countdown" | "describing" | "voting" | "result"
    timerStartedAt: number
    currentDescriberId: PlayerId | null  // ID of player currently describing
    descriptionOrder: PlayerId[]         // Order of players for description phase
    votingComplete: boolean              // True when all players have voted
    impostorCaught: boolean              // True if impostor was voted out
    remainingPlayers: number             // Number of players still in the game
    // For backward compatibility
    animal?: Animal
    emotion?: Emotion
    showSkipGuessButton?: boolean
    latestActingStartedAt?: number
  } | null
  votes: Vote[]
  gameOver: boolean
  winningTeam: "nonImpostors" | "impostor" | null  // Who won the game
  // For backward compatibility
  animals?: Animal[]
  emotions?: Emotion[]
  guesses?: Guess[]
}
