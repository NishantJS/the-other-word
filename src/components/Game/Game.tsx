import { useAtomValue } from "jotai"
import { $yourPlayer, $currentTurn, $game } from "../../state/$state"
import styled, { css, createGlobalStyle, keyframes } from "styled-components/macro"
import { CountdownNew } from "./CountdownNew"
import { Describing } from "./Describing/Describing"
import { Voting } from "./Voting/Voting"
import { ImpostorResultsNew } from "./Results/ImpostorResultsNew"
import { memo, useEffect, useState } from "react"
import { rel } from "../../style/rel"
import { BotSpeech } from "./BotSpeech/BotSpeech"

// Enhanced animations
const fadeIn = keyframes`
  0% { opacity: 0; transform: translateY(${rel(10)}); }
  100% { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const shimmer = keyframes`
  0% { background-position: -${rel(200)} 0; }
  100% { background-position: ${rel(200)} 0; }
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

// Stage icon component with animation
const StageIcon = memo(({ stage }: { stage: string }) => {
  const [isAnimated, setIsAnimated] = useState(true);
  
  useEffect(() => {
    setIsAnimated(true);
    const timer = setTimeout(() => setIsAnimated(false), 1000);
    return () => clearTimeout(timer);
  }, [stage]);
  let icon = "⏱️";
  if (stage === "describing") icon = "👁️";
  if (stage === "voting") icon = "🔍";
  if (stage === "result") icon = "🏆";
  
  return <IconWrapper isAnimated={isAnimated}>{icon}</IconWrapper>;
});

const IconWrapper = styled.div<{ isAnimated: boolean }>`
  font-size: ${rel(32)};
  margin-bottom: ${rel(8)};
  animation: ${props => props.isAnimated ? css`${pulse} 0.6s ease-in-out` : 'none'};
  filter: drop-shadow(0 ${rel(2)} ${rel(3)} rgba(0, 0, 0, 0.3));
`

// Word display for current user with subtle animation
const WordDisplay = memo(({ word, isImpostor }: { word: string, isImpostor: boolean }) => (
  <WordContainer>
    <WordText>{word}</WordText>
    {isImpostor && <RoleIndicator>🎭</RoleIndicator>}
  </WordContainer>
));

const WordContainer = styled.div`
  position: absolute;
  top: ${rel(8)};
  right: ${rel(8)};
  display: flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.3);
  padding: ${rel(4)} ${rel(8)};
  border-radius: ${rel(12)};
  z-index: 10;
  backdrop-filter: blur(${rel(4)});
  animation: ${fadeIn} 0.5s ease-out;
  box-shadow: 0 ${rel(2)} ${rel(8)} rgba(0, 0, 0, 0.2);
  border: ${rel(1)} solid rgba(255, 255, 255, 0.1);
  
  &:hover {
    background: rgba(0, 0, 0, 0.4);
  }
`

const WordText = styled.span`
  color: white;
  font-size: ${rel(14)};
  font-weight: bold;
`

const RoleIndicator = styled.span`
  font-size: ${rel(16)};
  margin-left: ${rel(4)};
  animation: ${pulse} 2s infinite ease-in-out;
`

export const Game = memo(() => {
  const yourPlayer = useAtomValue($yourPlayer)
  const currentTurn = useAtomValue($currentTurn)
  const game = useAtomValue($game)
  const [prevStage, setPrevStage] = useState<string | null>(null);
  
  // Detect stage changes for animations
  useEffect(() => {
    if (currentTurn?.stage && currentTurn.stage !== prevStage) {
      setPrevStage(currentTurn.stage);
    }
  }, [currentTurn?.stage, prevStage]);

  if (!currentTurn) return null
    // Handle different stage types with a switch statement for better readability
  let content = null;
  switch (currentTurn.stage) {
    case "countdown":
      content = <CountdownNew />;
      break;
    case "describing":
      content = <Describing />;
      break;
    case "voting":
      content = <Voting />;
      break;
    case "result":
      content = <ImpostorResultsNew />;
      break;
    default:
      // Type safety - should never reach here
      content = <div>Unknown game stage</div>;
  }

  // Determine the stage display name for the header
  const stageDisplayName = (() => {
    switch (currentTurn.stage) {
      case "countdown": return "Get Ready";
      case "describing": return "Describe";
      case "voting": return "Find Impostor";
      case "result": return "Results";
      default: return "The Other Word";
    }
  })();
  
  return (
    <>
      <GlobalStyle />
      <Root isImpostor={yourPlayer?.isImpostor}>
        <StageIndicator stageChanged={currentTurn.stage !== prevStage}>
          <StageIcon stage={currentTurn.stage} />
          <StageTitle>{stageDisplayName}</StageTitle>
        </StageIndicator>
        <GameContent>
          {yourPlayer && <WordDisplay 
            word={yourPlayer.secretWord} 
            isImpostor={!!yourPlayer.isImpostor} 
          />}
          {content}
        </GameContent>
        {/* Add BotSpeech component if speech is enabled */}
        {game.useSpeech && <BotSpeech />}
      </Root>
    </>
  )
})

const Root = styled.div<{ isImpostor?: boolean }>`
  animation: fadeIn 300ms ease-out forwards;
  z-index: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, 
    ${props => props.isImpostor ? '#673ab7' : '#5f3dc4'} 0%, 
    ${props => props.isImpostor ? '#4a148c' : '#462297'} 50%, 
    ${props => props.isImpostor ? '#311b92' : '#311b92'} 100%
  );
  position: relative;
  height: 100vh;
  max-height: 100%;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 40%),
                radial-gradient(circle at 75% 75%, rgba(255,255,255,0.05) 0%, transparent 40%);
    pointer-events: none;
    z-index: 0;
  }
`

const StageIndicator = styled.div<{ stageChanged: boolean }>`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: ${rel(12)} 0 ${rel(16)};
  animation: ${props => props.stageChanged ? css`${fadeIn} 0.4s ease-out` : 'none'};
`

const StageTitle = styled.h1`
  color: white;
  font-size: ${rel(22)};
  font-weight: bold;
  margin: 0;
  text-align: center;
  text-shadow: 0 ${rel(2)} ${rel(4)} rgba(0, 0, 0, 0.4);
  letter-spacing: ${rel(1)};
`

const GameContent = styled.div`
  position: relative;
  z-index: 1;
  width: 90%;
  max-width: ${rel(400)};
  height: 75vh;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  backdrop-filter: blur(${rel(2)});
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
  padding: ${rel(16)};
  border-radius: ${rel(16)};
  box-shadow: 0 ${rel(8)} ${rel(24)} rgba(0, 0, 0, 0.25);
  border: ${rel(1)} solid rgba(255, 255, 255, 0.08);
  overflow-y: auto;
  transition: background-color 0.3s ease;
  
  /* Custom scrollbar for better UX */
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
  
  &::-webkit-scrollbar {
    width: ${rel(6)};
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.3);
    border-radius: ${rel(3)};
    border: ${rel(1)} solid transparent;
  }
`
