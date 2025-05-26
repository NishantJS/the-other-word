import { PlayerId } from "rune-sdk/multiplayer"
import { BotPlayer } from "./types/GameState"

// Bot names
const BOT_NAMES = [
  "RoboRune",
  "BotBuddy",
  "AIPlayer",
  "CyberFriend",
  "VirtualPal",
  "DigiMate",
  "AutoPlayer",
  "BotBrain",
  "SynthPlayer",
  "RoboGamer"
]

// Bot avatar URLs - using local images
const BOT_AVATARS = [
  "/images/bots/bot1.svg",
  "/images/bots/bot2.svg",
  "/images/bots/bot3.svg",
  "/images/bots/bot4.svg",
  "/images/bots/bot5.svg"
]

// Pre-recorded descriptions for bots based on common words
const BOT_DESCRIPTIONS = {
  // Generic descriptions that could work for most words
  generic: [
    "It's something I use often.",
    "I've seen this before.",
    "It's quite common.",
    "I think most people know what this is.",
    "It's a familiar object to most people."
  ],
  // Descriptions for specific categories
  food: [
    "You can eat this.",
    "It's something edible.",
    "You might find this in a kitchen.",
    "It has a distinct taste.",
    "Some people really enjoy this."
  ],
  animal: [
    "It's a living creature.",
    "You might see this at a zoo.",
    "It has a distinctive appearance.",
    "It makes a specific sound.",
    "It's a type of animal."
  ],
  object: [
    "You can hold this in your hand.",
    "It has a specific function.",
    "It's used for a particular purpose.",
    "You might have one at home.",
    "It's a physical object."
  ],
  nature: [
    "It's found in nature.",
    "It's related to the outdoors.",
    "It's a natural phenomenon.",
    "It's something you'd see outside.",
    "It's part of our environment."
  ]
}

// Function to generate a unique bot ID
export function generateBotId(index: number): PlayerId {
  return `bot-${index}` as PlayerId
}

// Function to create a bot player
export function createBot(index: number): BotPlayer {
  const nameIndex = Math.floor(Math.random() * BOT_NAMES.length)
  const avatarIndex = Math.floor(Math.random() * BOT_AVATARS.length)

  return {
    id: generateBotId(index),
    name: `${BOT_NAMES[nameIndex]}-${index}`,
    avatarUrl: BOT_AVATARS[avatarIndex],
    description: getRandomDescription("generic")
  }
}

// Function to get a random description based on category
export function getRandomDescription(category: keyof typeof BOT_DESCRIPTIONS): string {
  const descriptions = BOT_DESCRIPTIONS[category]
  const index = Math.floor(Math.random() * descriptions.length)
  return descriptions[index]
}

// Function to determine if a player ID belongs to a bot
export function isBot(playerId: PlayerId): boolean {
  return playerId.startsWith('bot-')
}

// Function to get a bot description based on the word
export function getBotDescription(word: string): string {
  // Determine the category of the word
  let category: keyof typeof BOT_DESCRIPTIONS = "generic"

  const foodWords = ["apple", "banana", "carrot", "hamburger", "lemon", "yogurt", "chocolate"]
  const animalWords = ["elephant", "kangaroo", "penguin", "tiger", "zebra", "butterfly", "dolphin"]
  const natureWords = ["flower", "mountain", "rainbow", "sunshine", "volcano", "waterfall"]

  if (foodWords.includes(word)) {
    category = "food"
  } else if (animalWords.includes(word)) {
    category = "animal"
  } else if (natureWords.includes(word)) {
    category = "nature"
  } else {
    category = "object" // Default to object for other words
  }

  return getRandomDescription(category)
}

// Function to get a bot vote
export function getBotVote(botId: PlayerId, playerIds: PlayerId[], impostorId: PlayerId): PlayerId {
  // Bots have a 60% chance to vote for the impostor (they're pretty smart!)
  // and 40% chance to vote randomly for someone else
  const voteForImpostor = Math.random() < 0.6

  if (voteForImpostor) {
    return impostorId
  } else {
    // Filter out the bot itself and get a random player
    const otherPlayers = playerIds.filter(id => id !== botId && id !== impostorId)
    if (otherPlayers.length === 0) {
      // If no other players, vote for impostor anyway
      return impostorId
    }
    const randomIndex = Math.floor(Math.random() * otherPlayers.length)
    return otherPlayers[randomIndex]
  }
}
