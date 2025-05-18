import { GameState } from "../lib/types/GameState"
import { atom } from "jotai"
import { Players, PlayerId } from "rune-sdk/multiplayer"

export const $state = atom<{
  ready: boolean
  game: GameState
  players: Players
  yourPlayerId: PlayerId | undefined
}>({
  ready: false,
  game: {
    players: [],
    gameStarted: false,
    round: 0,
    currentWord: "",
    impostorWord: "",
    currentTurn: null,
    votes: [],
    gameOver: false,
    winningTeam: null,
    // For backward compatibility
    animals: [],
    emotions: [],
    guesses: [],
  },
  players: {},
  yourPlayerId: undefined,
})

export const $ready = atom((get) => get($state).ready)

export const $game = atom((get) => get($state).game)

export const $playersInfo = atom((get) => get($state).players)

export const $yourPlayerId = atom((get) => get($state).yourPlayerId)

export const $gameStarted = atom((get) => get($game).gameStarted)

export const $players = atom((get) => {
  const players = get($game).players
  const playersInfo = get($playersInfo)

  return players.map((player) => {
    const info = playersInfo[player.id]

    return {
      ...player,
      info,
    }
  })
})

export const $yourPlayer = atom((get) => {
  const yourPlayerId = get($yourPlayerId)
  const players = get($players)

  return players.find((player) => player.id === yourPlayerId)
})

export const $describingPlayer = atom((get) =>
  get($players).find((player) => player.describing)
)

export const $impostorPlayer = atom((get) =>
  get($players).find((player) => player.isImpostor)
)

// For backward compatibility
export const $actorPlayer = atom((get) =>
  get($players).find((player) => player.actor || player.describing)
)

export const $animals = atom((get) => get($game).animals || [])

export const $emotions = atom((get) => get($game).emotions || [])

export const $guesses = atom((get) => get($game).guesses || [])

export const $latestGuess = atom((get) => get($guesses).at(-1))

export const $round = atom((get) => get($game).round)

export const $currentTurn = atom((get) => get($game).currentTurn)

export const $votes = atom((get) => get($game).votes)

export const $gameOver = atom((get) => get($game).gameOver)

export const $winningTeam = atom((get) => get($game).winningTeam)
