import { useAtomValue } from "jotai"
import { $yourPlayer, $currentTurn, $playersInfo } from "../../../state/$state"
import styled from "styled-components/macro"
import { rel } from "../../../style/rel"
import { Player } from "@lottiefiles/react-lottie-player"
import { memo, useEffect, useState } from "react"
import { descriptionDuration } from "../../../logic"
import { LineTimer } from "../../Timer/LineTimer"
import speakingAnimation from "../lottie/speaking.json"

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

  useEffect(() => {
    const interval = setInterval(() => {
      const newTimeLeft = Math.max(0, Math.ceil(duration - (Rune.gameTime() / 1000 - startedAt)))
      setTimeLeft(newTimeLeft)

      if (newTimeLeft <= 0) {
        clearInterval(interval)
        if (onTimeUp) {
          onTimeUp()
        }
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [startedAt, duration, onTimeUp])

  return <span>{timeLeft}s</span>
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
      <TimerContainer>
        <LineTimer
          startedAt={currentTurn?.timerStartedAt || 0}
          duration={descriptionDuration}
          actor={true}
          almostOverAt={3}
        />
      </TimerContainer>

      <Label>Describe this word!</Label>
      <RemainingTime>
        Time remaining: <CountdownTimer
          startedAt={currentTurn?.timerStartedAt || 0}
          duration={descriptionDuration}
          onTimeUp={handleTimeUp}
        />
      </RemainingTime>
      <div style={{ height: rel(15) }} />
      <SpeakingHead autoplay loop src={speakingAnimation} />
      <div style={{ height: rel(15) }} />

      <SecretWord>{yourPlayer.secretWord}</SecretWord>
      <div style={{ height: rel(30) }} />

      <Instructions>
        <p>Describe this word to other players using voice chat.</p>
        <p>Be careful! One player has a slightly different word.</p>
        <p>You have 15 seconds to describe your word.</p>
        <p>Try to be clear but not too specific with your description.</p>
      </Instructions>

      <div style={{ height: rel(30) }} />
      <FinishButton onClick={() => Rune.actions?.finishDescribing?.()}>
        I'm Done
      </FinishButton>
    </Root>
  )
})

// Component shown to players who are not currently describing
const SpectatingView = memo(() => {
  const currentTurn = useAtomValue($currentTurn)

  // Find the current describing player
  const describingPlayerId = currentTurn?.currentDescriberId
  const playersInfo = useAtomValue($playersInfo)
  const describingPlayer = describingPlayerId && playersInfo
    ? playersInfo[describingPlayerId]
    : null

  if (!describingPlayer) return null

  return (
    <Root>
      <TimerContainer>
        <LineTimer
          startedAt={currentTurn?.timerStartedAt || 0}
          duration={descriptionDuration}
          actor={false}
          almostOverAt={3}
        />
      </TimerContainer>

      <Label>Listen carefully!</Label>
      <RemainingTime>
        Time remaining: <CountdownTimer startedAt={currentTurn?.timerStartedAt || 0} duration={descriptionDuration} />
      </RemainingTime>
      <div style={{ height: rel(15) }} />

      <PlayerInfo>
        <AvatarImg src={describingPlayer.avatarUrl} />
        <PlayerName>{describingPlayer.displayName} is describing</PlayerName>
      </PlayerInfo>

      <div style={{ height: rel(30) }} />

      <Instructions>
        <p>Listen carefully to {describingPlayer.displayName}'s description.</p>
        <p>Try to identify if they have a different word than others.</p>
        <p>Each player has 15 seconds to describe their word.</p>
        <p>After everyone has spoken, you'll vote on who you think is the impostor.</p>
      </Instructions>
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

const TimerContainer = styled.div`
  position: absolute;
  top: ${rel(24)};
  width: 100%;
`

const Label = styled.div`
  font-size: ${rel(28)};
  text-shadow: 0 ${rel(3)} 0 rgba(0, 0, 0, 0.35);
  text-align: center;
`

const SpeakingHead = styled(Player)`
  height: ${rel(60)};
`

const SecretWord = styled.div`
  font-size: ${rel(36)};
  font-weight: bold;
  color: #fff;
  background-color: #5c2d91;
  padding: ${rel(15)} ${rel(30)};
  border-radius: ${rel(12)};
  box-shadow: 0 ${rel(4)} 0 rgba(0, 0, 0, 0.25);
  text-transform: uppercase;
`

const Instructions = styled.div`
  font-size: ${rel(18)};
  text-align: center;
  color: #e4faff;
  max-width: ${rel(300)};

  p {
    margin: ${rel(8)} 0;
  }
`

const FinishButton = styled.button`
  background: #5bb600;
  color: white;
  font-size: ${rel(24)};
  padding: ${rel(12)} ${rel(24)};
  border-radius: ${rel(12)};
  border: none;
  box-shadow: 0 ${rel(4)} 0 rgba(0, 0, 0, 0.25);
  cursor: pointer;

  &:active {
    transform: translateY(${rel(2)});
    box-shadow: 0 ${rel(2)} 0 rgba(0, 0, 0, 0.25);
  }
`

const PlayerInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: ${rel(20)} 0;
`

const AvatarImg = styled.img`
  width: ${rel(80)};
  height: ${rel(80)};
  border-radius: 50%;
  border: ${rel(3)} solid white;
  margin-bottom: ${rel(10)};
`

const PlayerName = styled.div`
  font-size: ${rel(22)};
  color: white;
  text-align: center;
`

const RemainingTime = styled.div`
  font-size: ${rel(18)};
  color: #ffcc00;
  margin-top: ${rel(8)};
  margin-bottom: ${rel(8)};
  font-weight: bold;

  span {
    color: #ff9900;
  }
`
