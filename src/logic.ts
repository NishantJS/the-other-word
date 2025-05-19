import { similarWordPairs, GameState } from "./lib/types/GameState"
import { startGameCheck } from "./lib/startGameCheck"
import { PlayerId } from "rune-sdk/multiplayer"

// Game constants
export const numRounds = 3
export const turnCountdown = 3
export const descriptionDuration = 15  // 15 seconds for each player to describe
export const votingDuration = 15       // 15 seconds for voting
export const resultDuration = 15       // 15 seconds to show results
export const nonImpostorCatchPoints = 1 // Points for non-impostors when impostor is caught
export const impostorSurvivePoints = 5  // Points for impostor if they survive to the end
export const correctGuessPoints = 3     // Points for correctly guessing the impostor, even if not caught

// Game timing constants
export const turnAlmostOverAt = 3

// Helper function to get a random word pair using Rune's deterministic random
function getRandomWordPair(): [string, string] {
  // Use Math.random for local testing, but in production this will use Rune's deterministic random
  // Rune automatically replaces Math.random with its own deterministic version
  const randomIndex = Math.floor(Math.random() * similarWordPairs.length)
  return similarWordPairs[randomIndex]
}

// Helper function to shuffle an array
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array]
  // Use a deterministic shuffle algorithm
  // This is the Fisher-Yates shuffle algorithm
  for (let i = newArray.length - 1; i > 0; i--) {
    // Use Math.random for local testing, but in production this will use Rune's deterministic random
    // Rune automatically replaces Math.random with its own deterministic version
    const j = Math.floor(Math.random() * (i + 1))
    const temp = newArray[i]
    newArray[i] = newArray[j]
    newArray[j] = temp
  }
  return newArray
}

// Helper function to start a new round
function startNewRound(game: GameState): void {
  // Reset player states for the new round
  for (const player of game.players) {
    player.describing = false
    player.voted = false
    player.latestScore = 0
  }

  // Get a new word pair for this round
  const [mainWord, impostorWord] = getRandomWordPair()
  game.currentWord = mainWord
  game.impostorWord = impostorWord

  // Reset impostor status
  for (const player of game.players) {
    player.isImpostor = false
  }

  // Randomly select one player to be the impostor
  // Use Math.random for local testing, but in production this will use Rune's deterministic random
  const randomPlayerIndex = Math.floor(Math.random() * game.players.length)
  game.players[randomPlayerIndex].isImpostor = true

  // Assign words to players
  for (const player of game.players) {
    player.secretWord = player.isImpostor ? game.impostorWord : game.currentWord
  }

  // Create a random order for descriptions
  const playerIds = game.players.map((player) => player.id)
  const shuffledPlayerIds = shuffleArray(playerIds)

  // Start with the first player describing
  if (shuffledPlayerIds.length > 0) {
    const firstPlayerId = shuffledPlayerIds[0]
    const firstPlayer = game.players.find((p) => p.id === firstPlayerId)
    if (firstPlayer) {
      firstPlayer.describing = true
    }
  }

  // Initialize the current turn
  game.currentTurn = {
    stage: "countdown",
    timerStartedAt: Rune.gameTime() / 1000,
    currentDescriberId: shuffledPlayerIds[0],
    descriptionOrder: shuffledPlayerIds,
    votingComplete: false,
    impostorCaught: false,
    remainingPlayers: game.players.length,
    previousDescriberId: null,
    nextDescriberId: shuffledPlayerIds.length > 1 ? shuffledPlayerIds[1] : null,
    completedDescribers: []
  }

  // Clear votes from previous rounds
  game.votes = []
}

// Helper function to check if the impostor was caught
function checkImpostorCaught(game: GameState): boolean {
  if (!game.currentTurn) return false

  // Count votes for each player
  const voteCounts: Record<string, number> = {}
  game.players.forEach((player) => {
    voteCounts[player.id] = 0
  })

  // Count votes from the current round
  const currentRoundVotes = game.votes.filter((vote) => vote.round === game.round)
  currentRoundVotes.forEach((vote) => {
    voteCounts[vote.suspectId] = (voteCounts[vote.suspectId] || 0) + 1
  })

  // Find the player with the most votes
  let maxVotes = 0
  let mostVotedPlayerId: PlayerId | null = null

  Object.entries(voteCounts).forEach(([playerId, count]) => {
    if (count > maxVotes) {
      maxVotes = count
      mostVotedPlayerId = playerId as PlayerId
    }
  })

  // Check if the most voted player is the impostor
  if (mostVotedPlayerId) {
    const mostVotedPlayer = game.players.find((p) => p.id === mostVotedPlayerId)
    return mostVotedPlayer?.isImpostor || false
  }

  return false
}

// Helper function to report game over to Rune in a consistent way
function reportGameOver(game: GameState): void {
  if (!game.gameOver) return

  // Mark the game as over in the game state
  game.gameOver = true

  // Calculate final scores
  const playerScores = game.players.reduce(
    (acc, player) => ({
      ...acc,
      [player.id]: player.score.nonImpostor + player.score.impostor,
    }),
    {} as Record<PlayerId, number>
  )

  // Call Rune.gameOver() with delayPopUp: true to prevent immediate popup
  // This will be shown when the user clicks the "Show Final Scores" button in the UI
  // which will call Rune.showGameOverPopUp()
  Rune.gameOver({
    players: playerScores,
    delayPopUp: true,
  })
}

// Helper function to move to the next player for describing
function moveToNextDescriber(game: GameState): void {
  if (!game.currentTurn) return

  // Find the current describer's index
  const currentDescriberId = game.currentTurn.currentDescriberId
  if (!currentDescriberId) return

  const currentIndex = game.currentTurn.descriptionOrder.indexOf(currentDescriberId)

  // Initialize completedDescribers array if it doesn't exist
  if (!game.currentTurn.completedDescribers) {
    game.currentTurn.completedDescribers = []
  }

  // Add current describer to completed list
  game.currentTurn.completedDescribers.push(currentDescriberId)

  // If we've gone through all players, move to voting stage
  if (currentIndex === game.currentTurn.descriptionOrder.length - 1) {
    game.currentTurn.stage = "voting"
    game.currentTurn.timerStartedAt = Rune.gameTime() / 1000
    game.currentTurn.previousDescriberId = currentDescriberId
    game.currentTurn.nextDescriberId = null
    return
  }

  // Otherwise, move to the next player
  const nextIndex = currentIndex + 1
  const nextPlayerId = game.currentTurn.descriptionOrder[nextIndex]

  // Update the current describer
  const currentDescriber = game.players.find((p) => p.id === currentDescriberId)
  if (currentDescriber) {
    currentDescriber.describing = false
  }

  const nextDescriber = game.players.find((p) => p.id === nextPlayerId)
  if (nextDescriber) {
    nextDescriber.describing = true
  }

  // Set previous, current, and next describers
  game.currentTurn.previousDescriberId = currentDescriberId
  game.currentTurn.currentDescriberId = nextPlayerId

  // Calculate the next-next player (who will be next after the current next player)
  const nextNextIndex = nextIndex + 1
  game.currentTurn.nextDescriberId = nextNextIndex < game.currentTurn.descriptionOrder.length
    ? game.currentTurn.descriptionOrder[nextNextIndex]
    : null

  game.currentTurn.timerStartedAt = Rune.gameTime() / 1000
}

// Initialize the game logic
Rune.initLogic({
  minPlayers: 3,  // Changed from 2 to 3 as per requirements
  maxPlayers: 6,  // Maximum allowed by Rune SDK
  setup: (playerIds) => ({
    players: playerIds.map((id) => ({
      id,
      readyToStart: false,
      describing: false,
      isImpostor: false,
      secretWord: "",
      score: {
        nonImpostor: 0,
        impostor: 0,
        // For backward compatibility with Results.tsx
        acting: 0,
        guessing: 0
      },
      latestScore: 0,
      voted: false,
      // For backward compatibility with Results.tsx
      latestRoundScore: {
        acting: 0,
        guessing: 0
      }
    })),
    gameStarted: false,
    round: 0,
    currentWord: "",
    impostorWord: "",
    currentTurn: null,
    votes: [],
    gameOver: false,
    winningTeam: null,
  }),
  actions: {
    setReadyToStart: (_, { game, playerId }) => {
      if (game.gameStarted) throw Rune.invalidAction()

      const player = game.players.find((player) => player.id === playerId)

      if (!player) throw Rune.invalidAction()
      player.readyToStart = true

      startGameCheck(game)

      // If the game has started, initialize the first round
      if (game.gameStarted && game.round === 0) {
        startNewRound(game)
      }
    },
    submitVote: ({ suspectId, round }, { game, playerId }) => {
      // Validate the action
      if (!game.currentTurn) throw Rune.invalidAction()
      if (game.round !== round) throw Rune.invalidAction()
      if (game.currentTurn.stage !== "voting") throw Rune.invalidAction()

      // Find the player
      const player = game.players.find(p => p.id === playerId)
      if (!player) throw Rune.invalidAction()

      // Check if player has already voted
      if (player.voted) throw Rune.invalidAction()

      // Record the vote
      game.votes.push({
        voterId: playerId,
        suspectId,
        round
      })

      // Mark the player as having voted
      player.voted = true

      // Check if all players have voted
      const allVoted = game.players.every(p => p.voted)
      if (allVoted) {
        game.currentTurn.votingComplete = true

        // Check if the impostor was caught
        game.currentTurn.impostorCaught = checkImpostorCaught(game)

        // Move to results stage
        game.currentTurn.stage = "result"
        game.currentTurn.timerStartedAt = Rune.gameTime() / 1000

        // Find the impostor
        const impostor = game.players.find(p => p.isImpostor)
        if (!impostor) return // Safety check

        // Award points to players who correctly guessed the impostor
        // even if the impostor wasn't caught by majority vote
        const currentRoundVotes = game.votes.filter(vote => vote.round === game.round)
        currentRoundVotes.forEach(vote => {
          if (vote.suspectId === impostor.id) {
            // This player correctly identified the impostor
            const voter = game.players.find(p => p.id === vote.voterId)
            if (voter && !voter.isImpostor) {
              voter.score.nonImpostor += correctGuessPoints
              voter.score.guessing += correctGuessPoints // For backward compatibility
              voter.latestScore += correctGuessPoints
              // For backward compatibility with Results.tsx
              if (!voter.latestRoundScore) {
                voter.latestRoundScore = { acting: 0, guessing: 0 }
              }
              voter.latestRoundScore.guessing += correctGuessPoints
            }
          }
        })

        // Award points if impostor was caught
        if (game.currentTurn.impostorCaught) {
          // Non-impostors get points for catching the impostor
          game.players.forEach(player => {
            if (!player.isImpostor) {
              player.score.nonImpostor += nonImpostorCatchPoints
              player.score.guessing += nonImpostorCatchPoints // For backward compatibility
              player.latestScore += nonImpostorCatchPoints
              // For backward compatibility with Results.tsx
              if (!player.latestRoundScore) {
                player.latestRoundScore = { acting: 0, guessing: 0 }
              }
              player.latestRoundScore.guessing += nonImpostorCatchPoints
            }
          })

          // Game ends when impostor is caught
          game.gameOver = true
          game.winningTeam = "nonImpostors"

          // Report game over to Rune
          reportGameOver(game)
        } else {
          // If impostor wasn't caught, check if only 2 players remain
          if (game.players.length <= 2) {
            // Impostor wins if only 2 players remain
            const impostor = game.players.find(p => p.isImpostor)
            if (impostor) {
              impostor.score.impostor += impostorSurvivePoints
              impostor.score.acting += impostorSurvivePoints // For backward compatibility
              impostor.latestScore = impostorSurvivePoints
              // For backward compatibility with Results.tsx
              impostor.latestRoundScore = {
                acting: impostorSurvivePoints,
                guessing: 0
              }

              game.gameOver = true
              game.winningTeam = "impostor"

              // Report game over to Rune
              reportGameOver(game)
            }
          }
        }
      }
    },
    finishDescribing: (_, { game, playerId }) => {
      if (!game.currentTurn) throw Rune.invalidAction()
      if (game.currentTurn.stage !== "describing") throw Rune.invalidAction()
      if (game.currentTurn.currentDescriberId !== playerId) throw Rune.invalidAction()

      // Move to the next player
      moveToNextDescriber(game)
    },
    nextRound: (_, { game }) => {
      if (game.gameOver) throw Rune.invalidAction()
      if (game.currentTurn?.stage !== "result") throw Rune.invalidAction()

      // Increment round counter
      game.round += 1

      // Start a new round
      startNewRound(game)
    },
  },
  events: {
    playerLeft: (playerId, { game }) => {
      // Remove the player
      game.players = game.players.filter((player) => player.id !== playerId)

      // Update the remaining players count
      if (game.currentTurn) {
        game.currentTurn.remainingPlayers = game.players.length
      }

      // Check if the game can continue
      if (game.players.length < 3) {
        // Not enough players to continue
        game.gameOver = true

        // If the impostor left, non-impostors win
        const impostorLeft = !game.players.some(p => p.isImpostor)
        if (impostorLeft) {
          game.winningTeam = "nonImpostors"

          // Award points to non-impostors
          game.players.forEach(player => {
            if (!player.isImpostor) {
              player.score.nonImpostor += nonImpostorCatchPoints
              player.score.guessing += nonImpostorCatchPoints // For backward compatibility
              player.latestScore = nonImpostorCatchPoints
              // For backward compatibility with Results.tsx
              player.latestRoundScore = {
                acting: 0,
                guessing: nonImpostorCatchPoints
              }
            }
          })
        } else {
          // If a non-impostor left and only 2 players remain, impostor wins
          if (game.players.length <= 2) {
            game.winningTeam = "impostor"

            // Award points to the impostor
            const impostor = game.players.find(p => p.isImpostor)
            if (impostor) {
              impostor.score.impostor += impostorSurvivePoints
              impostor.score.acting += impostorSurvivePoints // For backward compatibility
              impostor.latestScore = impostorSurvivePoints
              // For backward compatibility with Results.tsx
              impostor.latestRoundScore = {
                acting: impostorSurvivePoints,
                guessing: 0
              }
            }
          }
        }

        // Report game over to Rune
        if (game.gameOver) {
          reportGameOver(game)
        }
      }

      // If the current describer left, move to the next player
      if (
        game.currentTurn &&
        game.currentTurn.stage === "describing" &&
        game.currentTurn.currentDescriberId === playerId
      ) {
        // Remove the player from the description order
        game.currentTurn.descriptionOrder = game.currentTurn.descriptionOrder.filter(
          id => id !== playerId
        )

        // Move to the next player
        moveToNextDescriber(game)
      }

      // Check if we need to start the game
      startGameCheck(game)
    },
  },
  update: ({ game }) => {
    if (!game.currentTurn) return

    const currentTime = Rune.gameTime() / 1000

    switch (game.currentTurn.stage) {
      case "countdown":
        if (currentTime >= game.currentTurn.timerStartedAt + turnCountdown) {
          game.currentTurn.stage = "describing"
          game.currentTurn.timerStartedAt = currentTime
        }
        break

      case "describing":
        if (currentTime >= game.currentTurn.timerStartedAt + descriptionDuration) {
          // Time's up for the current describer, move to the next
          moveToNextDescriber(game)
        }
        break

      case "voting":
        if (currentTime >= game.currentTurn.timerStartedAt + votingDuration) {
          // Time's up for voting
          game.currentTurn.votingComplete = true

          // Auto-submit votes for players who have selected but not submitted
          // This is handled on the client side, but we add this as a safety measure

          // Check if the impostor was caught
          game.currentTurn.impostorCaught = checkImpostorCaught(game)

          // Move to results stage
          game.currentTurn.stage = "result"
          game.currentTurn.timerStartedAt = currentTime

          // Find the impostor
          const impostor = game.players.find(p => p.isImpostor)
          if (!impostor) break // Safety check

          // Award points to players who correctly guessed the impostor
          // even if the impostor wasn't caught by majority vote
          const currentRoundVotes = game.votes.filter(vote => vote.round === game.round)
          currentRoundVotes.forEach(vote => {
            if (vote.suspectId === impostor.id) {
              // This player correctly identified the impostor
              const voter = game.players.find(p => p.id === vote.voterId)
              if (voter && !voter.isImpostor) {
                voter.score.nonImpostor += correctGuessPoints
                voter.score.guessing += correctGuessPoints // For backward compatibility
                voter.latestScore += correctGuessPoints
                // For backward compatibility with Results.tsx
                if (!voter.latestRoundScore) {
                  voter.latestRoundScore = { acting: 0, guessing: 0 }
                }
                voter.latestRoundScore.guessing += correctGuessPoints
              }
            }
          })

          // Award points if impostor was caught
          if (game.currentTurn.impostorCaught) {
            // Non-impostors get points for catching the impostor
            game.players.forEach(player => {
              if (!player.isImpostor) {
                player.score.nonImpostor += nonImpostorCatchPoints
                player.score.guessing += nonImpostorCatchPoints // For backward compatibility
                player.latestScore += nonImpostorCatchPoints
                // For backward compatibility with Results.tsx
                if (!player.latestRoundScore) {
                  player.latestRoundScore = { acting: 0, guessing: 0 }
                }
                player.latestRoundScore.guessing += nonImpostorCatchPoints
              }
            })

            // Game ends when impostor is caught
            game.gameOver = true
            game.winningTeam = "nonImpostors"

            // Report game over to Rune
            reportGameOver(game)
          } else {
            // If impostor wasn't caught, check if only 2 players remain
            if (game.players.length <= 2) {
              // Impostor wins if only 2 players remain
              const impostor = game.players.find(p => p.isImpostor)
              if (impostor) {
                impostor.score.impostor += impostorSurvivePoints
                impostor.score.acting += impostorSurvivePoints // For backward compatibility
                impostor.latestScore = impostorSurvivePoints
                // For backward compatibility with Results.tsx
                impostor.latestRoundScore = {
                  acting: impostorSurvivePoints,
                  guessing: 0
                }

                game.gameOver = true
                game.winningTeam = "impostor"

                // Report game over to Rune
                reportGameOver(game)
              }
            }
          }
        }
        break

      case "result":
        // We'll let the client handle advancing to the next round via the nextRound action
        // This prevents state desync issues with random number generation
        break
    }
  },
})
