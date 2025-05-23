import { useAtomValue } from "jotai"
import { $yourPlayer, $currentTurn, $playersInfo, $game } from "../../../state/$state"
import styled, { css, keyframes } from "styled-components/macro"
import { rel } from "../../../style/rel"
import { memo, useEffect, useState } from "react"
import { descriptionDuration } from "../../../logic"
import { Reactions } from "./Reactions"
import { EmoteSelector } from "./EmoteSelector"

// Animation keyframes for components
const fadeIn = keyframes`
  0% { opacity: 0; transform: translateY(${rel(10)}); }
  100% { opacity: 1; transform: translateY(0); }
`;

const popIn = keyframes`
  0% { transform: scale(0.9); opacity: 0; }
  70% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

// Countdown timer component to show remaining time
const CountdownTimer = memo(({
  startedAt,
  duration,
  onTimeUp
}: {
  startedAt: number,
  duration: number,
  onTimeUp?: () => void
}) => {
  const [timeLeft, setTimeLeft] = useState(Math.max(0, Math.ceil(duration - (Rune.gameTime() / 1000 - startedAt))))
  const [milliseconds, setMilliseconds] = useState(0)
  
  useEffect(() => {
    const interval = setInterval(() => {
      const timePassedMs = Rune.gameTime() - (startedAt * 1000)
      const timeLeftSec = Math.max(0, Math.ceil(duration - (timePassedMs / 1000)))
      const ms = Math.floor((timePassedMs % 1000) / 10).toString().padStart(2, '0')
      
      setTimeLeft(timeLeftSec)
      setMilliseconds(parseInt(ms))

      if (timeLeftSec <= 0) {
        clearInterval(interval)
        if (onTimeUp) {
          onTimeUp()
        }
      }
    }, 50)

    return () => clearInterval(interval)
  }, [startedAt, duration, onTimeUp])

  return (
    <TimeDisplay isLow={timeLeft <= 5}>
      {timeLeft}:{milliseconds.toString().padStart(2, '0')}
    </TimeDisplay>
  )
})

export const Describing = memo(() => {
  const yourPlayer = useAtomValue($yourPlayer)
  const currentTurn = useAtomValue($currentTurn)

  // Function to handle auto-finish when time is up
  const handleTimeUp = () => {
    if (yourPlayer?.describing) {
      Rune.actions?.finishDescribing?.()
    }
  }

  // If player is not describing, show a spectating view
  if (!yourPlayer?.describing) {
    return <SpectatingView />
  }

  // If player is describing, show their secret word
  return (
    <Root>
      {/* Countdown at the very top */}
      <CountdownContainer>
        <CountdownTimer
          startedAt={currentTurn?.timerStartedAt || 0}
          duration={descriptionDuration}
          onTimeUp={handleTimeUp}
        />
      </CountdownContainer>
      
      {/* Reactions from other players */}
      <Reactions />
      
      {/* Main content area with instructions */}
      <ContentArea>
        <SecretWord>{yourPlayer.secretWord}</SecretWord>
        
        <CompactInstructions>
          <Instruction>Describe this word clearly</Instruction>
          <Instruction>Don't be too specific!</Instruction>
        </CompactInstructions>
        
        <FinishButton onClick={() => Rune.actions?.finishDescribing?.()}>
          I'm Done
        </FinishButton>
      </ContentArea>
      
      {/* Emote selector for reactions */}
      <EmoteSelector />
    </Root>
  )
})

// Component shown to players who are not currently describing
const SpectatingView = memo(() => {
  const currentTurn = useAtomValue($currentTurn)
  const yourPlayer = useAtomValue($yourPlayer)
  // Find the current describing player
  const describingPlayerId = currentTurn?.currentDescriberId
  const nextDescriberId = currentTurn?.nextDescriberId
  const playersInfo = useAtomValue($playersInfo)
  const game = useAtomValue($game)

  // Get player info and check if they are bots
  let describingPlayer = null
  if (describingPlayerId) {
    const playerInfo = playersInfo[describingPlayerId]
    const gamePlayer = game.players.find(p => p.id === describingPlayerId)
    const isBot = gamePlayer?.isBot || false
    const botInfo = isBot ? game.bots.find(b => b.id === describingPlayerId) : null

    describingPlayer = {
      displayName: playerInfo?.displayName || botInfo?.name || 'Player',
      avatarUrl: playerInfo?.avatarUrl || botInfo?.avatarUrl || '/images/bots/default.svg',
      isBot: isBot
    }
  }

  const isImpostor = yourPlayer?.isImpostor
  const isNextPlayer = nextDescriberId === yourPlayer?.id

  if (!describingPlayer) return null

  return (
    <Root>
      {/* Countdown at the very top */}
      <CountdownContainer>
        <CountdownTimer
          startedAt={currentTurn?.timerStartedAt || 0}
          duration={descriptionDuration}
          onTimeUp={undefined}
        />
      </CountdownContainer>

      {/* Show status indicators in corner */}
      {isNextPlayer ? (
        <NextPlayerAlert>
          <AlertIcon>👁️</AlertIcon>
          You're next!
        </NextPlayerAlert>
      ) : isImpostor && (
        <ImpostorChip>
          <EyeIcon>👁️</EyeIcon>
          <ImpostorText>You are the impostor</ImpostorText>
        </ImpostorChip>
      )}
      
      {/* Simplified speaker info */}      <SpeakerDisplay>
        <AvatarImg src={describingPlayer.avatarUrl} />
        <PlayerName>
          {describingPlayer.displayName}
          <SpeakerStatus>is speaking</SpeakerStatus>
        </PlayerName>
        {describingPlayer.isBot && <BotBadge>🤖</BotBadge>}
      </SpeakerDisplay>
      
      {/* Concise instructions */}
      <CompactInstructions>
        <Instruction>Listen carefully for inconsistencies</Instruction>
        <Instruction>Can you identify the impostor?</Instruction>
      </CompactInstructions>
      
      {/* Emote selector for reactions */}
      <EmoteSelector />
      
      {/* Concise instructions */}
      <CompactInstructions>
        <Instruction>Listen carefully for inconsistencies</Instruction>
        <Instruction>Can you identify the impostor?</Instruction>
      </CompactInstructions>
      
      {/* Emote selector for reactions */}
      <EmoteSelector />
    </Root>
  )
})

// Styled Components
const Root = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${rel(8)} ${rel(12)};
  height: 100%;
  position: relative;
  overflow: hidden;
`

const CountdownContainer = styled.div`
  position: absolute;
  top: ${rel(0)};
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  padding: ${rel(4)} 0;
  z-index: 10;
`

const TimeDisplay = styled.div<{ isLow: boolean }>`
  font-family: 'Ubuntu Mono', monospace;
  font-size: ${rel(28)};
  font-weight: bold;
  color: ${props => props.isLow ? '#ff5252' : '#ffcc00'};
  text-shadow: 0 ${rel(2)} ${rel(4)} rgba(0, 0, 0, 0.3);
  animation: ${props => props.isLow ? css`${pulse} 0.8s infinite` : 'none'};
`

const WordChip = styled.div`
  position: absolute;
  top: ${rel(8)};
  right: ${rel(8)};
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  background: rgba(0, 0, 0, 0.4);
  border-radius: ${rel(8)};
  padding: ${rel(6)} ${rel(10)};
  z-index: 5;
  box-shadow: 0 ${rel(2)} ${rel(4)} rgba(0, 0, 0, 0.2);
  animation: ${fadeIn} 0.3s ease-out;
`

const WordLabel = styled.div`
  font-size: ${rel(10)};
  color: #e4faff;
  margin-bottom: ${rel(2)};
`

const WordValue = styled.div`
  font-size: ${rel(14)};
  font-weight: bold;
  color: white;
  text-transform: uppercase;
`

const ContentArea = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  width: 100%;
  margin: ${rel(40)} 0 ${rel(20)};
  gap: ${rel(20)};
`

const SecretWord = styled.div`
  font-size: ${rel(36)};
  font-weight: bold;
  color: #fff;
  background: linear-gradient(135deg, #7931c7, #5c2d91);
  padding: ${rel(12)} ${rel(24)};
  border-radius: ${rel(12)};
  box-shadow: 0 ${rel(4)} ${rel(8)} rgba(0, 0, 0, 0.25);
  text-transform: uppercase;
  animation: ${popIn} 0.5s ease-out;
  margin-top: ${rel(40)};
  border: ${rel(2)} solid rgba(255, 255, 255, 0.2);
`

const CompactInstructions = styled.div`
  display: flex;
  flex-direction: column;
  text-align: center;
  gap: ${rel(6)};
  color: #e4faff;
  max-width: ${rel(280)};
  margin: ${rel(10)} 0;
`

const Instruction = styled.p`
  margin: 0;
  font-size: ${rel(16)};
  line-height: 1.3;
`

const FinishButton = styled.button`
  background: linear-gradient(to bottom, #6ab800, #5bb600);
  color: white;
  font-size: ${rel(22)};
  padding: ${rel(10)} ${rel(20)};
  border-radius: ${rel(12)};
  border: none;
  box-shadow: 0 ${rel(4)} ${rel(8)} rgba(0, 0, 0, 0.25);
  cursor: pointer;
  margin-top: ${rel(20)};
  transition: all 0.2s ease;

  &:active {
    transform: translateY(${rel(2)});
    box-shadow: 0 ${rel(2)} ${rel(4)} rgba(0, 0, 0, 0.25);
    background: linear-gradient(to bottom, #5bb600, #4aa500);
  }
`

const NextPlayerAlert = styled.div`
  position: absolute;
  top: ${rel(40)};
  right: ${rel(10)};
  display: flex;
  align-items: center;
  background-color: rgba(255, 102, 0, 0.9);
  color: white;
  font-weight: bold;
  padding: ${rel(6)} ${rel(12)};
  border-radius: ${rel(20)};
  font-size: ${rel(14)};
  z-index: 5;
  gap: ${rel(6)};
  animation: ${pulse} 1.5s infinite;
  box-shadow: 0 ${rel(2)} ${rel(6)} rgba(0, 0, 0, 0.3);
`

const AlertIcon = styled.span`
  font-size: ${rel(14)};
`

const ImpostorChip = styled.div`
  position: absolute;
  top: ${rel(8)};
  right: ${rel(8)};
  display: flex;
  align-items: center;
  gap: ${rel(6)};
  background: rgba(0, 0, 0, 0.4);
  border-radius: ${rel(8)};
  padding: ${rel(6)} ${rel(10)};
  z-index: 5;
  box-shadow: 0 ${rel(2)} ${rel(4)} rgba(0, 0, 0, 0.2);
  animation: ${fadeIn} 0.3s ease-out;
`

const EyeIcon = styled.span`
  font-size: ${rel(12)};
`

const ImpostorText = styled.span`
  font-size: ${rel(10)};
  color: #e4faff;
`

const SpeakerDisplay = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: ${rel(60)};
  animation: ${fadeIn} 0.5s ease-out;
`

const AvatarImg = styled.img`
  width: ${rel(80)};
  height: ${rel(80)};
  border-radius: 50%;
  border: ${rel(3)} solid white;
  box-shadow: 0 ${rel(4)} ${rel(8)} rgba(0, 0, 0, 0.3);
  margin-bottom: ${rel(8)};
`

const PlayerName = styled.div`
  font-size: ${rel(20)};
  color: white;
  text-align: center;
  font-weight: bold;
`

const SpeakerStatus = styled.div`
  font-size: ${rel(16)};
  color: #e4faff;
  font-weight: normal;
  margin-top: ${rel(4)};
`

const BotBadge = styled.div`
  font-size: ${rel(14)};
  color: #00bcd4;
  background-color: rgba(0, 0, 0, 0.3);
  padding: ${rel(2)} ${rel(8)};
  border-radius: ${rel(10)};
  margin-top: ${rel(5)};
  display: flex;
  align-items: center;
`

const PlayerOrderRow = styled.div`
  display: flex;
  gap: ${rel(12)};
  margin-top: ${rel(20)};
  flex-wrap: wrap;
  justify-content: center;
  max-width: 100%;
  padding: 0 ${rel(10)};
`

const NextPlayerChip = styled.div<{ isNext?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${rel(8)};
  background: ${props => props.isNext ? 'rgba(255, 102, 0, 0.7)' : 'rgba(0, 0, 0, 0.3)'};
  border-radius: ${rel(16)};
  padding: ${rel(4)} ${rel(10)};
  animation: ${props => props.isNext ? css`${pulse} 1.5s infinite` : 'none'};
  box-shadow: 0 ${rel(2)} ${rel(4)} rgba(0, 0, 0, 0.2);
`

const NextPlayerAvatar = styled.img`
  width: ${rel(24)};
  height: ${rel(24)};
  border-radius: 50%;
`

const NextPlayerText = styled.span<{ isNext?: boolean }>`
  color: white;
  font-size: ${rel(12)};
  font-weight: ${props => props.isNext ? 'bold' : 'normal'};
`
