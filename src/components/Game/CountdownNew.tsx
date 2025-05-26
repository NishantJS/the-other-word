import { numRounds, turnCountdown } from "../../logic"
import { PieTimer } from "../Timer/PieTimer"
import styled, { keyframes } from "styled-components/macro"
import { rel } from "../../style/rel"
import { useAtomValue } from "jotai"
import {
  $yourPlayer,
  $round,
  $currentTurn,
  $playersInfo,
} from "../../state/$state"
import { useEffect, memo } from "react"
import { sounds } from "../../sounds/sounds"

// Add smooth animations
const popIn = keyframes`
  0% { transform: scale(0.9); opacity: 0; }
  70% { transform: scale(1.05); opacity: 1; }
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

export const CountdownNew = memo(() => {
  const yourPlayer = useAtomValue($yourPlayer)
  const round = useAtomValue($round)
  const currentTurn = useAtomValue($currentTurn)

  useEffect(() => {
    sounds.countdown.play()
  }, [])

  if (!currentTurn) return null

  // Find the current describing player
  const describingPlayerId = currentTurn.currentDescriberId
  const playersInfo = useAtomValue($playersInfo)

  // Get player info
  let describingPlayer = null
  if (describingPlayerId) {
    const playerInfo = playersInfo[describingPlayerId]

    if (playerInfo) {
      describingPlayer = {
        displayName: playerInfo?.displayName || 'Player',
        avatarUrl: playerInfo?.avatarUrl || '/images/default-avatar.svg'
      }
    }
  }

  const isYourTurn = yourPlayer?.describing

  return (
    <Root>
      <RoundLabel>
        Round
        <RoundNumber>{round + 1}/{numRounds}</RoundNumber>
      </RoundLabel>

      <UpNext>
        {isYourTurn ? (
          <YourTurnLabel>Your Turn!</YourTurnLabel>
        ) : describingPlayer ? (
          <PlayerContainer>
            <AvatarWrapper>
              <Avatar src={describingPlayer.avatarUrl} />
            </AvatarWrapper>
            <UpNextLabel>
              {describingPlayer.displayName}
              <NextUpSpan>is up next!</NextUpSpan>
            </UpNextLabel>
          </PlayerContainer>
        ) : null}
      </UpNext>

      <TimerWrapper>
        <PieTimer
          startedAt={currentTurn.timerStartedAt}
          duration={turnCountdown}
        />
      </TimerWrapper>
    </Root>
  )
})

const Root = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  animation: ${fadeInUp} 0.4s ease-out forwards;
`;

const RoundLabel = styled.div`
  font-size: ${rel(42)};
  text-shadow: 0 ${rel(3)} ${rel(6)} rgba(0, 0, 0, 0.4);
  text-transform: uppercase;
  text-align: center;
  letter-spacing: ${rel(1)};
  margin-bottom: ${rel(8)};
  animation: ${popIn} 0.5s ease-out forwards;
`;

const RoundNumber = styled.div`
  font-size: ${rel(64)};
  font-weight: bold;
  color: #ffcc00;
  margin-top: ${rel(4)};
  text-shadow: 0 ${rel(4)} ${rel(8)} rgba(0, 0, 0, 0.5);
  animation: ${pulse} 2s infinite ease-in-out;
`;

const UpNext = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: ${rel(20)} 0 ${rel(30)};
  animation: ${popIn} 0.6s ease-out forwards;
`;

const PlayerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${rel(12)};
`;

const AvatarWrapper = styled.div`
  position: relative;
  border: ${rel(3)} solid #ffffff;
  border-radius: 50%;
  padding: ${rel(2)};
  background: linear-gradient(145deg, rgba(255,255,255,0.1), rgba(0,0,0,0.1));
  box-shadow: 0 ${rel(5)} ${rel(15)} rgba(0, 0, 0, 0.3);
`;

const Avatar = styled.img`
  width: ${rel(100)};
  height: ${rel(100)};
  border-radius: 50%;
  animation: ${pulse} 3s infinite ease-in-out;
`;



const UpNextLabel = styled.div`
  font-size: ${rel(28)};
  font-weight: bold;
  text-shadow: 0 ${rel(2)} ${rel(4)} rgba(0, 0, 0, 0.4);
  text-align: center;
  color: white;
`;

const NextUpSpan = styled.div`
  font-size: ${rel(22)};
  color: #e4faff;
  font-weight: normal;
  margin-top: ${rel(4)};
`;

const YourTurnLabel = styled.div`
  font-size: ${rel(48)};
  font-weight: bold;
  color: #ffcc00;
  text-shadow: 0 ${rel(3)} ${rel(6)} rgba(0, 0, 0, 0.5);
  text-transform: uppercase;
  animation: ${pulse} 1.5s infinite ease-in-out;
`;

const TimerWrapper = styled.div`
  animation: ${popIn} 0.7s ease-out forwards;
  filter: drop-shadow(0 ${rel(4)} ${rel(8)} rgba(0, 0, 0, 0.3));
`;
