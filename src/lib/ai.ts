import { PlayerId } from "rune-sdk/multiplayer"

// Store AI-generated descriptions for bots
const botDescriptions: Record<PlayerId, string> = {}

// Store speech synthesis voices
let voices: SpeechSynthesisVoice[] = []

// Initialize speech synthesis voices
export function initVoices(): void {
  // Get available voices
  voices = window.speechSynthesis.getVoices()

  // If voices array is empty, wait for the voiceschanged event
  if (voices.length === 0) {
    window.speechSynthesis.addEventListener('voiceschanged', () => {
      voices = window.speechSynthesis.getVoices()
    })
  }
}

// Generate a description for a bot using Rune AI
export function generateBotDescription(botId: PlayerId, word: string): void {
  // Create a prompt for the AI
  const prompt = `
    You are a player in a word game called "The Other Word".
    You need to describe the word "${word}" in a way that's clear but not too obvious.
    Keep your description to 1-2 sentences maximum.
    Don't use the word itself or any direct variations of it.
    Respond with just the description, no additional text.
  `

  // Request a description from Rune AI
  try {
    // Store the bot ID in the game state when making the request
    // We'll retrieve it in the promptResponse handler
    const requestId = Rune.ai.promptRequest({
      messages: [{ role: "user", content: prompt }]
    })

    // Store metadata in the game state
    if (typeof requestId === 'string') {
      // We can't directly access the game state, so we'll use an action
      // This will be handled in the logic.ts file
      try {
        Rune.actions.storeAIRequest({
          requestId,
          botId
        })
      } catch (error) {
        console.error("Error storing AI request:", error)
      }
    }
  } catch (error) {
    console.error("Error generating bot description:", error)
  }
}

// Handle AI response
export function handleAIResponse(requestId: string, response: string, metadata: any): void {
  if (metadata && metadata.botId) {
    // Store the generated description
    botDescriptions[metadata.botId] = response
  }
}

// Get a bot's description
export function getBotDescription(botId: PlayerId): string {
  return botDescriptions[botId] || "I'm not sure how to describe this."
}

// Speak a description using speech synthesis
export function speakDescription(description: string, pitch: number = 1, rate: number = 1): void {
  // Check if speech synthesis is supported
  if (!window.speechSynthesis) {
    console.error("Speech synthesis not supported")
    return
  }

  // Create a new utterance
  const utterance = new SpeechSynthesisUtterance(description)

  // Set voice properties
  utterance.pitch = pitch
  utterance.rate = rate

  // Select a random voice that's not the default
  if (voices.length > 1) {
    const randomVoiceIndex = Math.floor(Math.random() * (voices.length - 1)) + 1
    utterance.voice = voices[randomVoiceIndex]
  }

  // Speak the description
  window.speechSynthesis.speak(utterance)
}

// Define SpeechRecognition types
interface SpeechRecognitionEvent {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
}

// Add types to window
declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

// Initialize speech recognition
let recognition: SpeechRecognition | null = null

export function initSpeechRecognition(): boolean {
  // Check if speech recognition is supported
  if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
    console.error("Speech recognition not supported")
    return false
  }

  // Create a new speech recognition instance
  const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition
  if (!SpeechRecognitionClass) {
    return false
  }

  recognition = new SpeechRecognitionClass()

  // Configure recognition
  recognition.continuous = false
  recognition.interimResults = false
  recognition.lang = 'en-US'

  return true
}

// Start speech recognition
export function startSpeechRecognition(onResult: (transcript: string) => void): void {
  if (!recognition) {
    if (!initSpeechRecognition()) {
      return
    }
  }

  // Set up result handler
  recognition!.onresult = (event) => {
    const transcript = event.results[0][0].transcript
    onResult(transcript)
  }

  // Start listening
  recognition!.start()
}

// Stop speech recognition
export function stopSpeechRecognition(): void {
  if (recognition) {
    recognition.stop()
  }
}

// Analyze speech for impostor detection
export function analyzeForImpostor(transcript: string, actualWord: string, impostorWord: string, playerId: PlayerId): void {
  // Create a prompt for the AI
  const prompt = `
    You are analyzing a player's description in a word game called "The Other Word".
    In this game, most players have the word "${actualWord}" but one player (the impostor) has the word "${impostorWord}".

    The player said: "${transcript}"

    Based on this description, rate on a scale of 1-10 how likely it is that this player is the impostor.
    Provide your rating and a brief explanation in this format:
    Rating: [1-10]
    Explanation: [your reasoning]
  `

  try {
    // Request analysis from Rune AI
    const requestId = Rune.ai.promptRequest({
      messages: [{ role: "user", content: prompt }]
    })

    // Store metadata in the game state
    if (typeof requestId === 'string') {
      // We can't directly access the game state, so we'll use an action
      // This will be handled in the logic.ts file
      try {
        Rune.actions.storeAIRequest({
          requestId,
          impostorAnalysis: { playerId }
        })
      } catch (error) {
        console.error("Error storing AI request:", error)
      }
    }
  } catch (error) {
    console.error("Error analyzing speech:", error)
  }
}
