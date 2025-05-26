import { useAtomValue } from "jotai"
import { $game, $playersInfo } from "../../state/$state"
import styled, { keyframes } from "styled-components/macro"
import { memo, useEffect } from "react"
import { rel } from "../../style/rel"

const slideInFromTop = keyframes`
  0% {
    transform: translateY(-100%);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
`

const slideOutToTop = keyframes`
  0% {
    transform: translateY(0);
    opacity: 1;
  }
  100% {
    transform: translateY(-100%);
    opacity: 0;
  }
`

export const PlayerLeavingNotification = memo(() => {
  const game = useAtomValue($game)
  const playersInfo = useAtomValue($playersInfo)

  const notification = game.playerLeavingNotification

  useEffect(() => {
    if (notification) {
      // Auto-clear notification after 4 seconds (before the server auto-clear at 5 seconds)
      const timer = setTimeout(() => {
        Rune.actions?.clearPlayerLeavingNotification?.()
      }, 4000)

      return () => clearTimeout(timer)
    }
  }, [notification])

  if (!notification) return null

  const playerInfo = playersInfo[notification.playerId]
  const playerName = playerInfo?.displayName || 'A player'

  const getNotificationMessage = () => {
    const { wasImpostor, wasCurrentDescriber, gameStage } = notification

    if (wasImpostor) {
      return `🎭 ${playerName} (the impostor) left the game!`
    }

    if (wasCurrentDescriber) {
      return `💬 ${playerName} left while speaking - skipping their turn`
    }

    switch (gameStage) {
      case "countdown":
        return `👋 ${playerName} left during countdown`
      case "describing":
        return `👋 ${playerName} left during descriptions`
      case "voting":
        return `🗳️ ${playerName} left during voting`
      case "result":
        return `📊 ${playerName} left during results`
      default:
        return `👋 ${playerName} left the game`
    }
  }

  const getNotificationColor = () => {
    if (notification.wasImpostor) {
      return '#ff6b6b' // Red for impostor leaving
    }
    if (notification.wasCurrentDescriber) {
      return '#ffa726' // Orange for current speaker leaving
    }
    return '#42a5f5' // Blue for general leaving
  }

  return (
    <NotificationContainer color={getNotificationColor()}>
      <NotificationContent>
        <NotificationIcon>
          {notification.wasImpostor ? '🎭' : 
           notification.wasCurrentDescriber ? '💬' : '👋'}
        </NotificationIcon>
        <NotificationText>
          {getNotificationMessage()}
        </NotificationText>
        <CloseButton onClick={() => Rune.actions?.clearPlayerLeavingNotification?.()}>
          ✕
        </CloseButton>
      </NotificationContent>
    </NotificationContainer>
  )
})

const NotificationContainer = styled.div<{ color: string }>`
  position: fixed;
  top: ${rel(20)};
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  background: ${props => props.color};
  border-radius: ${rel(12)};
  box-shadow: 0 ${rel(4)} ${rel(16)} rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(${rel(10)});
  border: ${rel(1)} solid rgba(255, 255, 255, 0.3);
  animation: ${slideInFromTop} 0.3s ease-out;
  max-width: 90vw;
  min-width: ${rel(280)};
`

const NotificationContent = styled.div`
  display: flex;
  align-items: center;
  padding: ${rel(12)} ${rel(16)};
  gap: ${rel(12)};
`

const NotificationIcon = styled.div`
  font-size: ${rel(20)};
  flex-shrink: 0;
`

const NotificationText = styled.div`
  color: white;
  font-size: ${rel(14)};
  font-weight: 500;
  flex: 1;
  text-align: center;
`

const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: ${rel(24)};
  height: ${rel(24)};
  color: white;
  font-size: ${rel(12)};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 150ms ease-out;
  flex-shrink: 0;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  &:active {
    transform: scale(0.95);
  }
`
