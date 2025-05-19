import React, { useEffect, useState } from 'react'
import { useAtomValue } from 'jotai'
import { $game, $currentTurn, $playersInfo } from '../../../state/$state'
import { initVoices, speakDescription } from '../../../lib/ai'

export const BotSpeech: React.FC = () => {
  const game = useAtomValue($game)
  const currentTurn = useAtomValue($currentTurn)
  const playersInfo = useAtomValue($playersInfo)
  
  const [lastSpeakerId, setLastSpeakerId] = useState<string | null>(null)
  
  // Initialize speech synthesis voices
  useEffect(() => {
    if (game.useSpeech) {
      initVoices()
    }
  }, [game.useSpeech])
  
  // Handle bot speech when it's their turn
  useEffect(() => {
    if (!game.useSpeech || !currentTurn || currentTurn.stage !== 'describing') {
      return
    }
    
    const currentDescriberId = currentTurn.currentDescriberId
    if (!currentDescriberId) return
    
    // Check if the current describer is a bot
    const currentPlayer = game.players.find(p => p.id === currentDescriberId)
    if (!currentPlayer || !currentPlayer.isBot) return
    
    // Prevent speaking multiple times for the same bot
    if (lastSpeakerId === currentDescriberId) return
    
    // Find the bot info
    const botInfo = game.bots.find(b => b.id === currentDescriberId)
    if (!botInfo) return
    
    // Get the bot's display name
    const botDisplayName = playersInfo[currentDescriberId]?.displayName || botInfo.name
    
    // Determine which description to use
    let description = ''
    
    if (botInfo.aiDescription && game.useAI) {
      // Use AI-generated description if available
      description = botInfo.aiDescription
    } else {
      // Fall back to pre-recorded description
      description = botInfo.description
    }
    
    // Add the bot's name to the description
    const speechText = `${botDisplayName} says: ${description}`
    
    // Speak the description with the bot's voice properties
    setTimeout(() => {
      speakDescription(
        speechText, 
        botInfo.voicePitch || 1, 
        botInfo.voiceRate || 1
      )
      setLastSpeakerId(currentDescriberId)
    }, 1000) // Delay to allow UI to update
    
  }, [currentTurn?.currentDescriberId, game.useSpeech, game.useAI, lastSpeakerId])
  
  // This is a non-visual component, so return null
  return null
}

export default BotSpeech
