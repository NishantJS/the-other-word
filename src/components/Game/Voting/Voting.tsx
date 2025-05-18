import { useAtomValue } from "jotai"
import { $yourPlayer, $currentTurn, $round, $playersInfo } from "../../../state/$state"
import styled, { css } from "styled-components/macro"
import { rel } from "../../../style/rel"
import { memo, useState, useEffect } from "react"
import { votingDuration } from "../../../logic"
import { LineTimer } from "../../Timer/LineTimer"
import { sounds } from "../../../sounds/sounds"

// Countdown timer component to show remaining time
const CountdownTimer = memo(({ startedAt, duration }: { startedAt: number, duration: number }) => {
  const [timeLeft, setTimeLeft] = useState(Math.max(0, Math.ceil(duration - (Rune.gameTime() / 1000 - startedAt))))

  useEffect(() => {
    const interval = setInterval(() => {
      const newTimeLeft = Math.max(0, Math.ceil(duration - (Rune.gameTime() / 1000 - startedAt)))
      setTimeLeft(newTimeLeft)

      if (newTimeLeft <= 0) {
        clearInterval(interval)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [startedAt, duration])

  return <span>{timeLeft}s</span>
})

export const Voting = memo(() => {
  const yourPlayer = useAtomValue($yourPlayer)
  const currentTurn = useAtomValue($currentTurn)
  const round = useAtomValue($round)
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null)
  const [hasVoted, setHasVoted] = useState(false)

  // Reset selection when round changes
  useEffect(() => {
    setSelectedPlayerId(null)
    setHasVoted(false)
  }, [round])

  // Check if player has already voted
  useEffect(() => {
    if (yourPlayer?.voted) {
      setHasVoted(true)
    }
  }, [yourPlayer])

  const handleVote = () => {
    if (!selectedPlayerId || hasVoted) return

    // Submit vote
    Rune.actions?.submitVote?.({
      suspectId: selectedPlayerId,
      round
    })

    // Play sound
    sounds.guessButton.play()

    // Update local state
    setHasVoted(true)
  }

  // Get all players except yourself
  const playersInfo = useAtomValue($playersInfo)
  const otherPlayers = Object.entries(playersInfo)
    .filter(([id]) => id !== yourPlayer?.id)
    .map(([id, info]) => ({
      id,
      ...info
    }))

  return (
    <Root>
      <TimerContainer>
        <LineTimer
          startedAt={currentTurn?.timerStartedAt || 0}
          duration={votingDuration}
          actor={false}
          almostOverAt={3}
        />
      </TimerContainer>

      <Title>Who is the Impostor?</Title>
      <Subtitle>Vote for the player who you think had a different word</Subtitle>
      <RemainingTime>
        Time remaining: <CountdownTimer startedAt={currentTurn?.timerStartedAt || 0} duration={votingDuration} />
      </RemainingTime>

      <PlayerList>
        {otherPlayers.map((player) => (
          <PlayerItem
            key={player.id}
            selected={selectedPlayerId === player.id}
            disabled={hasVoted}
            onClick={() => {
              if (!hasVoted) {
                setSelectedPlayerId(player.id)
                sounds.guessButton.play()
              }
            }}
          >
            <AvatarImg src={player.avatarUrl} />
            <PlayerName>{player.displayName}</PlayerName>
          </PlayerItem>
        ))}
      </PlayerList>

      <VoteButton
        disabled={!selectedPlayerId || hasVoted}
        onClick={handleVote}
      >
        {hasVoted ? "Vote Submitted" : "Submit Vote"}
      </VoteButton>

      {hasVoted && (
        <WaitingText>
          Waiting for other players to vote...
        </WaitingText>
      )}
    </Root>
  )
})

const Root = styled.div`
  animation: fadeIn 300ms ease-out forwards;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${rel(20)};
  height: 100%;
  position: relative;
`

const TimerContainer = styled.div`
  position: absolute;
  top: ${rel(24)};
  width: 100%;
`

const Title = styled.div`
  font-size: ${rel(32)};
  font-weight: bold;
  color: white;
  margin-top: ${rel(60)};
  text-shadow: 0 ${rel(3)} 0 rgba(0, 0, 0, 0.35);
`

const Subtitle = styled.div`
  font-size: ${rel(18)};
  color: #e4faff;
  margin-top: ${rel(8)};
  margin-bottom: ${rel(24)};
`

const PlayerList = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: ${rel(350)};
  margin-bottom: ${rel(24)};
  overflow-y: auto;
  max-height: ${rel(300)};
`

const PlayerItem = styled.div<{ selected: boolean; disabled: boolean }>`
  display: flex;
  align-items: center;
  padding: ${rel(12)};
  margin-bottom: ${rel(8)};
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: ${rel(12)};
  cursor: ${({ disabled }) => (disabled ? "default" : "pointer")};
  transition: all 0.2s ease;

  ${({ selected }) => selected && css`
    background-color: rgba(92, 45, 145, 0.8);
    transform: scale(1.02);
  `}

  ${({ disabled }) => disabled && css`
    opacity: 0.7;
  `}

  &:hover {
    ${({ disabled }) => !disabled && css`
      background-color: rgba(255, 255, 255, 0.2);
    `}
  }
`

const AvatarImg = styled.img`
  width: ${rel(40)};
  height: ${rel(40)};
  border-radius: 50%;
  margin-right: ${rel(12)};
`

const PlayerName = styled.div`
  font-size: ${rel(18)};
  color: white;
`

const VoteButton = styled.button<{ disabled: boolean }>`
  background: ${({ disabled }) => (disabled ? "#666" : "#e93643")};
  color: white;
  font-size: ${rel(20)};
  padding: ${rel(12)} ${rel(24)};
  border-radius: ${rel(12)};
  border: none;
  margin-top: ${rel(16)};
  cursor: ${({ disabled }) => (disabled ? "default" : "pointer")};
  opacity: ${({ disabled }) => (disabled ? 0.7 : 1)};
  transition: all 0.2s ease;

  &:active {
    ${({ disabled }) => !disabled && css`
      transform: translateY(${rel(2)});
    `}
  }
`

const WaitingText = styled.div`
  font-size: ${rel(16)};
  color: #e4faff;
  margin-top: ${rel(16)};
  font-style: italic;
`

const RemainingTime = styled.div`
  font-size: ${rel(18)};
  color: #ffcc00;
  margin-bottom: ${rel(16)};
  font-weight: bold;

  span {
    color: #ff9900;
  }
`
