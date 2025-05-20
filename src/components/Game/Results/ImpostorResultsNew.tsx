import { useAtomValue } from "jotai"
import { $currentTurn, $gameOver, $yourPlayerId, $playersInfo, $game, $players } from "../../../state/$state"
import styled, { css, keyframes } from "styled-components/macro"
import { rel } from "../../../style/rel"
import { memo, useEffect } from "react"
import { sounds } from "../../../sounds/sounds"

// Enhanced animations
const popIn = keyframes`
  0% { transform: scale(0.8); opacity: 0; }
  70% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
`;

const fadeInUp = keyframes`
  0% { transform: translateY(${rel(20)}); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

export const ImpostorResultsNew = memo(() => {
  const currentTurn = useAtomValue($currentTurn)
  const gameOver = useAtomValue($gameOver)
  const yourPlayerId = useAtomValue($yourPlayerId)

  // Play sound when results are shown
  useEffect(() => {
    sounds.endOfTurn.play()
  }, [])

  if (!currentTurn) return null

  // Find the impostor
  const playersInfo = useAtomValue($playersInfo)
  const gamePlayers = useAtomValue($players)
  const gameState = useAtomValue($game)

  const impostorPlayer = Object.entries(playersInfo)
    .map(([id, info]) => {
      const gamePlayer = gamePlayers.find(p => p.id === id)
      // Find bot info if this is a bot
      const isBot = gamePlayer?.isBot || false
      const botInfo = isBot ? gameState.bots.find(b => b.id === id) : null

      return {
        id,
        // Use info if available, otherwise use bot info
        displayName: info?.displayName || botInfo?.name || 'Player',
        avatarUrl: info?.avatarUrl || botInfo?.avatarUrl || '/images/bots/default.svg',
        isBot: isBot,
        isImpostor: gamePlayer?.isImpostor || false
      }
    })
    .find(player => player.isImpostor)

  if (!impostorPlayer) return null

  const isImpostorCaught = currentTurn.impostorCaught
  const isYouImpostor = gamePlayers.find(p => p.id === yourPlayerId)?.isImpostor

  // Shortened versions of the result messages
  const resultMessage = isImpostorCaught
    ? isYouImpostor 
      ? "You were discovered!"
      : "Impostor found!"
    : isYouImpostor
      ? "You blended in!"
      : "Impostor escaped!";

  // Shortened versions of the game over messages
  const gameOverMessage = isImpostorCaught
    ? isYouImpostor 
      ? "Team Wins" 
      : "Your Team Wins"
    : isYouImpostor 
      ? "You Win" 
      : "Impostor Wins";

  // Icon based on result
  const resultIcon = isImpostorCaught ? "👁️‍🗨️" : "🎭";
  
  return (
    <Root>
      {/* Main result card containing everything */}
      <ResultCard>
        <ResultHeading caught={isImpostorCaught}>
          {resultIcon} {resultMessage}
        </ResultHeading>
        
        <ImpostorSection>
          <ImpostorAvatar caught={isImpostorCaught}>
            <AvatarImg src={impostorPlayer.avatarUrl} />
            {impostorPlayer.isBot && <BotIndicator>🤖</BotIndicator>}
          </ImpostorAvatar>
          <ImpostorDetail>
            <ImpostorName>
              {impostorPlayer.id === yourPlayerId ? "You" : impostorPlayer.displayName}
            </ImpostorName>
            <ImpostorTag caught={isImpostorCaught}>
              {isImpostorCaught ? "Caught" : "Escaped"}
            </ImpostorTag>
          </ImpostorDetail>
        </ImpostorSection>
        
        <WordsSection>
          <WordColumn>
            <WordLabel>Team Word</WordLabel>
            <WordValue>{gameState.currentWord}</WordValue>
          </WordColumn>
          
          <WordDivider>vs</WordDivider>
          
          <WordColumn>
            <WordLabel>Impostor Word</WordLabel>
            <WordValue>{gameState.impostorWord}</WordValue>
          </WordColumn>
        </WordsSection>
      </ResultCard>
      
      {/* Game over state */}
      {gameOver ? (
        <OutcomeSection>
          <GameOverBadge caught={isImpostorCaught}>
            {gameOverMessage}
          </GameOverBadge>
          <ActionButton primary onClick={() => Rune.showGameOverPopUp()}>
            View Final Scores
          </ActionButton>
        </OutcomeSection>
      ) : (
        <ActionButton onClick={() => Rune.actions?.nextRound?.()}>
          Next Round
        </ActionButton>
      )}
    </Root>
  )
})

// Styled Components
const Root = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${rel(10)} ${rel(4)};
  height: 100%;
  position: relative;
  gap: ${rel(20)};
`

const ResultCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 95%;
  max-width: ${rel(350)};
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%);
  border-radius: ${rel(20)};
  backdrop-filter: blur(${rel(4)});
  padding: ${rel(16)};
  gap: ${rel(16)};
  box-shadow: 0 ${rel(8)} ${rel(16)} rgba(0, 0, 0, 0.3);
  border: ${rel(1)} solid rgba(255, 255, 255, 0.1);
  animation: ${popIn} 0.6s forwards;
`

const ResultHeading = styled.h2<{ caught: boolean }>`
  font-size: ${rel(22)};
  margin: 0;
  color: ${props => props.caught ? '#ffcc00' : '#00ccbb'};
  text-align: center;
  text-shadow: 0 ${rel(2)} ${rel(4)} rgba(0, 0, 0, 0.5);
`

const ImpostorSection = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  gap: ${rel(14)};
  padding: ${rel(10)};
  border-radius: ${rel(16)};
  background: rgba(0, 0, 0, 0.2);
  animation: ${fadeInUp} 0.5s forwards;
`

const ImpostorAvatar = styled.div<{ caught: boolean }>`
  position: relative;
  border-radius: 50%;
  border: ${rel(3)} solid ${props => props.caught ? '#ffcc00' : '#00ccbb'};
  padding: ${rel(2)};
  box-shadow: 0 ${rel(3)} ${rel(6)} rgba(0, 0, 0, 0.3);
`

const AvatarImg = styled.img`
  width: ${rel(50)};
  height: ${rel(50)};
  border-radius: 50%;
`

const BotIndicator = styled.div`
  position: absolute;
  bottom: ${rel(-5)};
  right: ${rel(-5)};
  font-size: ${rel(14)};
  background: rgba(0, 0, 0, 0.7);
  border-radius: 50%;
  width: ${rel(22)};
  height: ${rel(22)};
  display: flex;
  align-items: center;
  justify-content: center;
`

const ImpostorDetail = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`

const ImpostorName = styled.div`
  font-size: ${rel(18)};
  font-weight: bold;
  color: white;
`

const ImpostorTag = styled.div<{ caught: boolean }>`
  font-size: ${rel(14)};
  color: ${props => props.caught ? '#ffcc00' : '#00ccbb'};
`

const WordsSection = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  gap: ${rel(10)};
  animation: ${fadeInUp} 0.7s forwards;
`

const WordColumn = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${rel(8)} ${rel(4)};
  background: rgba(0, 0, 0, 0.15);
  border-radius: ${rel(10)};
`

const WordLabel = styled.div`
  font-size: ${rel(12)};
  color: #e4faff;
  margin-bottom: ${rel(4)};
`

const WordValue = styled.div`
  font-size: ${rel(16)};
  font-weight: bold;
  color: white;
  text-transform: uppercase;
`

const WordDivider = styled.div`
  font-size: ${rel(14)};
  color: #e4faff;
  opacity: 0.6;
`

const OutcomeSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${rel(14)};
  width: 100%;
  animation: ${fadeInUp} 0.8s forwards;
`

const GameOverBadge = styled.div<{ caught: boolean }>`
  font-size: ${rel(22)};
  font-weight: bold;
  color: ${props => props.caught ? '#ffcc00' : '#00ccbb'};
  text-align: center;
  padding: ${rel(8)} ${rel(20)};
  border-radius: ${rel(14)};
  background: rgba(0, 0, 0, 0.3);
  border: ${rel(2)} solid ${props => props.caught ? 'rgba(255, 204, 0, 0.4)' : 'rgba(0, 204, 187, 0.4)'};
  animation: ${pulse} 2s infinite;
`

const ActionButton = styled.button<{ primary?: boolean }>`
  background: ${props => props.primary 
    ? 'linear-gradient(to bottom, #6e35ab, #5c2d91)' 
    : 'linear-gradient(to bottom, #2d8091, #1a6275)'};
  color: white;
  font-size: ${props => props.primary ? rel(18) : rel(16)};
  font-weight: bold;
  padding: ${rel(10)} ${rel(20)};
  border-radius: ${rel(12)};
  border: none;
  cursor: pointer;
  box-shadow: 0 ${rel(4)} ${rel(8)} rgba(0, 0, 0, 0.3);
  transition: transform 0.1s ease-in-out, background 0.2s;
  animation: ${fadeInUp} 0.9s forwards;

  &:active {
    transform: translateY(${rel(2)});
    background: ${props => props.primary 
      ? 'linear-gradient(to bottom, #5c2d91, #4e2678)' 
      : 'linear-gradient(to bottom, #1a6275, #0d4e61)'};
    box-shadow: 0 ${rel(2)} ${rel(4)} rgba(0, 0, 0, 0.3);
  }
`