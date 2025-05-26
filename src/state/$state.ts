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
    reactions: [],
    gameOver: false,
    winningTeam: null,
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

// Alias for $describingPlayer for code clarity
export const $actorPlayer = atom((get) => get($describingPlayer))

// Removed backward compatibility atoms

export const $round = atom((get) => get($game).round)

export const $currentTurn = atom((get) => get($game).currentTurn)

export const $votes = atom((get) => get($game).votes)

export const $reactions = atom((get) => get($game).reactions)

export const $gameOver = atom((get) => get($game).gameOver)

export const $winningTeam = atom((get) => get($game).winningTeam)
