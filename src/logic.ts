import { similarWordPairs, GameState } from "./lib/types/GameState"
import { startGameCheck } from "./lib/startGameCheck"
import { PlayerId } from "rune-sdk/multiplayer"
import { getBotVote } from "./lib/bots"

// Game constants
export const numRounds = 3
export const turnCountdown = 3
export const descriptionDuration = 15  // 15 seconds for each player to describe
export const votingDuration = 15       // 15 seconds for voting
export const resultDuration = 15       // 15 seconds to show results
export const nonImpostorCatchPoints = 1 // Points for non-impostors when impostor is caught
export const impostorSurvivePoints = 5  // Points for impostor if they survive to the end
export const correctGuessPoints = 3     // Points for correctly guessing the impostor, even if not caught
export const reactionThrottleTime = 2   // Time in seconds between allowed reactions (to prevent spam)

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
  // Reset player states for the new round but preserve scores
  for (const player of game.players) {
    player.describing = false
    player.voted = false
    player.latestScore = 0
    // Make sure we don't reset the accumulated scores
    // Only reset latestScore which is for the current round
  }

  // Get a new word pair for this round
  const [mainWord, impostorWord] = getRandomWordPair()
  game.currentWord = mainWord
  game.impostorWord = impostorWord

  // Reset impostor status
  for (const player of game.players) {
    player.isImpostor = false
  }

  // Select a random player to be the impostor
  // Prefer human players for the impostor role (70% chance)
  const humanPlayers = game.players.filter(p => !p.isBot)

  let impostorPlayer: typeof game.players[0] | undefined

  // If we have human players and random value is < 0.7, choose a human impostor
  if (humanPlayers.length > 0 && Math.random() < 0.7) {
    const randomHumanIndex = Math.floor(Math.random() * humanPlayers.length)
    impostorPlayer = humanPlayers[randomHumanIndex]
  } else {
    // Otherwise choose any player (human or bot)
    const impostorIndex = Math.floor(Math.random() * game.players.length)
    impostorPlayer = game.players[impostorIndex]
  }

  if (impostorPlayer) {
    impostorPlayer.isImpostor = true
  }

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

  // Clear votes and reactions from previous rounds
  game.votes = []
  game.reactions = []
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

  // Only consider impostor caught if:
  // 1. Someone actually got votes (maxVotes > 0)
  // 2. The most voted player is the impostor
  // 3. They got at least half the total votes (majority rule)
  if (mostVotedPlayerId && maxVotes > 0) {
    const totalVotes = currentRoundVotes.length
    const majorityThreshold = Math.ceil(totalVotes / 2)

    if (maxVotes >= majorityThreshold) {
      const mostVotedPlayer = game.players.find((p) => p.id === mostVotedPlayerId)
      return mostVotedPlayer?.isImpostor || false
    }
  }

  return false
}

// Helper function to load scores from persisted data
function loadPersistedScores(game: any, playerId: string): void {
  // Ensure game.persisted exists (it's created by Rune SDK when persistPlayerData is true)
  if (!game.persisted) {
    return; // No persisted data available
  }

  // Find the player
  const player = game.players.find((p: any) => p.id === playerId);
  if (!player) return;

  // If we have persisted data for this player, load it
  if (game.persisted[playerId] && game.persisted[playerId].scores) {
    player.score.nonImpostor = game.persisted[playerId].scores.nonImpostor || 0;
    player.score.impostor = game.persisted[playerId].scores.impostor || 0;
    player.score.acting = game.persisted[playerId].scores.acting || 0;
    player.score.guessing = game.persisted[playerId].scores.guessing || 0;
  }
}

// Helper function to update persisted scores
function updatePersistedScores(game: any): void {
  // Ensure game.persisted exists (it's created by Rune SDK when persistPlayerData is true)
  if (!game.persisted) {
    game.persisted = {};
  }

  // Update persisted scores for each player
  for (const player of game.players) {
    if (!game.persisted[player.id]) {
      game.persisted[player.id] = {
        scores: {
          nonImpostor: 0,
          impostor: 0,
          acting: 0,
          guessing: 0
        }
      };
    }

    // Update the persisted scores with current scores
    game.persisted[player.id].scores = {
      nonImpostor: player.score.nonImpostor,
      impostor: player.score.impostor,
      acting: player.score.acting,
      guessing: player.score.guessing
    };
  }
}

// Helper function to complete voting and transition to result stage
// This centralizes the voting completion logic to prevent state desync
function completeVoting(game: GameState): void {
  // Safety check
  if (!game.currentTurn) return;

  // Prevent duplicate calls
  if (game.currentTurn.votingComplete) return;

  game.currentTurn.votingComplete = true;

  // Check if the impostor was caught
  game.currentTurn.impostorCaught = checkImpostorCaught(game);

  // Move to results stage
  game.currentTurn.stage = "result";
  game.currentTurn.timerStartedAt = Rune.gameTime() / 1000;

  // Find the impostor
  const impostor = game.players.find(p => p.isImpostor);
  if (!impostor) return; // Safety check

  // Award points to players who correctly guessed the impostor
  const currentRoundVotes = game.votes.filter(vote => vote.round === game.round);
  currentRoundVotes.forEach(vote => {
    if (vote.suspectId === impostor.id) {
      // This player correctly identified the impostor
      const voter = game.players.find(p => p.id === vote.voterId);
      if (voter && !voter.isImpostor) {
        voter.score.nonImpostor += correctGuessPoints;
        voter.score.guessing += correctGuessPoints; // For backward compatibility
        voter.latestScore += correctGuessPoints;
        // For backward compatibility with Results.tsx
        if (!voter.latestRoundScore) {
          voter.latestRoundScore = { acting: 0, guessing: 0 };
        }
        voter.latestRoundScore.guessing += correctGuessPoints;
      }
    }
  });

  // Award points if impostor was caught
  if (game.currentTurn.impostorCaught) {
    // Non-impostors get points for catching the impostor
    game.players.forEach(player => {
      if (!player.isImpostor) {
        player.score.nonImpostor += nonImpostorCatchPoints;
        player.score.guessing += nonImpostorCatchPoints; // For backward compatibility
        player.latestScore += nonImpostorCatchPoints;
        // For backward compatibility with Results.tsx
        if (!player.latestRoundScore) {
          player.latestRoundScore = { acting: 0, guessing: 0 };
        }
        player.latestRoundScore.guessing += nonImpostorCatchPoints;
      }
    });

    // Update persisted scores
    updatePersistedScores(game);

    // Game ends when impostor is caught
    game.gameOver = true;
    game.winningTeam = "nonImpostors";

    // Report game over to Rune
    reportGameOver(game);
  } else {
    // If impostor wasn't caught, check if only 2 players remain
    if (game.players.length <= 2) {
      // Impostor wins if only 2 players remain
      const impostor = game.players.find(p => p.isImpostor);
      if (impostor) {
        impostor.score.impostor += impostorSurvivePoints;
        impostor.score.acting += impostorSurvivePoints; // For backward compatibility
        impostor.latestScore = impostorSurvivePoints;
        // For backward compatibility with Results.tsx
        impostor.latestRoundScore = {
          acting: impostorSurvivePoints,
          guessing: 0
        };

        // Update persisted scores
        updatePersistedScores(game);

        game.gameOver = true;
        game.winningTeam = "impostor";

        // Report game over to Rune
        reportGameOver(game);
      }
    }
  }
}

// Helper function to report game over to Rune in a consistent way
function reportGameOver(game: GameState): void {
  if (!game.gameOver) return

  // Mark the game as over in the game state
  game.gameOver = true

  // Update persisted scores before game over
  updatePersistedScores(game);

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
  if (currentIndex === -1) return // Safety check

  // Initialize completedDescribers array if it doesn't exist
  if (!game.currentTurn.completedDescribers) {
    game.currentTurn.completedDescribers = []
  }

  // Add current describer to completed list (avoid duplicates)
  if (!game.currentTurn.completedDescribers.includes(currentDescriberId)) {
    game.currentTurn.completedDescribers.push(currentDescriberId)
  }

  // Update the current describer's state
  const currentDescriber = game.players.find((p) => p.id === currentDescriberId)
  if (currentDescriber) {
    currentDescriber.describing = false
  }

  // Check if we've completed all players in the description order
  if (game.currentTurn.completedDescribers.length >= game.currentTurn.descriptionOrder.length) {
    // All players have described, move to voting stage
    game.currentTurn.stage = "voting"
    game.currentTurn.timerStartedAt = Rune.gameTime() / 1000
    game.currentTurn.previousDescriberId = currentDescriberId
    game.currentTurn.currentDescriberId = null
    game.currentTurn.nextDescriberId = null

    // Clear reactions when moving to voting stage
    game.reactions = []

    // Handle bot voting
    handleBotVoting(game)

    return
  }

  // Find the next player who hasn't described yet
  let nextPlayerId: PlayerId | null = null
  for (let i = currentIndex + 1; i < game.currentTurn.descriptionOrder.length; i++) {
    const candidateId = game.currentTurn.descriptionOrder[i]
    if (!game.currentTurn.completedDescribers.includes(candidateId)) {
      nextPlayerId = candidateId
      break
    }
  }

  // If no next player found in remaining order, find first incomplete player from start
  if (!nextPlayerId) {
    for (const candidateId of game.currentTurn.descriptionOrder) {
      if (!game.currentTurn.completedDescribers.includes(candidateId)) {
        nextPlayerId = candidateId
        break
      }
    }
  }

  // If still no next player, move to voting (all done)
  if (!nextPlayerId) {
    game.currentTurn.stage = "voting"
    game.currentTurn.timerStartedAt = Rune.gameTime() / 1000
    game.currentTurn.previousDescriberId = currentDescriberId
    game.currentTurn.currentDescriberId = null
    game.currentTurn.nextDescriberId = null

    // Clear reactions when moving to voting stage
    game.reactions = []

    // Handle bot voting
    handleBotVoting(game)

    return
  }

  // Set the next player as current describer
  const nextDescriber = game.players.find((p) => p.id === nextPlayerId)
  if (nextDescriber) {
    nextDescriber.describing = true
  }

  // Set previous, current, and next describers
  game.currentTurn.previousDescriberId = currentDescriberId
  game.currentTurn.currentDescriberId = nextPlayerId

  // Calculate the next-next player (who will be next after the current next player)
  const nextIndex = game.currentTurn.descriptionOrder.indexOf(nextPlayerId)
  let nextNextPlayerId: PlayerId | null = null
  for (let i = nextIndex + 1; i < game.currentTurn.descriptionOrder.length; i++) {
    const candidateId = game.currentTurn.descriptionOrder[i]
    if (!game.currentTurn.completedDescribers.includes(candidateId)) {
      nextNextPlayerId = candidateId
      break
    }
  }
  game.currentTurn.nextDescriberId = nextNextPlayerId

  // Clear reactions when moving to the next player
  game.reactions = []

  game.currentTurn.timerStartedAt = Rune.gameTime() / 1000
}

// Helper function to handle bot voting
function handleBotVoting(game: GameState): void {
  if (!game.currentTurn) return

  // Find the impostor
  const impostor = game.players.find(p => p.isImpostor)
  if (!impostor) return

  // Get all bot players
  const botPlayers = game.players.filter(p => p.isBot)

  // Get all player IDs
  const playerIds = game.players.map(p => p.id)

  // Make bots vote
  for (const bot of botPlayers) {
    // Skip if bot has already voted (shouldn't happen, but just in case)
    if (bot.voted) continue

    // Get bot's vote
    const suspectId = getBotVote(bot.id, playerIds, impostor.id)

    // Record the vote
    game.votes.push({
      voterId: bot.id,
      suspectId,
      round: game.round
    })

    // Mark the bot as having voted
    bot.voted = true
  }
}





// Initialize the game logic
Rune.initLogic({
  minPlayers: 1,  // Changed to 1 to allow single player with bots
  maxPlayers: 6,  // Maximum allowed by Rune SDK
  // @ts-ignore - persistPlayerData is supported by Rune SDK
  persistPlayerData: true, // Enable persisted player data
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
      isBot: false, // Real players are not bots
      // For backward compatibility with Results.tsx
      latestRoundScore: {
        acting: 0,
        guessing: 0
      }
    })),
    useBots: playerIds.length < 3, // Automatically use bots if fewer than 3 players
    botCount: playerIds.length < 3 ? 3 - playerIds.length : 0, // Add enough bots to reach 3 players
    bots: [], // Will be populated when game starts
    gameStarted: false,
    round: 0,
    currentWord: "",
    impostorWord: "",
    currentTurn: null,
    votes: [],
    reactions: [],
    gameOver: false,
    winningTeam: null,
  }),
  actions: {
    toggleBots: (_, { game }) => {
      if (game.gameStarted) throw Rune.invalidAction()

      // Toggle bot usage
      game.useBots = !game.useBots

      // Update bot count based on current player count
      const realPlayerCount = game.players.filter(p => !p.isBot).length
      game.botCount = (realPlayerCount < 3 && game.useBots) ? 3 - realPlayerCount : 0
    },



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
      player.voted = true      // Check if all players have voted
      const allVoted = game.players.every(p => p.voted)
      if (allVoted) {
        completeVoting(game)
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

      // Update persisted scores before starting a new round
      updatePersistedScores(game)

      // Increment round counter
      game.round += 1

      // Start a new round
      startNewRound(game)
    },
    sendReaction: ({ emoji }: { emoji: string }, { game, playerId }: { game: GameState, playerId: PlayerId }) => {
      // Validate the action
      if (!game.currentTurn) throw Rune.invalidAction()
      if (game.currentTurn.stage !== "describing") throw Rune.invalidAction()

      // Don't allow the current speaker to send reactions
      if (game.currentTurn.currentDescriberId === playerId) throw Rune.invalidAction()

      // Get the current time
      const currentTime = Rune.gameTime() / 1000

      // Check if the player has sent a reaction recently (throttling)
      const playerReactions = game.reactions.filter((r) => r.playerId === playerId)
      const lastReaction = playerReactions.length > 0
        ? playerReactions[playerReactions.length - 1]
        : null

      if (lastReaction && currentTime - lastReaction.timestamp < reactionThrottleTime) {
        // Too soon, ignore this reaction (throttling)
        throw Rune.invalidAction()
      }

      // Add the reaction to the game state
      game.reactions.push({
        playerId,
        emoji,
        timestamp: currentTime
      })

      // Limit the number of stored reactions to prevent memory issues
      // Keep only the 20 most recent reactions
      if (game.reactions.length > 20) {
        game.reactions = game.reactions.slice(-20)
      }
    },
  },
  events: {
    playerJoined: (playerId, { game }) => {
      // Load persisted scores for the player who joined
      loadPersistedScores(game, playerId);
    },
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

        // Update persisted scores
        updatePersistedScores(game)

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

          // If the first player is a bot, add a reaction for them
          const firstPlayerId = game.currentTurn.currentDescriberId
          if (firstPlayerId) {
            const firstPlayer = game.players.find(p => p.id === firstPlayerId)
            if (firstPlayer && firstPlayer.isBot) {
              // Add a bot description reaction
              game.reactions.push({
                playerId: firstPlayerId,
                emoji: "💬",
                timestamp: Rune.gameTime() / 1000
              })
            }
          }
        }
        break;
      case "describing":
        // Check if current describer is a bot
        const currentDescriberId = game.currentTurn.currentDescriberId
        if (currentDescriberId) {
          const currentDescriber = game.players.find(p => p.id === currentDescriberId)

          // If it's a bot's turn, move to the next player after a shorter time (8 seconds)
          if (currentDescriber && currentDescriber.isBot) {
            // Move to the next player after 8 seconds
            if (currentTime >= game.currentTurn.timerStartedAt + 8) {
              moveToNextDescriber(game)
            }
          } else {
            // For human players, only auto-advance if they haven't manually finished
            // This prevents skipping human players who are still describing
            if (currentTime >= game.currentTurn.timerStartedAt + descriptionDuration) {
              // Only auto-advance if the player is still the current describer
              // This prevents race conditions where the player finished but the timer still fires
              if (game.currentTurn.currentDescriberId === currentDescriberId) {
                moveToNextDescriber(game)
              }
            }
          }
        }
        break

      case "voting":        if (currentTime >= game.currentTurn.timerStartedAt + votingDuration) {
          // Auto-submit votes for players who haven't voted yet
          const nonVotingPlayers = game.players.filter(p => !p.voted)

          // Find the impostor for bot voting
          const impostorPlayer = game.players.find(p => p.isImpostor)
          if (impostorPlayer) {
            const playerIds = game.players.map(p => p.id)

            // Make each non-voting player vote
            for (const player of nonVotingPlayers) {
              let suspectId: PlayerId

              if (player.isBot) {
                // Bots use their voting logic
                suspectId = getBotVote(player.id, playerIds, impostorPlayer.id)
              } else {
                // Human players who didn't vote get a random vote
                const otherPlayers = game.players.filter(p => p.id !== player.id)
                const randomIndex = Math.floor(Math.random() * otherPlayers.length)
                suspectId = otherPlayers[randomIndex].id
              }

              // Record the vote
              game.votes.push({
                voterId: player.id,
                suspectId,
                round: game.round
              })

              // Mark the player as having voted
              player.voted = true
            }
          }

          // Complete voting using centralized logic
          completeVoting(game)
        }
        break

      case "result":
        // We'll let the client handle advancing to the next round via the nextRound action
        // This prevents state desync issues with random number generation
        break
    }
  },
})
