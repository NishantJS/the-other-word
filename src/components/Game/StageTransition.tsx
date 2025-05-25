import React, { memo, useEffect, useState } from 'react'
import styled, { keyframes, css } from 'styled-components/macro'
import { rel } from '../../style/rel'

const scaleIn = keyframes`
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
`

const slideInFromBottom = keyframes`
  0% { transform: translateY(${rel(100)}); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
`

const shimmer = keyframes`
  0% { background-position: -${rel(200)} 0; }
  100% { background-position: ${rel(200)} 0; }
`

const fadeInScale = keyframes`
  0% { transform: scale(0.8); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
`

export interface StageTransitionProps {
  stage: string
  onTransitionComplete?: () => void
  show: boolean
}

export const StageTransition = memo(({ stage, onTransitionComplete, show }: StageTransitionProps) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (show) {
      setIsVisible(true)
      // Reduced duration to avoid timer issues - quick transition only
      const timer = setTimeout(() => {
        setIsVisible(false)
        onTransitionComplete?.()
      }, 1200) // Reduced from 2000ms to 1200ms
      return () => clearTimeout(timer)
    }
  }, [show, onTransitionComplete])

  if (!isVisible) return null

  const getStageInfo = (stage: string) => {
    switch (stage) {
      case 'countdown':
        return {
          icon: '⏱️',
          title: 'Get Ready!',
          subtitle: 'Prepare to receive your word',
          color: '#ff9800'
        }
      case 'describing':
        return {
          icon: '💭',
          title: 'Describe Time!',
          subtitle: 'Describe your word clearly',
          color: '#2196f3'
        }
      case 'voting':
        return {
          icon: '🔍',
          title: 'Detective Mode!',
          subtitle: 'Find the impostor among you',
          color: '#f44336'
        }
      case 'result':
        return {
          icon: '🏆',
          title: 'Results!',
          subtitle: 'See who was the impostor',
          color: '#4caf50'
        }
      default:
        return {
          icon: '🎮',
          title: 'Game Time!',
          subtitle: 'Let the games begin',
          color: '#9c27b0'
        }
    }
  }

  const stageInfo = getStageInfo(stage)

  return (
    <TransitionOverlay>
      <TransitionContent color={stageInfo.color}>
        <StageIcon>{stageInfo.icon}</StageIcon>
        <StageTitle>{stageInfo.title}</StageTitle>
        <StageSubtitle>{stageInfo.subtitle}</StageSubtitle>
        <ProgressIndicator />
      </TransitionContent>
    </TransitionOverlay>
  )
})

export const QuickTip = memo(({ 
  tip, 
  show, 
  onDismiss 
}: { 
  tip: string
  show: boolean
  onDismiss: () => void 
}) => {
  useEffect(() => {
    if (show) {
      // Reduced tip duration to avoid spam
      const timer = setTimeout(() => {
        onDismiss()
      }, 3000) // Reduced from 4000ms to 3000ms
      return () => clearTimeout(timer)
    }
  }, [show, onDismiss])

  if (!show) return null

  return (
    <TipContainer onClick={onDismiss}>
      <TipIcon>💡</TipIcon>
      <TipText>{tip}</TipText>
    </TipContainer>
  )
})

const TransitionOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6); /* Reduced opacity from 0.9 to 0.6 */
  backdrop-filter: blur(${rel(4)}); /* Reduced blur from 8 to 4 */
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${fadeInScale} 0.3s ease-out; /* Faster animation */
`

const TransitionContent = styled.div<{ color: string }>`
  text-align: center;
  animation: ${slideInFromBottom} 0.6s ease-out;
`

const StageIcon = styled.div`
  font-size: ${rel(80)};
  margin-bottom: ${rel(16)};
  animation: ${scaleIn} 0.8s ease-out;
  filter: drop-shadow(0 ${rel(4)} ${rel(8)} rgba(0, 0, 0, 0.3));
`

const StageTitle = styled.h1`
  color: white;
  font-size: ${rel(48)};
  font-weight: bold;
  margin: 0 0 ${rel(8)};
  text-shadow: 0 ${rel(2)} ${rel(4)} rgba(0, 0, 0, 0.5);
  animation: ${slideInFromBottom} 0.7s ease-out 0.2s both;
`

const StageSubtitle = styled.p`
  color: #e4faff;
  font-size: ${rel(20)};
  margin: 0 0 ${rel(24)};
  animation: ${slideInFromBottom} 0.7s ease-out 0.4s both;
`

const ProgressIndicator = styled.div`
  width: ${rel(200)};
  height: ${rel(4)};
  background: rgba(255, 255, 255, 0.2);
  border-radius: ${rel(2)};
  margin: 0 auto;
  overflow: hidden;
  animation: ${slideInFromBottom} 0.7s ease-out 0.6s both;
  
  &::after {
    content: '';
    display: block;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, white, transparent);
    background-size: ${rel(100)} 100%;
    animation: ${shimmer} 1.5s infinite ease-in-out;
  }
`

const TipContainer = styled.div`
  position: fixed;
  bottom: ${rel(20)};
  left: ${rel(12)};
  right: ${rel(12)};
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(${rel(8)});
  border-radius: ${rel(12)};
  padding: ${rel(12)} ${rel(16)};
  display: flex;
  align-items: center;
  gap: ${rel(12)};
  z-index: 500;
  animation: ${slideInFromBottom} 0.5s ease-out;
  border: ${rel(1)} solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(0, 0, 0, 0.9);
    transform: translateY(-${rel(2)});
  }
`

const TipIcon = styled.span`
  font-size: ${rel(20)};
  animation: ${scaleIn} 0.6s ease-out;
`

const TipText = styled.span`
  color: white;
  font-size: ${rel(14)};
  line-height: 1.4;
  flex: 1;
`
