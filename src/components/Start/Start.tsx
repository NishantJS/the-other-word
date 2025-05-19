import { useAtomValue } from "jotai"
import { $players, $yourPlayer, $game } from "../../state/$state"
import { useMemo, memo } from "react"
import styled from "styled-components/macro"

import logo from "./new-logo.svg"
import { rel } from "../../style/rel"
import { AISettings } from "../Settings/AISettings"

export const Start = memo(() => {
  const players = useAtomValue($players)
  const yourPlayer = useAtomValue($yourPlayer)
  const game = useAtomValue($game)

  const numReady = useMemo(
    () => players.filter((p) => p.readyToStart).length,
    [players]
  )

  // Count real players (non-bots)
  const realPlayerCount = useMemo(
    () => players.filter(p => !p.isBot).length,
    [players]
  )

  // Determine if we should show bot toggle
  const showBotToggle = realPlayerCount < 6 && realPlayerCount >= 3

  // Determine if we should show bot info message
  const showBotInfo = realPlayerCount < 3

  return (
    <Root>
      <LogoImg src={logo} />
      <ReadyLabel>
        {numReady}/{players.length} Players Ready
      </ReadyLabel>

      {/* Bot information for fewer than 3 players */}
      {showBotInfo && (
        <BotInfoMessage>
          Not enough players! Bots will be added to reach the minimum of 3 players.
        </BotInfoMessage>
      )}

      {/* Bot toggle button for 3-5 players */}
      {showBotToggle && (
        <BotToggleButton onClick={() => Rune.actions.toggleBots()}>
          <div>
            {game.useBots ? "Disable Bots" : "Enable Bots"}
          </div>
        </BotToggleButton>
      )}

      {/* Bot status indicator */}
      {game.useBots && (
        <BotStatusIndicator>
          Bots: Enabled ({game.botCount} will be added)
        </BotStatusIndicator>
      )}

      {/* Add the AISettings component */}
      <AISettings />

      <ReadyButton
        style={{ opacity: yourPlayer && !yourPlayer.readyToStart ? 1 : 0 }}
        onClick={() => Rune.actions.setReadyToStart()}
      >
        <div>I'm Ready</div>
      </ReadyButton>
    </Root>
  )
})

const Root = styled.div`
  animation: fadeIn 300ms ease-out forwards;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  padding: 5vh 0;
  background: radial-gradient(
    62.56% 62.56% at 50% 44.09%,
    #9c27b0 0%,
    #4a148c 81.77%,
    #311b92 100%
  );
`

const LogoImg = styled.img`
  width: ${rel(231)};
`

const ReadyLabel = styled.div`
  font-size: ${rel(28)};
  text-shadow: 0 ${rel(3)} 0 rgba(0, 0, 0, 0.5);
  text-align: center;
  color: white;
  font-weight: bold;
  background-color: rgba(0, 0, 0, 0.2);
  padding: ${rel(10)} ${rel(20)};
  border-radius: ${rel(12)};
  margin: ${rel(15)} 0;
`

export const ReadyButton = styled.div`
  width: ${rel(336)};
  transition: opacity 150ms ease-out;

  background: linear-gradient(180deg, #7b1fa2 0%, #9c27b0 100%);
  border-radius: ${rel(24)};
  padding: ${rel(8)};
  box-shadow: 0 ${rel(4)} ${rel(8)} rgba(0, 0, 0, 0.3);
  margin-top: ${rel(10)};

  > div {
    background: white;
    border-radius: ${rel(24 - 8)};
    font-size: ${rel(24)};
    color: #4a148c;
    font-weight: bold;
    padding: ${rel(32 - 8)};
    text-align: center;
  }

  &:hover {
    background: linear-gradient(180deg, #9c27b0 0%, #7b1fa2 100%);
  }

  &:active {
    transform: translateY(${rel(2)});
    box-shadow: 0 ${rel(2)} ${rel(4)} rgba(0, 0, 0, 0.3);
  }
`

const BotToggleButton = styled.div`
  width: ${rel(250)};
  transition: opacity 150ms ease-out;
  margin: ${rel(10)} 0;

  background: linear-gradient(180deg, #4a148c 0%, #311b92 100%);
  border-radius: ${rel(20)};
  padding: ${rel(6)};
  box-shadow: 0 ${rel(4)} ${rel(8)} rgba(0, 0, 0, 0.3);

  > div {
    background: white;
    border-radius: ${rel(20 - 6)};
    font-size: ${rel(18)};
    color: #4a148c;
    font-weight: bold;
    padding: ${rel(16)};
    text-align: center;
  }

  &:hover {
    background: linear-gradient(180deg, #311b92 0%, #4a148c 100%);
  }

  &:active {
    transform: translateY(${rel(2)});
    box-shadow: 0 ${rel(2)} ${rel(4)} rgba(0, 0, 0, 0.3);
  }
`

const BotInfoMessage = styled.div`
  font-size: ${rel(18)};
  text-shadow: 0 ${rel(2)} 0 rgba(0, 0, 0, 0.5);
  text-align: center;
  color: #ffeb3b;
  font-weight: bold;
  background-color: rgba(0, 0, 0, 0.3);
  padding: ${rel(12)} ${rel(16)};
  border-radius: ${rel(12)};
  margin: ${rel(10)} 0;
  max-width: ${rel(300)};
`

const BotStatusIndicator = styled.div`
  font-size: ${rel(16)};
  text-shadow: 0 ${rel(1)} 0 rgba(0, 0, 0, 0.5);
  text-align: center;
  color: #8bc34a;
  font-weight: bold;
  background-color: rgba(0, 0, 0, 0.2);
  padding: ${rel(8)} ${rel(12)};
  border-radius: ${rel(12)};
  margin: ${rel(8)} 0;
`

const FeatureToggleButton = styled.div`
  width: ${rel(200)};
  transition: opacity 150ms ease-out;
  margin: ${rel(6)} 0;

  background: linear-gradient(180deg, #311b92 0%, #4a148c 100%);
  border-radius: ${rel(16)};
  padding: ${rel(4)};
  box-shadow: 0 ${rel(4)} ${rel(8)} rgba(0, 0, 0, 0.3);

  > div {
    background: white;
    border-radius: ${rel(16 - 4)};
    font-size: ${rel(16)};
    color: #4a148c;
    font-weight: bold;
    padding: ${rel(12)};
    text-align: center;
  }

  &:hover {
    background: linear-gradient(180deg, #4a148c 0%, #311b92 100%);
  }

  &:active {
    transform: translateY(${rel(2)});
    box-shadow: 0 ${rel(2)} ${rel(4)} rgba(0, 0, 0, 0.3);
  }
`

const FeatureStatusContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: ${rel(12)};
  margin: ${rel(8)} 0;
`

const FeatureStatus = styled.div<{ enabled: boolean }>`
  font-size: ${rel(14)};
  text-shadow: 0 ${rel(1)} 0 rgba(0, 0, 0, 0.5);
  text-align: center;
  color: ${props => props.enabled ? '#8bc34a' : '#ff9800'};
  font-weight: bold;
  background-color: rgba(0, 0, 0, 0.2);
  padding: ${rel(4)} ${rel(8)};
  border-radius: ${rel(10)};
`
