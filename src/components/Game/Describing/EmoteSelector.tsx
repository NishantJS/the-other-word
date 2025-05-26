import styled from "styled-components/macro"
import { rel } from "../../../style/rel"
import { memo, useState } from "react"
import { sounds } from "../../../sounds/sounds"

// List of available emotes themed around suspicion and deception
const EMOTES = ["🤔", "👀", "🧐", "🕵️", "😑", "🤥", "😏", "🤨", "😒", "🤫", "🤭", "😬"]

export const EmoteSelector = memo(() => {
  const [isOpen, setIsOpen] = useState(false)
  const [cooldown, setCooldown] = useState(false)

  const handleToggle = () => {
    setIsOpen(!isOpen)
    sounds.guessButton.play()
  }

  const handleSelectEmote = (emoji: string) => {
    if (cooldown) return

    // Send the reaction
    try {
      Rune.actions?.sendReaction?.({
        emoji
      })
    } catch (error: unknown) {
      // Handle errors silently (e.g., throttling)
    }

    // Play sound
    sounds.guessButton.play()

    // Close the selector
    setIsOpen(false)

    // Set cooldown
    setCooldown(true)
    setTimeout(() => {
      setCooldown(false)
    }, 2000) // 2 second cooldown
  }

  return (
    <Root>
      {isOpen ? (
        <EmoteGrid>
          <EmoteTitle>React to the speaker...</EmoteTitle>
          {EMOTES.map((emoji) => (
            <EmoteButton
              key={emoji}
              onClick={() => handleSelectEmote(emoji)}
              disabled={cooldown}
            >
              {emoji}
            </EmoteButton>
          ))}
          <CloseButton onClick={handleToggle}>✕</CloseButton>
        </EmoteGrid>
      ) : (
        <ToggleButton onClick={handleToggle} disabled={cooldown}>
          {cooldown ? "⏱️" : "🕵️"}
        </ToggleButton>
      )}
    </Root>
  )
})

const Root = styled.div`
  position: absolute;
  bottom: ${rel(20)};
  right: ${rel(20)};
  z-index: 100;
`

const ToggleButton = styled.button<{ disabled?: boolean }>`
  width: ${rel(50)};
  height: ${rel(50)};
  border-radius: 50%;
  background-color: #5c2d91;
  border: ${rel(2)} solid #8a4dff;
  color: white;
  font-size: ${rel(24)};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 ${rel(4)} ${rel(8)} rgba(0, 0, 0, 0.3);
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.95);
  }

  ${props => props.disabled && `
    opacity: 0.7;
    cursor: not-allowed;
  `}
`

const EmoteTitle = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  color: white;
  font-size: ${rel(14)};
  margin-bottom: ${rel(8)};
  font-weight: bold;
  text-shadow: 0 ${rel(1)} ${rel(2)} rgba(0, 0, 0, 0.5);
`

const EmoteGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${rel(8)};
  background-color: rgba(92, 45, 145, 0.9);
  border: ${rel(2)} solid #8a4dff;
  border-radius: ${rel(12)};
  padding: ${rel(12)};
  box-shadow: 0 ${rel(4)} ${rel(8)} rgba(0, 0, 0, 0.3);
  position: relative;
  max-width: ${rel(240)};
`

const EmoteButton = styled.button<{ disabled?: boolean }>`
  width: ${rel(50)};
  height: ${rel(50)};
  border-radius: ${rel(8)};
  background-color: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: ${rel(24)};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.3);
  }

  &:active {
    transform: scale(0.95);
  }

  ${props => props.disabled && `
    opacity: 0.7;
    cursor: not-allowed;
  `}
`

const CloseButton = styled.button`
  position: absolute;
  top: ${rel(-15)};
  right: ${rel(-15)};
  width: ${rel(30)};
  height: ${rel(30)};
  border-radius: 50%;
  background-color: #ff4d4d;
  border: ${rel(2)} solid white;
  color: white;
  font-size: ${rel(14)};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 ${rel(2)} ${rel(4)} rgba(0, 0, 0, 0.3);

  &:active {
    transform: scale(0.95);
  }
`
