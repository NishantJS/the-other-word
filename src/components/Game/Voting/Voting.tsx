import { useAtomValue } from "jotai"
import { $yourPlayer, $currentTurn, $round, $playersInfo, $game } from "../../../state/$state"
import styled, { css, keyframes } from "styled-components/macro"
import { rel } from "../../../style/rel"
import { memo, useState, useEffect, useRef } from "react"
import { votingDuration } from "../../../logic"
import { LineTimer } from "../../Timer/LineTimer"
import { sounds } from "../../../sounds/sounds"
import { SpeechRecognition } from "../SpeechRecognition/SpeechRecognition"

// Enhanced animations
const bounceIn = keyframes`
  0% { transform: scale(0.9); opacity: 0; }
  50% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
`

const selectPulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.03); }
  100% { transform: scale(1); }
`

const progressBar = keyframes`
  0% { width: 0%; }
  100% { width: 100%; }
`

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

export const Voting = memo(() => {
  const yourPlayer = useAtomValue($yourPlayer)
  const currentTurn = useAtomValue($currentTurn)
  const round = useAtomValue($round);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null)
  const [hasVoted, setHasVoted] = useState(false)
  const [autoVoted, setAutoVoted] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(votingDuration)
  const [showConfidenceBoost, setShowConfidenceBoost] = useState(false)
  const [selectionConfirmed, setSelectionConfirmed] = useState(false)

  // Use a ref to store the currently selected player ID
  // This will be accessible even when the component is about to unmount
  const selectedPlayerIdRef = useRef<string | null>(null)

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

  // Update the ref whenever selectedPlayerId changes
  useEffect(() => {
    selectedPlayerIdRef.current = selectedPlayerId;
  }, [selectedPlayerId]);

  // Monitor the timer and auto-submit vote when time is about to expire
  useEffect(() => {
    if (!currentTurn) return;

    const interval = setInterval(() => {
      const currentTime = Rune.gameTime() / 1000;
      const elapsed = currentTime - (currentTurn.timerStartedAt || 0);
      const remaining = Math.max(0, votingDuration - elapsed);

      setTimeRemaining(remaining);

      // Auto-submit vote 1 second before timer expires if player has selected but not voted
      if (remaining <= 1 && selectedPlayerIdRef.current && !hasVoted) {
        try {
          // Auto-submit the currently selected player
          Rune.actions?.submitVote?.({
            suspectId: selectedPlayerIdRef.current,
            round
          });

          // Play sound
          sounds.guessButton.play();

          // Update local state
          setHasVoted(true);
          setAutoVoted(true);

          console.log("Time's almost up! Your vote was automatically submitted.");
        } catch (error) {
          console.error("Failed to auto-submit vote:", error);
        }

        clearInterval(interval);
      }
    }, 100); // Check more frequently

    return () => clearInterval(interval);
  }, [currentTurn, hasVoted, round]);

  // Final safety check - submit vote when component is about to unmount if not voted yet
  useEffect(() => {
    return () => {
      if (currentTurn?.stage === "voting" && selectedPlayerIdRef.current && !hasVoted) {
        try {
          // Last chance to submit the vote before unmounting
          Rune.actions?.submitVote?.({
            suspectId: selectedPlayerIdRef.current,
            round
          });
          console.log("Component unmounting - final vote submission");
        } catch (error) {
          console.error("Failed to submit vote on unmount:", error);
        }
      }
    };
  }, [currentTurn, hasVoted, round]);
  const handleVote = () => {
    if (!selectedPlayerId || hasVoted) return

    // Submit vote
    Rune.actions?.submitVote?.({
      suspectId: selectedPlayerId,
      round
    })

    // Enhanced feedback
    sounds.guessButton.play()
    setHasVoted(true)
    setSelectionConfirmed(true)
    setShowConfidenceBoost(true)
    
    // Show confidence boost animation
    setTimeout(() => setShowConfidenceBoost(false), 2000)
  }

  // Handle timer expiration - auto-submit the current selection
  const handleTimeUp = () => {
    if (selectedPlayerIdRef.current && !hasVoted) {
      try {
        // Auto-submit the currently selected player
        Rune.actions?.submitVote?.({
          suspectId: selectedPlayerIdRef.current,
          round
        });

        // Play sound
        sounds.guessButton.play();

        // Update local state
        setHasVoted(true);
        setAutoVoted(true);

        // Show a notification that the vote was automatically submitted
        console.log("Time's up! Your vote was automatically submitted.");
      } catch (error) {
        console.error("Failed to auto-submit vote in handleTimeUp:", error);
      }
    }
  }

  // Get all players except yourself
  const playersInfo = useAtomValue($playersInfo)
  const game = useAtomValue($game)
  const otherPlayers = Object.entries(playersInfo)
    .filter(([id]) => id !== yourPlayer?.id)
    .map(([id, info]) => {
      // Find if this player is a bot
      const playerData = game.players.find(p => p.id === id)
      const isBot = playerData?.isBot || false
      const botInfo = isBot ? game.bots.find(b => b.id === id) : null

      return {
        id,
        // Use info if available, otherwise use bot info
        displayName: info?.displayName || botInfo?.name || 'Player',
        avatarUrl: info?.avatarUrl || botInfo?.avatarUrl || '/images/bots/default.svg',
        // Add speaking order information
        speakingOrder: currentTurn?.descriptionOrder.indexOf(id) ?? -1,
        hasSpoken: currentTurn?.completedDescribers?.includes(id) ?? false,
        isBot
      }
    })

  // Sort players by speaking order to help with voting
  otherPlayers.sort((a, b) => a.speakingOrder - b.speakingOrder)

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
        Time remaining: <CountdownTimer
          startedAt={currentTurn?.timerStartedAt || 0}
          duration={votingDuration}
          onTimeUp={handleTimeUp}
        />
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
            <PlayerInfo>
              <PlayerNameRow>
                <PlayerName>{player.displayName}</PlayerName>
                {player.isBot && <BotIndicator>🤖 Bot</BotIndicator>}
              </PlayerNameRow>
              <SpeakingInfo>
                <SpeakingOrder>Speaker #{player.speakingOrder + 1}</SpeakingOrder>
                {player.hasSpoken && <SpeakingStatus>✓ Has spoken</SpeakingStatus>}
              </SpeakingInfo>
            </PlayerInfo>
          </PlayerItem>
        ))}
      </PlayerList>      {!hasVoted && (
        <>
          <VoteButton
            disabled={!selectedPlayerId}
            onClick={handleVote}
            confirmed={selectionConfirmed}
          >
            {selectedPlayerId ? '🔒 Lock in Vote' : '👆 Select a Player'}
          </VoteButton>
          
          {showConfidenceBoost && (
            <ConfidenceBoost>
              🎯 Good choice! Trust your instincts!
            </ConfidenceBoost>
          )}
        </>
      )}

      {hasVoted && (
        <>
          <LockedVoteMessage>
            Your vote for <strong>
              {(() => {
                // Find the player's display name
                const playerInfo = playersInfo[selectedPlayerId || ""]
                const playerData = game.players.find(p => p.id === selectedPlayerId)
                const isBot = playerData?.isBot || false
                const botInfo = isBot ? game.bots.find(b => b.id === selectedPlayerId) : null

                return playerInfo?.displayName || botInfo?.name || 'Player'
              })()}
            </strong> is locked in
            {autoVoted && <AutoVoteText>(Auto-submitted as time expired)</AutoVoteText>}
          </LockedVoteMessage>
          <WaitingText>
            Waiting for other players to vote...
          </WaitingText>
        </>
      )}

      {/* Add speech recognition component */}
      <SpeechRecognition />
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
  
  /* Hide scrollbar while keeping scroll functionality */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* Internet Explorer 10+ */
  
  &::-webkit-scrollbar {
    display: none; /* Safari and Chrome */
  }
`

const PlayerItem = styled.div<{ selected: boolean; disabled: boolean }>`
  display: flex;
  align-items: center;
  padding: ${rel(12)};
  margin-bottom: ${rel(8)};
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: ${rel(12)};
  cursor: ${({ disabled }) => (disabled ? "default" : "pointer")};
  transition: all 0.2s ease;

  ${({ selected }) => selected && css`
    background-color: rgba(123, 31, 162, 0.9);
    transform: scale(1.02);
    box-shadow: 0 ${rel(4)} ${rel(8)} rgba(0, 0, 0, 0.3);
  `}

  ${({ disabled }) => disabled && css`
    opacity: 0.7;
  `}

  &:hover {
    ${({ disabled }) => !disabled && css`
      background-color: rgba(255, 255, 255, 0.25);
      box-shadow: 0 ${rel(2)} ${rel(4)} rgba(0, 0, 0, 0.2);
    `}
  }
`

const AvatarImg = styled.img`
  width: ${rel(40)};
  height: ${rel(40)};
  border-radius: 50%;
  margin-right: ${rel(12)};
`

const PlayerInfo = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`

const PlayerNameRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${rel(4)};
`

const PlayerName = styled.div`
  font-size: ${rel(18)};
  color: white;
`

const BotIndicator = styled.div`
  font-size: ${rel(12)};
  color: #00bcd4;
  background-color: rgba(0, 0, 0, 0.3);
  padding: ${rel(2)} ${rel(6)};
  border-radius: ${rel(10)};
  margin-left: ${rel(8)};
  display: flex;
  align-items: center;
`

const SpeakingInfo = styled.div`
  display: flex;
  align-items: center;
`

const SpeakingOrder = styled.div`
  font-size: ${rel(12)};
  color: #ffcc00;
  background-color: rgba(0, 0, 0, 0.3);
  padding: ${rel(2)} ${rel(6)};
  border-radius: ${rel(10)};
  margin-right: ${rel(8)};
`

const SpeakingStatus = styled.div`
  font-size: ${rel(12)};
  color: #5bb600;
  display: flex;
  align-items: center;
`

const VoteButton = styled.button<{ disabled: boolean; confirmed?: boolean }>`
  background: ${({ disabled, confirmed }) => 
    disabled ? "#666" : 
    confirmed ? "#4caf50" : "#d32f2f"
  };
  color: white;
  font-size: ${rel(20)};
  padding: ${rel(12)} ${rel(24)};
  border-radius: ${rel(12)};
  border: none;
  margin-top: ${rel(16)};
  cursor: ${({ disabled }) => (disabled ? "default" : "pointer")};
  opacity: ${({ disabled }) => (disabled ? 0.7 : 1)};
  transition: all 0.3s ease;
  box-shadow: 0 ${rel(4)} ${rel(8)} rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;
  animation: ${({ confirmed }) => confirmed ? css`${bounceIn} 0.6s ease-out` : 'none'};

  &:hover {
    ${({ disabled }) => !disabled && css`
      background: #f44336;
      transform: translateY(-${rel(2)});
      box-shadow: 0 ${rel(6)} ${rel(12)} rgba(0, 0, 0, 0.4);
    `}
  }

  &:active {
    ${({ disabled }) => !disabled && css`
      transform: translateY(${rel(1)});
      box-shadow: 0 ${rel(2)} ${rel(6)} rgba(0, 0, 0, 0.3);
    `}
  }
  
  &:not(:disabled) {
    animation: ${selectPulse} 2s infinite ease-in-out;
  }
`

const WaitingText = styled.div`
  font-size: ${rel(16)};
  color: #e4faff;
  margin-top: ${rel(8)};
  font-style: italic;
`

const LockedVoteMessage = styled.div`
  font-size: ${rel(18)};
  color: #5bb600;
  margin-top: ${rel(16)};
  font-weight: bold;
  text-align: center;

  strong {
    color: #7dd700;
  }
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

const AutoVoteText = styled.div`
  font-size: ${rel(14)};
  color: #ffcc00;
  margin-top: ${rel(4)};
  font-style: italic;
`

const ConfidenceBoost = styled.div`
  position: absolute;
  bottom: ${rel(100)};
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #4caf50, #8bc34a);
  color: white;
  font-size: ${rel(16)};
  font-weight: bold;
  padding: ${rel(8)} ${rel(16)};
  border-radius: ${rel(20)};
  animation: ${bounceIn} 0.6s ease-out;
  box-shadow: 0 ${rel(4)} ${rel(12)} rgba(76, 175, 80, 0.4);
  z-index: 100;
`
