import { memo, useState } from 'react'
import styled, { keyframes, css } from 'styled-components/macro'
import { useAtomValue } from 'jotai'
import { $game, $currentTurn, $round, $yourPlayer, $playersInfo } from '../../state/$state'
import { rel } from '../../style/rel'
import { useTimerValue } from '../Timer/useTimerValue'
import { turnCountdown, descriptionDuration, votingDuration, resultDuration } from '../../logic'

const slideIn = keyframes`
  0% { transform: translateX(-${rel(100)}); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
`

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`

const urgentPulse = keyframes`
  0% { background-color: #ff5722; }
  50% { background-color: #f44336; }
  100% { background-color: #ff5722; }
`

export const GameProgressIndicator = memo(() => {
  const game = useAtomValue($game)
  const currentTurn = useAtomValue($currentTurn)
  const round = useAtomValue($round)
  const yourPlayer = useAtomValue($yourPlayer)
  const playersInfo = useAtomValue($playersInfo)
  const [showProgress, setShowProgress] = useState(true)
    // Get timer value for current stage with dynamic duration based on stage
  const getStageDuration = () => {
    if (!currentTurn) return 30
    switch (currentTurn.stage) {
      case 'countdown': return turnCountdown
      case 'describing': return descriptionDuration
      case 'voting': return votingDuration
      case 'result': return resultDuration
      default: return 30
    }
  }

  const timerValue = useTimerValue({
    startedAt: currentTurn?.timerStartedAt,
    duration: getStageDuration()
  })

  // Get current and next player information
  const getCurrentPlayerInfo = () => {
    if (!currentTurn) return null

    const currentId = currentTurn.currentDescriberId
    const nextId = currentTurn.nextDescriberId

    if (!currentId) return null

    // Get current player info
    const currentPlayerInfo = playersInfo[currentId]

    const currentPlayer = {
      id: currentId,
      name: currentPlayerInfo?.displayName || 'Player',
      isYou: currentId === yourPlayer?.id
    }

    // Get next player info if available
    let nextPlayer = null
    if (nextId) {
      const nextPlayerInfo = playersInfo[nextId]

      nextPlayer = {
        id: nextId,
        name: nextPlayerInfo?.displayName || 'Player',
        isYou: nextId === yourPlayer?.id
      }
    }

    return { current: currentPlayer, next: nextPlayer }
  }

  const playerInfo = getCurrentPlayerInfo()

  // Calculate progress using available game state properties
  const totalPlayers = game.players.length
  const currentRound = game?.round ?? round
  const progressPercentage = Math.min((currentRound / Math.max(totalPlayers, 1)) * 100, 100)

  // Stage icons
  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'countdown': return '⏱️'
      case 'describing': return '💭'
      case 'voting': return '🔍'
      case 'result': return '🏆'
      default: return '🎮'
    }
  }

  // Get stage-specific information to display
  const getStageInfo = () => {
    if (!currentTurn) return null

    switch (currentTurn.stage) {
      case 'countdown':
        return {
          title: 'Get Ready!',
          subtitle: playerInfo?.current.isYou ? 'Your turn to describe!' : `${playerInfo?.current.name} is up next`,
          showTimer: true,
          showNext: false
        }
      case 'describing':
        if (playerInfo?.current.isYou) {
          return {
            title: 'Your Turn!',
            subtitle: 'Describe your word clearly',
            showTimer: true,
            showNext: false
          }
        } else {
          return {
            title: `${playerInfo?.current.name} is describing`,
            subtitle: playerInfo?.next?.isYou ? 'You\'re next!' : playerInfo?.next ? `Next: ${playerInfo.next.name}` : 'Listen carefully',
            showTimer: true,
            showNext: !!playerInfo?.next
          }
        }
      case 'voting':
        return {
          title: 'Voting Time!',
          subtitle: 'Who do you think is the impostor?',
          showTimer: true,
          showNext: false
        }
      case 'result':
        return {
          title: 'Results',
          subtitle: 'See how everyone did',
          showTimer: false,
          showNext: false
        }
      default:
        return {
          title: 'Game in Progress',
          subtitle: '',
          showTimer: true,
          showNext: false
        }
    }
  }

  const stageInfo = getStageInfo()

  if (!currentTurn || !showProgress) return null

  return (
    <ProgressContainer>
      <ProgressHeader>
        <StageIndicator>
          <StageIcon>{getStageIcon(currentTurn.stage)}</StageIcon>
          <StageInfo>
            <StageName>{stageInfo?.title || 'Game'}</StageName>
            <StageSubtitle>{stageInfo?.subtitle}</StageSubtitle>
          </StageInfo>
          {stageInfo?.showTimer && timerValue !== null && (
            <TimerDisplay urgent={timerValue < 5}>
              {Math.ceil(Math.max(0, timerValue))}s
            </TimerDisplay>
          )}
        </StageIndicator>
      </ProgressHeader>

      {/* Show current player timer prominently during describing stage */}
      {currentTurn.stage === 'describing' && timerValue !== null && (
        <CurrentPlayerTimer>
          <PlayerTimerLabel>
            {playerInfo?.current.isYou ? 'Your time:' : `${playerInfo?.current.name}'s time:`}
          </PlayerTimerLabel>
          <LargeTimerDisplay urgent={timerValue < 5}>
            {Math.ceil(Math.max(0, timerValue))}s
          </LargeTimerDisplay>
        </CurrentPlayerTimer>
      )}

      {/* Show next player info during describing stage */}
      {currentTurn.stage === 'describing' && stageInfo?.showNext && playerInfo?.next && (
        <NextPlayerInfo>
          <NextPlayerLabel>Next up:</NextPlayerLabel>
          <NextPlayerName isYou={playerInfo.next.isYou}>
            {playerInfo.next.isYou ? 'You!' : playerInfo.next.name}
          </NextPlayerName>
        </NextPlayerInfo>
      )}

      {/* Show voting info during voting stage */}
      {currentTurn.stage === 'voting' && (
        <VotingProgress>
          <VotingLabel>
            {game.players.filter(p => p.voted).length} / {game.players.length} voted
          </VotingLabel>
          <VotingIndicator>
            {game.players.map(player => (
              <VoteDot key={player.id} voted={player.voted} />
            ))}
          </VotingIndicator>
        </VotingProgress>
      )}

      {/* Only show overall progress bar during non-describing stages */}
      {currentTurn.stage !== 'describing' && (
        <ProgressBarContainer>
          <ProgressBar>
            <ProgressFill percentage={progressPercentage} />
          </ProgressBar>
          <ProgressText>{Math.round(progressPercentage)}%</ProgressText>
        </ProgressBarContainer>
      )}

      <MinimizeButton onClick={() => setShowProgress(false)}>
        ⌄
      </MinimizeButton>
    </ProgressContainer>
  )
})

const ProgressContainer = styled.div`
  position: fixed;
  top: ${rel(12)};
  left: ${rel(12)};
  right: ${rel(12)};
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(${rel(8)});
  border-radius: ${rel(12)};
  padding: ${rel(8)} ${rel(12)};
  z-index: 100;
  animation: ${slideIn} 0.5s ease-out;
  border: ${rel(1)} solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 ${rel(4)} ${rel(12)} rgba(0, 0, 0, 0.3);

  @media (max-width: 480px) {
    top: ${rel(8)};
    left: ${rel(8)};
    right: ${rel(8)};
    padding: ${rel(6)} ${rel(10)};
  }
`

const ProgressHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${rel(8)};
`

const StageIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: ${rel(8)};
  flex: 1;
`

const StageInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${rel(2)};
  flex: 1;
`

const StageName = styled.span`
  color: white;
  font-size: ${rel(14)};
  font-weight: bold;
  line-height: 1.2;
`

const StageSubtitle = styled.span`
  color: #e4faff;
  font-size: ${rel(11)};
  line-height: 1.2;
  opacity: 0.9;
`

const TimerDisplay = styled.span<{ urgent: boolean }>`
  color: ${props => props.urgent ? '#ff5722' : '#4caf50'};
  font-size: ${rel(12)};
  font-weight: bold;
  background: rgba(0, 0, 0, 0.4);
  padding: ${rel(2)} ${rel(6)};
  border-radius: ${rel(8)};
  min-width: ${rel(28)};
  text-align: center;
  flex-shrink: 0;

  ${props => props.urgent && css`
    animation: ${urgentPulse} 1s infinite ease-in-out;
  `}
`

const CurrentPlayerTimer = styled.div`
  margin: ${rel(8)} 0;
  padding: ${rel(12)} ${rel(16)};
  background: rgba(0, 0, 0, 0.4);
  border-radius: ${rel(12)};
  text-align: center;
  border: ${rel(2)} solid rgba(76, 175, 80, 0.3);
`

const PlayerTimerLabel = styled.div`
  color: #e4faff;
  font-size: ${rel(14)};
  margin-bottom: ${rel(6)};
  font-weight: bold;
`

const LargeTimerDisplay = styled.div<{ urgent: boolean }>`
  color: ${props => props.urgent ? '#ff5722' : '#4caf50'};
  font-size: ${rel(32)};
  font-weight: bold;
  text-shadow: 0 ${rel(2)} ${rel(4)} rgba(0, 0, 0, 0.5);

  ${props => props.urgent && css`
    animation: ${urgentPulse} 0.5s infinite ease-in-out;
    color: #ff1744;
  `}
`



const ProgressBarContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${rel(8)};
`

const ProgressBar = styled.div`
  flex: 1;
  height: ${rel(6)};
  background: rgba(255, 255, 255, 0.2);
  border-radius: ${rel(3)};
  overflow: hidden;
`

const ProgressFill = styled.div<{ percentage: number }>`
  height: 100%;
  width: ${props => props.percentage}%;
  background: linear-gradient(90deg, #4caf50, #8bc34a);
  border-radius: ${rel(3)};
  transition: width 0.5s ease-out;
`

const ProgressText = styled.span`
  color: white;
  font-size: ${rel(11)};
  font-weight: bold;
  min-width: ${rel(30)};
  text-align: right;
`

const MinimizeButton = styled.button`
  position: absolute;
  top: ${rel(-8)};
  right: ${rel(8)};
  background: rgba(0, 0, 0, 0.6);
  border: none;
  color: white;
  font-size: ${rel(12)};
  width: ${rel(20)};
  height: ${rel(20)};
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.8);
    transform: scale(1.1);
  }
`

const StageIcon = styled.span`
  font-size: ${rel(16)};
  animation: ${pulse} 2s infinite ease-in-out;
  flex-shrink: 0;
`

const NextPlayerInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${rel(6)};
  margin: ${rel(6)} 0;
  padding: ${rel(4)} ${rel(8)};
  background: rgba(255, 102, 0, 0.2);
  border-radius: ${rel(6)};
  border-left: ${rel(3)} solid #ff6600;
`

const NextPlayerLabel = styled.span`
  color: #ffcc99;
  font-size: ${rel(11)};
  font-weight: bold;
`

const NextPlayerName = styled.span<{ isYou: boolean }>`
  color: ${props => props.isYou ? '#ffcc00' : '#white'};
  font-size: ${rel(11)};
  font-weight: ${props => props.isYou ? 'bold' : 'normal'};
  animation: ${props => props.isYou ? css`${pulse} 1.5s infinite ease-in-out` : 'none'};
`

const VotingProgress = styled.div`
  margin: ${rel(8)} 0;
  padding: ${rel(6)} ${rel(8)};
  background: rgba(0, 0, 0, 0.3);
  border-radius: ${rel(6)};
  text-align: center;
`

const VotingLabel = styled.div`
  color: #e4faff;
  font-size: ${rel(11)};
  margin-bottom: ${rel(4)};
`

const VotingIndicator = styled.div`
  display: flex;
  justify-content: center;
  gap: ${rel(3)};
  flex-wrap: wrap;
`

const VoteDot = styled.div<{ voted: boolean }>`
  width: ${rel(8)};
  height: ${rel(8)};
  border-radius: 50%;
  background: ${props => props.voted ? '#4caf50' : 'rgba(255, 255, 255, 0.3)'};
  transition: background-color 0.3s ease;
`
