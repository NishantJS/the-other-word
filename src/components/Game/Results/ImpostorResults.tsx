import { useAtomValue } from "jotai"
import { $currentTurn, $gameOver, $yourPlayerId, $playersInfo, $game, $players } from "../../../state/$state"
import styled, { css, keyframes } from "styled-components/macro"
import { rel } from "../../../style/rel"
import { memo, useEffect } from "react"
import { sounds } from "../../../sounds/sounds"

const popIn = keyframes`
  0% { transform: scale(0.8); opacity: 0; }
  70% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
`;

export const ImpostorResults = memo(() => {
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

  return (
    <Root>
      <ResultStatus caught={isImpostorCaught}>
        {isImpostorCaught ? "👮‍♂️" : "🏃‍♂️"}
      </ResultStatus>
      
      <CompactImpostorCard caught={isImpostorCaught}>
        <AvatarContainer>
          <AvatarImg src={impostorPlayer.avatarUrl} />
          {impostorPlayer.isBot && <BotBadge>🤖</BotBadge>}
        </AvatarContainer>
        
        <ImpostorInfo>
          <ImpostorName>
            {impostorPlayer.id === yourPlayerId ? "You" : impostorPlayer.displayName}
          </ImpostorName>
          <ImpostorLabel>Impostor</ImpostorLabel>
        </ImpostorInfo>
      </CompactImpostorCard>
      
      <WordsRow>
        <WordCard>
          <WordValue>{gameState.currentWord}</WordValue>
          <WordLabel>Team Word</WordLabel>
        </WordCard>
        
        <WordDivider>≠</WordDivider>
        
        <WordCard>
          <WordValue>{gameState.impostorWord}</WordValue>
          <WordLabel>Impostor Word</WordLabel>
        </WordCard>
      </WordsRow>
      
      <ResultMessage>{resultMessage}</ResultMessage>
      
      {gameOver ? (
        <>
          <GameOverBadge>{gameOverMessage}</GameOverBadge>
          <NextButton onClick={() => Rune.showGameOverPopUp()}>
            Final Scores
          </NextButton>
        </>
      ) : (
        <NextButton onClick={() => Rune.actions?.nextRound?.()}>
          Next Round
        </NextButton>
      )}
    </Root>
  )
})

const Root = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: ${rel(10)} ${rel(4)};
  height: 100%;
  position: relative;
`

const ResultStatus = styled.div<{ caught: boolean }>`
  font-size: ${rel(40)};
  margin-bottom: ${rel(16)};
  animation: ${popIn} 0.5s forwards;
`

// New compact impostor card design
const CompactImpostorCard = styled.div<{ caught: boolean }>`
  display: flex;
  align-items: center;
  background-color: ${({ caught }) => caught ? 'rgba(233, 54, 67, 0.3)' : 'rgba(91, 182, 0, 0.3)'};
  border: ${rel(2)} solid ${({ caught }) => caught ? '#e93643' : '#5bb600'};
  border-radius: ${rel(16)};
  padding: ${rel(12)};
  margin-bottom: ${rel(20)};
  width: 90%;
  max-width: ${rel(350)};
  animation: ${popIn} 0.6s forwards;
  box-shadow: 0 ${rel(4)} ${rel(12)} rgba(0, 0, 0, 0.3);
`

const AvatarContainer = styled.div`
  position: relative;
  margin-right: ${rel(12)};
`

const AvatarImg = styled.img`
  width: ${rel(60)};
  height: ${rel(60)};
  border-radius: 50%;
  border: ${rel(3)} solid white;
`

const ImpostorInfo = styled.div`
  display: flex;
  flex-direction: column;
`

const ImpostorName = styled.div`
  font-size: ${rel(20)};
  font-weight: bold;
  color: white;
  margin-bottom: ${rel(2)};
`

const ImpostorLabel = styled.div`
  font-size: ${rel(16)};
  color: #e4faff;
`

const BotBadge = styled.div`
  position: absolute;
  bottom: ${rel(-5)};
  right: ${rel(-5)};
  font-size: ${rel(16)};
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  width: ${rel(26)};
  height: ${rel(26)};
  display: flex;
  align-items: center;
  justify-content: center;
  border: ${rel(2)} solid #00bcd4;
`

// Word comparison row
const WordsRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin-bottom: ${rel(20)};
  animation: ${popIn} 0.7s forwards;
`

const WordCard = styled.div`
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: ${rel(8)};
  padding: ${rel(10)};
  width: 42%;
  text-align: center;
`

const WordLabel = styled.div`
  font-size: ${rel(12)};
  color: #e4faff;
  margin-top: ${rel(4)};
`

const WordValue = styled.div`
  font-size: ${rel(18)};
  font-weight: bold;
  color: white;
  text-transform: uppercase;
`

const WordDivider = styled.div`
  font-size: ${rel(24)};
  font-weight: bold;
  color: #ffcc00;
  margin: 0 ${rel(10)};
`

const ResultMessage = styled.div`
  font-size: ${rel(22)};
  color: white;
  text-align: center;
  margin-bottom: ${rel(24)};
  animation: ${popIn} 0.8s forwards;
`

// Game over badge with animation
const GameOverBadge = styled.div`
  font-size: ${rel(24)};
  font-weight: bold;
  color: #ffcc00;
  text-align: center;
  margin-top: ${rel(5)};
  margin-bottom: ${rel(15)};
  padding: ${rel(8)} ${rel(16)};
  border-radius: ${rel(12)};
  background: linear-gradient(to right, rgba(92, 45, 145, 0.7), rgba(0, 0, 0, 0.5));
  border: ${rel(2)} solid rgba(255, 204, 0, 0.6);
  animation: ${popIn} 0.9s forwards;
  box-shadow: 0 ${rel(4)} ${rel(8)} rgba(0, 0, 0, 0.4);
`

const NextButton = styled.button`
  background: linear-gradient(to bottom, #6e35ab, #5c2d91);
  color: white;
  font-size: ${rel(18)};
  font-weight: bold;
  padding: ${rel(12)} ${rel(24)};
  border-radius: ${rel(12)};
  border: none;
  margin-top: auto;
  margin-bottom: ${rel(10)};
  cursor: pointer;
  box-shadow: 0 ${rel(4)} ${rel(8)} rgba(0, 0, 0, 0.3);
  transition: transform 0.1s ease-in-out;
  animation: ${popIn} 1s forwards;

  &:active {
    transform: translateY(${rel(2)});
    background: linear-gradient(to bottom, #5c2d91, #4e2678);
  }
`
