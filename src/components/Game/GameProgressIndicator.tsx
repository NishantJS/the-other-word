import React, { memo, useEffect, useState } from 'react'
import styled, { keyframes, css } from 'styled-components/macro'
import { useAtomValue } from 'jotai'
import { $game, $currentTurn, $round } from '../../state/$state'
import { rel } from '../../style/rel'

const slideIn = keyframes`
  0% { transform: translateX(-${rel(100)}); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
`

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`

const fillProgress = keyframes`
  0% { width: 0%; }
  100% { width: 100%; }
`

export const GameProgressIndicator = memo(() => {
  const game = useAtomValue($game)
  const currentTurn = useAtomValue($currentTurn)
  const round = useAtomValue($round)
  const [showProgress, setShowProgress] = useState(true)
  const [stableRound, setStableRound] = useState(0)

  // Stabilize the round counter to prevent infinite updates
  useEffect(() => {
    const gameRound = game?.round ?? round
    if (gameRound !== stableRound) {
      setStableRound(gameRound)
    }
  }, [game?.round, round, stableRound])

  // Calculate progress more consistently using available game state properties
  const totalPlayers = game.players.filter(p => !p.isBot).length
  const progressPercentage = Math.min((stableRound / Math.max(totalPlayers, 1)) * 100, 100)

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

  // Stage display name
  const getStageDisplayName = (stage: string) => {
    switch (stage) {
      case 'countdown': return 'Ready'
      case 'describing': return 'Describe'
      case 'voting': return 'Vote'
      case 'result': return 'Results'
      default: return 'Game'
    }
  }

  if (!currentTurn || !showProgress) return null

  return (
    <ProgressContainer>
      <ProgressHeader>
        <StageIndicator>
          <StageIcon>{getStageIcon(currentTurn.stage)}</StageIcon>
          <StageName>{getStageDisplayName(currentTurn.stage)}</StageName>
        </StageIndicator>        <RoundCounter>
          Round {stableRound + 1} of {totalPlayers}
        </RoundCounter>
      </ProgressHeader>
      
      <ProgressBarContainer>
        <ProgressBar>
          <ProgressFill 
            percentage={progressPercentage}
            animated={currentTurn.stage === 'describing' || currentTurn.stage === 'voting'}
          />
        </ProgressBar>
        <ProgressText>{Math.round(progressPercentage)}%</ProgressText>
      </ProgressBarContainer>
      
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
  gap: ${rel(6)};
`

const StageIcon = styled.span`
  font-size: ${rel(16)};
  animation: ${pulse} 2s infinite ease-in-out;
`

const StageName = styled.span`
  color: white;
  font-size: ${rel(14)};
  font-weight: bold;
`

const RoundCounter = styled.span`
  color: #ffcc00;
  font-size: ${rel(12)};
  font-weight: bold;
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

const ProgressFill = styled.div<{ percentage: number; animated: boolean }>`
  height: 100%;
  width: ${props => props.percentage}%;
  background: linear-gradient(90deg, #4caf50, #8bc34a);
  border-radius: ${rel(3)};
  transition: width 0.5s ease-out;
  
  ${props => props.animated && css`
    background: linear-gradient(90deg, #4caf50, #8bc34a, #4caf50);
    background-size: 200% 100%;
    animation: ${fillProgress} 2s infinite ease-in-out;
  `}
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
