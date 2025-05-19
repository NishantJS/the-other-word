import { useAtomValue } from "jotai"
import { $reactions, $playersInfo } from "../../../state/$state"
import styled, { keyframes } from "styled-components/macro"
import { rel } from "../../../style/rel"
import { memo, useEffect, useState } from "react"

// Type for a displayed reaction
type DisplayedReaction = {
  id: string
  emoji: string
  playerId: string
  timestamp: number
  position: {
    x: number
    y: number
  }
}

export const Reactions = memo(() => {
  const reactions = useAtomValue($reactions)
  const playersInfo = useAtomValue($playersInfo)
  const [displayedEmotes, setDisplayedEmotes] = useState<Record<string, DisplayedReaction>>({})

  // Process new reactions
  useEffect(() => {
    if (!reactions || reactions.length === 0) return

    // Get the latest reaction
    const latestReaction = reactions[reactions.length - 1]

    // Generate a random position for the reaction
    const position = {
      x: Math.floor(Math.random() * 70) + 15, // 15% to 85% of the width
      y: Math.floor(Math.random() * 40) + 30, // 30% to 70% of the height
    }

    // Create a new reaction object
    const newReaction = {
      id: `${latestReaction.emoji}`,
      emoji: latestReaction.emoji,
      playerId: latestReaction.playerId,
      timestamp: latestReaction.timestamp,
      position,
    }

    // Update the displayed emotes, replacing any existing one with the same emoji
    setDisplayedEmotes((prev) => ({
      ...prev,
      [latestReaction.emoji]: newReaction
    }))

    // Schedule removal of the reaction after 3 seconds
    setTimeout(() => {
      setDisplayedEmotes((prev) => {
        // Only remove if this is still the same reaction (by timestamp)
        if (prev[latestReaction.emoji]?.timestamp === latestReaction.timestamp) {
          const newState = { ...prev }
          delete newState[latestReaction.emoji]
          return newState
        }
        return prev
      })
    }, 3000)
  }, [reactions])

  // Convert the emotes object to an array for rendering
  const emoteArray = Object.values(displayedEmotes)

  if (emoteArray.length === 0) return null

  return (
    <Root>
      {emoteArray.map((reaction) => (
        <ReactionBubble
          key={reaction.id}
          style={{
            left: `${reaction.position.x}%`,
            top: `${reaction.position.y}%`,
          }}
        >
          <ReactionEmoji>{reaction.emoji}</ReactionEmoji>
          <PlayerName>
            {playersInfo[reaction.playerId]?.displayName || "Player"}
          </PlayerName>
        </ReactionBubble>
      ))}
    </Root>
  )
})

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.8);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`

const fadeOut = keyframes`
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.8);
  }
`

const Root = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10;
`

const ReactionBubble = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: ${fadeInUp} 0.3s ease-out forwards, ${fadeOut} 0.5s ease-in forwards 2.5s;
  background-color: rgba(0, 0, 0, 0.7);
  border-radius: ${rel(12)};
  padding: ${rel(8)} ${rel(12)};
  pointer-events: none;
  border: ${rel(1)} solid rgba(138, 77, 255, 0.6);
  box-shadow: 0 ${rel(2)} ${rel(8)} rgba(0, 0, 0, 0.4);
`

const ReactionEmoji = styled.div`
  font-size: ${rel(32)};
  line-height: 1;
  margin-bottom: ${rel(4)};
`

const PlayerName = styled.div`
  font-size: ${rel(10)};
  color: white;
  max-width: ${rel(80)};
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`
