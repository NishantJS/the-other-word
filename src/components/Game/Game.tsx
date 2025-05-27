import { useAtomValue } from "jotai"
import { $yourPlayer, $currentTurn, $playersInfo, $game, $players } from "../../state/$state"
import styled, { createGlobalStyle, keyframes, css } from "styled-components/macro"
import { memo, useEffect, useState } from "react"
import { rel } from "../../style/rel"
import { descriptionDuration, votingDuration, resultDuration, turnCountdown } from "../../logic"
import { sounds } from "../../sounds/sounds"
import { EmoteSelector } from "./Describing/EmoteSelector"
import { Reactions } from "./Describing/Reactions"
import { PlayerLeavingNotification } from "./PlayerLeavingNotification"
import { CountdownNew } from "./CountdownNew"
import { ImpostorResultsNew } from "./Results/ImpostorResultsNew"
import { Results } from "./Results/Results"

// Enhanced animations
const fadeIn = keyframes`
  0% { opacity: 0; transform: translateY(${rel(20)}); }
  100% { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  0% { transform: translateX(-100%); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const glow = keyframes`
  0% { box-shadow: 0 0 ${rel(10)} rgba(255, 255, 255, 0.2); }
  50% { box-shadow: 0 0 ${rel(20)} rgba(255, 255, 255, 0.4); }
  100% { box-shadow: 0 0 ${rel(10)} rgba(255, 255, 255, 0.2); }
`;

const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-${rel(10)}); }
  60% { transform: translateY(-${rel(5)}); }
`;

// Global style for animations
const GlobalStyle = createGlobalStyle`
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }

  @keyframes fadeIn {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }
`

// Unified Timer Component
const UnifiedTimer = memo(({ stage, startedAt }: { stage: string, startedAt: number }) => {
  const [timeLeft, setTimeLeft] = useState(0)
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    const getDuration = () => {
      switch (stage) {
        case "countdown": return turnCountdown
        case "describing": return descriptionDuration
        case "voting": return votingDuration
        case "result": return resultDuration
        default: return 0
      }
    }

    const duration = getDuration()

    const interval = setInterval(() => {
      const currentTime = Rune.gameTime() / 1000
      const elapsed = currentTime - startedAt
      const remaining = Math.max(0, duration - elapsed)
      const progressPercent = (remaining / duration) * 100

      setTimeLeft(Math.ceil(remaining))
      setProgress(progressPercent)

      if (remaining <= 0) {
        clearInterval(interval)
      }
    }, 100)

    return () => clearInterval(interval)
  }, [stage, startedAt])

  const getStageInfo = () => {
    switch (stage) {
      case "countdown": return { icon: "⏰", label: "Starting", color: "#ff9800" }
      case "describing": return { icon: "💬", label: "Speaking", color: "#2196f3" }
      case "voting": return { icon: "🗳️", label: "Voting", color: "#f44336" }
      case "result": return { icon: "🎯", label: "Results", color: "#4caf50" }
      default: return { icon: "🎮", label: "Game", color: "#9c27b0" }
    }
  }

  const stageInfo = getStageInfo()
  const isAlmostOver = timeLeft <= 3 && timeLeft > 0

  return (
    <TimerContainer>
      <TimerProgress progress={progress} color={stageInfo.color} almostOver={isAlmostOver} />
      <TimerContent>
        <StageIcon almostOver={isAlmostOver}>{stageInfo.icon}</StageIcon>
        <TimerInfo>
          <StageLabel>{stageInfo.label}</StageLabel>
          <TimeDisplay almostOver={isAlmostOver}>{timeLeft}s</TimeDisplay>
        </TimerInfo>
      </TimerContent>
    </TimerContainer>
  )
})

export const Game = memo(() => {
  const yourPlayer = useAtomValue($yourPlayer)
  const currentTurn = useAtomValue($currentTurn)

  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null)
  const [hasVoted, setHasVoted] = useState(false)

  if (!currentTurn) return null

  // Reset voting state when stage changes
  useEffect(() => {
    if (currentTurn.stage !== "voting") {
      setSelectedPlayerId(null)
      setHasVoted(false)
    }
  }, [currentTurn.stage])

  // Check if player has voted
  useEffect(() => {
    if (yourPlayer?.voted) {
      setHasVoted(true)
    }
  }, [yourPlayer])

  const renderStageContent = () => {
    switch (currentTurn.stage) {
      case "countdown":
        return <CountdownNew />
      case "describing":
        return <DescribingContent />
      case "voting":
        return <VotingContent
          selectedPlayerId={selectedPlayerId}
          setSelectedPlayerId={setSelectedPlayerId}
          hasVoted={hasVoted}
          setHasVoted={setHasVoted}
        />
      case "result":
        return <ImpostorResultsNew />
      default:
        return <div>Unknown game stage</div>
    }
  }

  return (
    <>
      <GlobalStyle />
      <GameContainer>
        {/* Top Header with Timer and Word */}
        <TopHeader>
          <UnifiedTimer
            stage={currentTurn.stage}
            startedAt={currentTurn.timerStartedAt || 0}
          />
          {yourPlayer && (
            <YourWord isImpostor={currentTurn.stage === "result" ? !!yourPlayer.isImpostor : false}>
              <WordLabel>Your Word</WordLabel>
              <WordValue>{yourPlayer.secretWord}</WordValue>
              {currentTurn.stage === "result" && yourPlayer.isImpostor && (
                <ImpostorBadge>🎭 Impostor</ImpostorBadge>
              )}
            </YourWord>
          )}
        </TopHeader>

        {/* Main Content Area */}
        <MainContent>
          {renderStageContent()}
        </MainContent>

        {/* Reactions overlay */}
        <Reactions />

        {/* Emote selector for describing stage */}
        {currentTurn.stage === "describing" && <EmoteSelector />}

        {/* Player leaving notification */}
        <PlayerLeavingNotification />
      </GameContainer>
    </>
  )
})

// Content Components for each stage

const DescribingContent = memo(() => {
  const yourPlayer = useAtomValue($yourPlayer)
  const currentTurn = useAtomValue($currentTurn)
  const playersInfo = useAtomValue($playersInfo)
  const game = useAtomValue($game)

  if (yourPlayer?.describing) {
    return (
      <StageContainer>
        <StageTitle>💬 Your Turn!</StageTitle>
        <StageSubtitle>Describe your word clearly but don't be too specific</StageSubtitle>
        <ActionButton onClick={() => {
          sounds.uiClick.play()
          Rune.actions?.finishDescribing?.()
        }}>
          ✓ I'm Done Speaking
        </ActionButton>
      </StageContainer>
    )
  }

  // Show current speaker
  const describingPlayerId = currentTurn?.currentDescriberId
  let describingPlayer = null
  if (describingPlayerId) {
    const playerInfo = playersInfo[describingPlayerId]

    describingPlayer = {
      displayName: playerInfo?.displayName || 'Player',
      avatarUrl: playerInfo?.avatarUrl || '/images/default-avatar.svg'
    }
  }

  return (
    <StageContainer>
      <StageTitle>👂 Listen Carefully</StageTitle>
      {describingPlayer && (
        <SpeakerCard>
          <SpeakerAvatar src={describingPlayer.avatarUrl} />
          <SpeakerInfo>
            <SpeakerName>{describingPlayer.displayName}</SpeakerName>
            <SpeakerStatus>is speaking...</SpeakerStatus>
          </SpeakerInfo>
        </SpeakerCard>
      )}
      <StageSubtitle>Listen for clues and inconsistencies</StageSubtitle>
    </StageContainer>
  )
})

const VotingContent = memo(({ selectedPlayerId, setSelectedPlayerId, hasVoted, setHasVoted }: {
  selectedPlayerId: string | null
  setSelectedPlayerId: (id: string | null) => void
  hasVoted: boolean
  setHasVoted: (voted: boolean) => void
}) => {
  const yourPlayer = useAtomValue($yourPlayer)
  const playersInfo = useAtomValue($playersInfo)
  const game = useAtomValue($game)

  const otherPlayers = Object.entries(playersInfo)
    .filter(([id]) => id !== yourPlayer?.id)
    .map(([id, info]) => ({
      id,
      displayName: info?.displayName || 'Player',
      avatarUrl: info?.avatarUrl || '/images/default-avatar.svg'
    }))

  const handleVote = () => {
    if (!selectedPlayerId || hasVoted) return

    Rune.actions?.submitVote?.({
      suspectId: selectedPlayerId,
      round: game.round
    })

    sounds.uiClick.play()
    setHasVoted(true)
  }

  return (
    <StageContainer>
      <StageTitle>🗳️ Who is the Impostor?</StageTitle>
      <StageSubtitle>Vote for the player you think had a different word</StageSubtitle>

      <PlayerGrid>
        {otherPlayers.map((player) => (
          <PlayerCard
            key={player.id}
            selected={selectedPlayerId === player.id}
            disabled={hasVoted}
            onClick={() => {
              if (!hasVoted) {
                setSelectedPlayerId(player.id)
                sounds.uiClick.play()
              }
            }}
          >
            <PlayerAvatar src={player.avatarUrl} />
            <PlayerName>{player.displayName}</PlayerName>
          </PlayerCard>
        ))}
      </PlayerGrid>

      {!hasVoted && (
        <ActionButton
          disabled={!selectedPlayerId}
          onClick={handleVote}
        >
          {selectedPlayerId ? '🔒 Lock in Vote' : '👆 Select a Player'}
        </ActionButton>
      )}

      {hasVoted && (
        <VotedMessage>
          ✅ Vote submitted! Waiting for others...
        </VotedMessage>
      )}
    </StageContainer>
  )
})



// Styled Components
const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  background: transparent;
  position: relative;
  overflow: hidden;
`

const TopHeader = styled.div`
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: ${rel(16)} ${rel(20)};
  background: rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(${rel(10)});
  width: 100%;
  box-sizing: border-box;
`

const MainContent = styled.div`
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${rel(20)};
  overflow-y: auto;
`

// Timer Components
const TimerContainer = styled.div`
  position: relative;
  background: rgba(0, 0, 0, 0.3);
  border-radius: ${rel(20)};
  padding: ${rel(12)} ${rel(16)};
  backdrop-filter: blur(${rel(10)});
  border: ${rel(1)} solid rgba(255, 255, 255, 0.3);
  min-width: ${rel(140)};
`

const TimerProgress = styled.div<{ progress: number; color: string; almostOver: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: ${props => props.progress}%;
  background: ${props => props.almostOver ? '#ff4444' : '#4ecdc4'};
  border-radius: ${rel(20)};
  transition: width 0.1s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s ease;
  opacity: 0.6;
  animation: ${props => props.almostOver ? css`${pulse} 0.5s infinite` : 'none'};
`

const TimerContent = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: ${rel(8)};
`

const StageIcon = styled.div<{ almostOver: boolean }>`
  font-size: ${rel(20)};
  animation: ${props => props.almostOver ? css`${bounce} 0.6s infinite` : 'none'};
`

const TimerInfo = styled.div`
  display: flex;
  flex-direction: column;
`

const StageLabel = styled.div`
  font-size: ${rel(12)};
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
`

const TimeDisplay = styled.div<{ almostOver: boolean }>`
  font-size: ${rel(16)};
  font-weight: bold;
  color: ${props => props.almostOver ? '#ff4444' : 'white'};
  transition: color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
`

// Word Display Components
const YourWord = styled.div<{ isImpostor: boolean }>`
  background: ${props => props.isImpostor
    ? 'linear-gradient(135deg, #ff6b6b, #ee5a24)'
    : 'linear-gradient(135deg, #00bcd4, #0097a7)'};
  border-radius: ${rel(16)};
  padding: ${rel(12)} ${rel(16)};
  backdrop-filter: blur(${rel(10)});
  border: ${rel(2)} solid rgba(255, 255, 255, 0.4);
  text-align: center;
  box-shadow: 0 ${rel(4)} ${rel(12)} rgba(0, 0, 0, 0.3);
  animation: ${props => props.isImpostor ? css`${glow} 0.5s ease-out` : css`${fadeIn} 0.5s ease-out`};
`

const WordLabel = styled.div`
  font-size: ${rel(10)};
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: ${rel(4)};
  text-transform: uppercase;
  letter-spacing: ${rel(1)};
`

const WordValue = styled.div`
  font-size: ${rel(16)};
  font-weight: bold;
  color: white;
  text-transform: uppercase;
`

const ImpostorBadge = styled.div`
  font-size: ${rel(10)};
  color: #ffeb3b;
  margin-top: ${rel(4)};
  animation: ${css`${pulse} 1s infinite`};
`

// Stage Content Components
const StageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  max-width: ${rel(400)};
  width: 100%;
  gap: ${rel(24)};
  animation: ${css`${fadeIn} 0.6s ease-out`};
`

const StageTitle = styled.h1`
  font-size: ${rel(32)};
  font-weight: bold;
  color: white;
  margin: 0;
  text-shadow: 0 ${rel(2)} ${rel(4)} rgba(0, 0, 0, 0.3);
  animation: ${css`${slideIn} 0.8s ease-out`};
`

const StageSubtitle = styled.p`
  font-size: ${rel(18)};
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  line-height: 1.4;
  animation: ${css`${slideIn} 1s ease-out`};
`

const ActionButton = styled.button<{ disabled?: boolean; primary?: boolean }>`
  background: ${props =>
    props.disabled ? '#666' :
    props.primary ? 'linear-gradient(135deg, #ff6b6b, #ee5a24)' :
    'linear-gradient(135deg, #4ecdc4, #44a08d)'};
  color: white;
  font-size: ${rel(18)};
  font-weight: bold;
  padding: ${rel(16)} ${rel(32)};
  border-radius: ${rel(25)};
  border: none;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.6 : 1};
  transition: all 0.3s ease;
  box-shadow: 0 ${rel(4)} ${rel(12)} rgba(0, 0, 0, 0.2);
  animation: ${css`${fadeIn} 1.2s ease-out`};
  text-transform: uppercase;
  letter-spacing: ${rel(1)};

  &:hover {
    ${props => !props.disabled && `
      transform: translateY(-${rel(2)});
      box-shadow: 0 ${rel(6)} ${rel(16)} rgba(0, 0, 0, 0.3);
    `}
  }

  &:active {
    ${props => !props.disabled && `
      transform: translateY(0);
      box-shadow: 0 ${rel(2)} ${rel(8)} rgba(0, 0, 0, 0.2);
    `}
  }
`

// Speaker Components
const SpeakerCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: ${rel(20)};
  padding: ${rel(20)};
  backdrop-filter: blur(${rel(10)});
  border: ${rel(1)} solid rgba(255, 255, 255, 0.2);
  animation: ${css`${fadeIn} 0.8s ease-out`};
`

const SpeakerAvatar = styled.img`
  width: ${rel(80)};
  height: ${rel(80)};
  border-radius: 50%;
  border: ${rel(3)} solid white;
  box-shadow: 0 ${rel(4)} ${rel(8)} rgba(0, 0, 0, 0.2);
  margin-bottom: ${rel(12)};
`

const SpeakerInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${rel(4)};
`

const SpeakerName = styled.div`
  font-size: ${rel(20)};
  font-weight: bold;
  color: white;
`

const SpeakerStatus = styled.div`
  font-size: ${rel(14)};
  color: rgba(255, 255, 255, 0.8);
  font-style: italic;
`



// Voting Components
const PlayerGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(${rel(120)}, 1fr));
  gap: ${rel(16)};
  width: 100%;
  max-width: ${rel(400)};
`

const PlayerCard = styled.div<{ selected: boolean; disabled: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${rel(16)};
  background: ${props =>
    props.selected ? 'rgba(255, 107, 107, 0.4)' : 'rgba(0, 0, 0, 0.3)'};
  border: ${rel(2)} solid ${props =>
    props.selected ? '#ff6b6b' : 'rgba(255, 255, 255, 0.3)'};
  border-radius: ${rel(16)};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  backdrop-filter: blur(${rel(10)});
  opacity: ${props => props.disabled ? 0.7 : 1};
  animation: ${css`${fadeIn} 0.6s ease-out`};
  box-shadow: 0 ${rel(4)} ${rel(8)} rgba(0, 0, 0, 0.2);

  &:hover {
    ${props => !props.disabled && `
      transform: translateY(-${rel(4)});
      box-shadow: 0 ${rel(8)} ${rel(16)} rgba(0, 0, 0, 0.3);
      background: ${props.selected ? 'rgba(255, 107, 107, 0.5)' : 'rgba(0, 0, 0, 0.4)'};
    `}
  }

  ${props => props.selected && css`
    transform: scale(1.05);
    box-shadow: 0 ${rel(8)} ${rel(16)} rgba(255, 107, 107, 0.4);
    animation: ${pulse} 2s infinite;
  `}
`

const PlayerAvatar = styled.img`
  width: ${rel(60)};
  height: ${rel(60)};
  border-radius: 50%;
  border: ${rel(2)} solid white;
  margin-bottom: ${rel(8)};
`

const PlayerName = styled.div`
  font-size: ${rel(14)};
  font-weight: bold;
  color: white;
  text-align: center;
  margin-bottom: ${rel(4)};
`

const VotedMessage = styled.div`
  font-size: ${rel(18)};
  color: #4caf50;
  font-weight: bold;
  text-align: center;
  background: rgba(76, 175, 80, 0.1);
  padding: ${rel(16)} ${rel(24)};
  border-radius: ${rel(16)};
  border: ${rel(1)} solid rgba(76, 175, 80, 0.3);
  animation: ${css`${fadeIn} 0.6s ease-out`};
`

// Results Components
const ImpostorReveal = styled.div<{ caught: boolean }>`
  display: flex;
  align-items: center;
  gap: ${rel(16)};
  background: ${props => props.caught
    ? 'rgba(255, 193, 7, 0.2)'
    : 'rgba(0, 204, 187, 0.2)'};
  border: ${rel(2)} solid ${props => props.caught
    ? 'rgba(255, 193, 7, 0.6)'
    : 'rgba(0, 204, 187, 0.6)'};
  border-radius: ${rel(20)};
  padding: ${rel(20)};
  backdrop-filter: blur(${rel(10)});
  box-shadow: 0 ${rel(4)} ${rel(12)} rgba(0, 0, 0, 0.3);
  animation: ${css`${fadeIn} 0.8s ease-out`};
`

const ImpostorAvatar = styled.img`
  width: ${rel(80)};
  height: ${rel(80)};
  border-radius: 50%;
  border: ${rel(3)} solid white;
  box-shadow: 0 ${rel(4)} ${rel(8)} rgba(0, 0, 0, 0.2);
`

const ImpostorInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${rel(4)};
`

const ImpostorName = styled.div`
  font-size: ${rel(24)};
  font-weight: bold;
  color: white;
`

const ImpostorStatus = styled.div<{ caught: boolean }>`
  font-size: ${rel(16)};
  color: ${props => props.caught ? '#ffc107' : '#00ccbb'};
  font-weight: bold;
`

const WordReveal = styled.div`
  display: flex;
  align-items: center;
  gap: ${rel(16)};
  width: 100%;
  max-width: ${rel(350)};
  animation: ${css`${fadeIn} 1s ease-out`};
`

const WordColumn = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: ${rel(16)};
  padding: ${rel(16)};
  backdrop-filter: blur(${rel(10)});
  border: ${rel(1)} solid rgba(255, 255, 255, 0.2);
`

const WordColumnLabel = styled.div`
  font-size: ${rel(12)};
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: ${rel(8)};
  text-transform: uppercase;
  letter-spacing: ${rel(1)};
`

const WordColumnValue = styled.div`
  font-size: ${rel(20)};
  font-weight: bold;
  color: white;
  text-transform: uppercase;
`

const WordDivider = styled.div`
  font-size: ${rel(16)};
  color: rgba(255, 255, 255, 0.6);
  font-weight: bold;
`