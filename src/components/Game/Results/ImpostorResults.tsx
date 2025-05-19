import { useAtomValue } from "jotai"
import { $currentTurn, $gameOver, $yourPlayerId, $playersInfo, $game, $players } from "../../../state/$state"
import styled, { css } from "styled-components/macro"
import { rel } from "../../../style/rel"
import { memo, useEffect } from "react"
// Lottie animations removed to clean up the project
import { sounds } from "../../../sounds/sounds"

export const ImpostorResults = memo(() => {
  const currentTurn = useAtomValue($currentTurn)
  const gameOver = useAtomValue($gameOver)
  const yourPlayerId = useAtomValue($yourPlayerId)

  // Play sound when results are shown
  useEffect(() => {
    sounds.endOfTurn.play()
  }, [])

  // We've removed the auto-advance functionality to prevent state desync issues
  // Players will need to manually click the continue button

  if (!currentTurn) return null

  // Find the impostor
  const playersInfo = useAtomValue($playersInfo)
  const gamePlayers = useAtomValue($players)
  const gameState = useAtomValue($game)

  const impostorPlayer = Object.entries(playersInfo)
    .map(([id, info]) => ({ id, ...info }))
    .find(player => {
      const gamePlayer = gamePlayers.find(p => p.id === player.id)
      return gamePlayer?.isImpostor
    })

  if (!impostorPlayer) return null

  const isImpostorCaught = currentTurn.impostorCaught
  const isYouImpostor = gamePlayers.find(p => p.id === yourPlayerId)?.isImpostor

  return (
    <Root>

      <Title>
        {isImpostorCaught
          ? "Impostor Caught!"
          : "Impostor Survived!"}
      </Title>

      <ImpostorCard caught={isImpostorCaught}>
        <AvatarImg src={impostorPlayer.avatarUrl} />
        <ImpostorName>
          {impostorPlayer.id === yourPlayerId
            ? "You"
            : impostorPlayer.displayName}
          {impostorPlayer.id === yourPlayerId && " (You)"}
        </ImpostorName>
        <ImpostorLabel>The Impostor</ImpostorLabel>

        <WordsContainer>
          <WordCard>
            <WordLabel>Team Word:</WordLabel>
            <Word>{gameState.currentWord}</Word>
          </WordCard>

          <WordCard>
            <WordLabel>Impostor Word:</WordLabel>
            <Word>{gameState.impostorWord}</Word>
          </WordCard>
        </WordsContainer>
      </ImpostorCard>

      <ResultMessage>
        {isImpostorCaught ? (
          isYouImpostor ? (
            "You were caught! The team figured out you had a different word."
          ) : (
            "Good job! Your team successfully identified the impostor."
          )
        ) : (
          isYouImpostor ? (
            "You survived! No one figured out you had a different word."
          ) : (
            "The impostor tricked everyone and survived this round!"
          )
        )}
      </ResultMessage>

      {gameOver ? (
        <>
          <GameOverMessage>
            {isImpostorCaught ? (
              isYouImpostor ? (
                "Game Over - The team wins!"
              ) : (
                "Game Over - Your team wins!"
              )
            ) : (
              isYouImpostor ? (
                "Game Over - You win!"
              ) : (
                "Game Over - The impostor wins!"
              )
            )}
          </GameOverMessage>
          <ContinueButton onClick={() => Rune.showGameOverPopUp()}>
            Show Final Scores
          </ContinueButton>
        </>
      ) : (
        <ContinueButton onClick={() => Rune.actions?.nextRound?.()}>
          Continue to Next Round
        </ContinueButton>
      )}
    </Root>
  )
})

const Root = styled.div`
  animation: fadeIn 300ms ease-out forwards;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${rel(20)};
  height: 100%;
  position: relative;
`

const Title = styled.div`
  font-size: ${rel(36)};
  font-weight: bold;
  color: white;
  margin-bottom: ${rel(24)};
  text-align: center;
  text-shadow: 0 ${rel(3)} 0 rgba(0, 0, 0, 0.35);
`

const ImpostorCard = styled.div<{ caught: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: ${({ caught }) => caught ? 'rgba(233, 54, 67, 0.3)' : 'rgba(91, 182, 0, 0.3)'};
  border: ${rel(2)} solid ${({ caught }) => caught ? '#e93643' : '#5bb600'};
  border-radius: ${rel(16)};
  padding: ${rel(20)};
  margin-bottom: ${rel(24)};
  width: 90%;
  max-width: ${rel(350)};
`

const AvatarImg = styled.img`
  width: ${rel(80)};
  height: ${rel(80)};
  border-radius: 50%;
  border: ${rel(3)} solid white;
  margin-bottom: ${rel(12)};
`

const ImpostorName = styled.div`
  font-size: ${rel(24)};
  font-weight: bold;
  color: white;
  margin-bottom: ${rel(4)};
`

const ImpostorLabel = styled.div`
  font-size: ${rel(18)};
  color: #e4faff;
  margin-bottom: ${rel(16)};
`

const WordsContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: ${rel(12)};
`

const WordCard = styled.div`
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: ${rel(8)};
  padding: ${rel(12)};
`

const WordLabel = styled.div`
  font-size: ${rel(14)};
  color: #e4faff;
  margin-bottom: ${rel(4)};
`

const Word = styled.div`
  font-size: ${rel(20)};
  font-weight: bold;
  color: white;
  text-transform: uppercase;
`

const ResultMessage = styled.div`
  font-size: ${rel(18)};
  color: white;
  text-align: center;
  margin-bottom: ${rel(24)};
  max-width: ${rel(350)};
`

const GameOverMessage = styled.div`
  font-size: ${rel(24)};
  font-weight: bold;
  color: #ffcc00;
  text-align: center;
  margin-top: ${rel(16)};
`

const ContinueButton = styled.button`
  background: #5c2d91;
  color: white;
  font-size: ${rel(20)};
  padding: ${rel(12)} ${rel(24)};
  border-radius: ${rel(12)};
  border: none;
  margin-top: ${rel(16)};
  cursor: pointer;

  &:active {
    transform: translateY(${rel(2)});
  }
`

// Confetti animation removed
