import { useAtomValue } from "jotai"
import { $yourPlayer, $currentTurn, $playersInfo } from "../../../state/$state"
import styled from "styled-components/macro"
import { rel } from "../../../style/rel"
import { memo, useEffect, useState } from "react"
import { descriptionDuration } from "../../../logic"
import { LineTimer } from "../../Timer/LineTimer"
import { Reactions } from "./Reactions"
import { EmoteSelector } from "./EmoteSelector"
// Lottie animations removed to clean up the project

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
      {/* Display reactions from other players */}
      <Reactions />

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
      <SpeakingIcon>🎤</SpeakingIcon>
      <div style={{ height: rel(15) }} />

      <SecretWord>{yourPlayer.secretWord}</SecretWord>
      <div style={{ height: rel(30) }} />

      <Instructions>
        <p>Describe this word to other players using voice chat.</p>
        <p>Be careful! One player has a slightly different word.</p>
        <p>You have 15 seconds to describe your word.</p>
        <p>Try to be clear but not too specific with your description.</p>
        <p>Watch for suspicious reactions from other players!</p>
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
  const yourPlayer = useAtomValue($yourPlayer)

  // Find the current describing player
  const describingPlayerId = currentTurn?.currentDescriberId
  const nextDescriberId = currentTurn?.nextDescriberId
  const previousDescriberId = currentTurn?.previousDescriberId
  const completedDescribers = currentTurn?.completedDescribers || []

  const playersInfo = useAtomValue($playersInfo)

  const describingPlayer = describingPlayerId && playersInfo
    ? playersInfo[describingPlayerId]
    : null

  const nextPlayer = nextDescriberId && playersInfo
    ? playersInfo[nextDescriberId]
    : null

  const previousPlayer = previousDescriberId && playersInfo
    ? playersInfo[previousDescriberId]
    : null

  const isNextPlayer = nextDescriberId === yourPlayer?.id

  if (!describingPlayer) return null

  return (
    <Root>
      {/* Display reactions from all players */}
      <Reactions />

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

      {/* Current speaker */}
      <PlayerInfo>
        <CurrentSpeakerBadge>
          <AvatarImg src={describingPlayer.avatarUrl} />
          <PlayerName>{describingPlayer.displayName} is speaking</PlayerName>
          <SpeakingIcon>🎤</SpeakingIcon>
        </CurrentSpeakerBadge>
      </PlayerInfo>

      {/* Next speaker notification - integrated into the speaking order to save space */}
      {isNextPlayer && (
        <NextSpeakerAlert compact>
          <AlertIcon>⚠️</AlertIcon>
          You're next!
        </NextSpeakerAlert>
      )}

      {/* Speaking order visualization */}
      <SpeakingOrderContainer>
        {previousPlayer && (
          <SpeakerItem completed>
            <SmallAvatar src={previousPlayer.avatarUrl} />
            <SmallName>Previous</SmallName>
          </SpeakerItem>
        )}

        <SpeakerItem current>
          <SmallAvatar src={describingPlayer.avatarUrl} />
          <SmallName>Current</SmallName>
        </SpeakerItem>

        {nextPlayer && (
          <SpeakerItem next={isNextPlayer}>
            <SmallAvatar src={nextPlayer.avatarUrl} />
            <SmallName>{isNextPlayer ? "YOU'RE NEXT" : "Next"}</SmallName>
          </SpeakerItem>
        )}
      </SpeakingOrderContainer>

      <Instructions>
        <p>Listen carefully to {describingPlayer.displayName}'s description.</p>
        <p>Try to identify if they have a different word than others.</p>
        <p>After everyone has spoken, you'll vote on who you think is the impostor.</p>
        <p>Use the detective button <span role="img" aria-label="detective">🕵️</span> to show your suspicion!</p>
      </Instructions>

      {/* Emote selector for reactions */}
      <EmoteSelector />
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

const SpeakingIcon = styled.div`
  font-size: ${rel(60)};
  height: ${rel(60)};
  display: flex;
  align-items: center;
  justify-content: center;
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

const CurrentSpeakerBadge = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: rgba(92, 45, 145, 0.6);
  padding: ${rel(15)};
  border-radius: ${rel(15)};
  border: ${rel(2)} solid #8a4dff;
  box-shadow: 0 ${rel(4)} ${rel(8)} rgba(0, 0, 0, 0.3);
`

const NextSpeakerAlert = styled.div<{ compact?: boolean }>`
  display: flex;
  align-items: center;
  background-color: #ff6600; /* Darker orange for better contrast */
  color: #fff;
  font-weight: bold;
  padding: ${props => props.compact ? `${rel(5)} ${rel(10)}` : `${rel(10)} ${rel(15)}`};
  border-radius: ${rel(10)};
  margin: ${props => props.compact ? `${rel(5)} 0` : `${rel(15)} 0`};
  animation: pulse 1.5s infinite;
  box-shadow: 0 ${rel(4)} ${rel(8)} rgba(0, 0, 0, 0.3);
  font-size: ${props => props.compact ? rel(14) : rel(16)};
  max-width: ${rel(200)};
  justify-content: center;
  position: ${props => props.compact ? 'absolute' : 'relative'};
  top: ${props => props.compact ? rel(-15) : 'auto'};
  right: ${props => props.compact ? rel(10) : 'auto'};
  z-index: 10;

  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
`

const AlertIcon = styled.span`
  font-size: ${rel(24)};
  margin-right: ${rel(10)};
`

const SpeakingOrderContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: ${rel(20)} 0;
  width: 100%;
  position: relative;

  &:before {
    content: '';
    position: absolute;
    top: 50%;
    left: 15%;
    right: 15%;
    height: ${rel(2)};
    background-color: rgba(255, 255, 255, 0.3);
    z-index: 0;
  }
`

const SpeakerItem = styled.div<{ current?: boolean; next?: boolean; completed?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 ${rel(10)};
  position: relative;
  z-index: 1;

  ${props => props.current && `
    transform: scale(1.2);
    z-index: 2;
  `}

  ${props => props.next && `
    animation: highlight 1.5s infinite;
    @keyframes highlight {
      0% { transform: scale(1); }
      50% { transform: scale(1.1); }
      100% { transform: scale(1); }
    }
  `}

  ${props => props.completed && `
    opacity: 0.7;
  `}
`

const SmallAvatar = styled.img`
  width: ${rel(40)};
  height: ${rel(40)};
  border-radius: 50%;
  border: ${rel(2)} solid white;
  background-color: #333;
  box-shadow: 0 ${rel(2)} ${rel(4)} rgba(0, 0, 0, 0.3);
`

const SmallName = styled.div`
  font-size: ${rel(12)};
  color: white;
  margin-top: ${rel(5)};
  text-align: center;
  background-color: rgba(0, 0, 0, 0.5);
  padding: ${rel(2)} ${rel(6)};
  border-radius: ${rel(10)};
  white-space: nowrap;
`

// SpeakingIcon is already defined above
