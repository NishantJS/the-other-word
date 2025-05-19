import { numRounds, turnCountdown } from "../../logic"
import { PieTimer } from "../Timer/PieTimer"
import styled from "styled-components/macro"
import { rel } from "../../style/rel"
import { useAtomValue } from "jotai"
import {
  $yourPlayer,
  $round,
  $currentTurn,
  $playersInfo,
  $game,
} from "../../state/$state"
import { useEffect, memo } from "react"
import { sounds } from "../../sounds/sounds"

export const Countdown = memo(() => {
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
  const gameState = useAtomValue($game)

  // Get player info, checking for both human and bot players
  let describingPlayer = null
  if (describingPlayerId) {
    // Check if this is a human player with info
    const playerInfo = playersInfo[describingPlayerId]

    // Check if this is a bot player
    const gamePlayer = gameState.players.find(p => p.id === describingPlayerId)
    const isBot = gamePlayer?.isBot || false
    const botInfo = isBot ? gameState.bots.find(b => b.id === describingPlayerId) : null

    if (playerInfo || botInfo) {
      describingPlayer = {
        displayName: playerInfo?.displayName || botInfo?.name || 'Player',
        avatarUrl: playerInfo?.avatarUrl || botInfo?.avatarUrl || '/images/bots/default.svg',
        isBot: isBot
      }
    }
  }

  const isYourTurn = yourPlayer?.describing

  return (
    <Root>
      <RoundLabel>
        Round
        <br />
        {round + 1}/{numRounds}
      </RoundLabel>
      <UpNext>
        {isYourTurn ? (
          <UpNextLabel>You’re up next!</UpNextLabel>
        ) : describingPlayer ? (
          <>
            <Avatar src={describingPlayer.avatarUrl} />
            <UpNextLabel>
              {describingPlayer.displayName}
              <br />
              is up next!
            </UpNextLabel>
          </>
        ) : null}
      </UpNext>
      <PieTimer
        startedAt={currentTurn.timerStartedAt}
        duration={turnCountdown}
      />
    </Root>
  )
})

const Root = styled.div`
  animation: fadeIn 300ms ease-out forwards;
  display: flex;
  flex-direction: column;
  align-items: center;
`

const RoundLabel = styled.div`
  font-size: ${rel(64)};
  text-shadow: 0 ${rel(3)} 0 rgba(0, 0, 0, 0.35);
  text-transform: uppercase;
  text-align: center;
`

const UpNext = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  > :not(:first-child) {
    margin-top: ${rel(12)};
  }
  margin: ${rel(24)} 0;
`

const UpNextLabel = styled.div`
  font-size: ${rel(28)};
  text-shadow: 0 ${rel(3)} 0 rgba(0, 0, 0, 0.35);
  text-align: center;
`

const Avatar = styled.img`
  width: ${rel(94)};
  height: ${rel(94)};
`
