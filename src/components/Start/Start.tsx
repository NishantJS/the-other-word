import { useAtomValue } from "jotai"
import { $players, $yourPlayer, $game } from "../../state/$state"
import { useMemo, memo, useState } from "react"
import styled from "styled-components/macro"

import logo from "./new-logo.svg"
import { rel } from "../../style/rel"
import { AISettings } from "../Settings/AISettings"

export const Start = memo(() => {
  const players = useAtomValue($players)
  const yourPlayer = useAtomValue($yourPlayer)
  const game = useAtomValue($game)
  const [showSettings, setShowSettings] = useState(false)

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
      <LogoContainer>
        <LogoImg src={logo} />
        <GameTitle>THE OTHER WORD</GameTitle>
      </LogoContainer>
      
      <ContentContainer>
        <PlayerCounter>
          <PlayerCountValue>{numReady}/{players.length}</PlayerCountValue>
          <PlayerCountLabel>Players Ready</PlayerCountLabel>
        </PlayerCounter>

        <OptionsContainer>
          {/* Bot information for fewer than 3 players */}
          {showBotInfo && (
            <InfoCard warning>
              <InfoText>Not enough players. Bots will be added automatically.</InfoText>
            </InfoCard>
          )}

          {/* Bot toggle button for 3-5 players */}
          {showBotToggle && (
            <ToggleContainer>
              <ToggleLabel>Bots</ToggleLabel>              <ToggleSwitch 
                active={game.useBots}
                onClick={() => Rune.actions.toggleBots()}
              >
                <ToggleSwitchTrack active={game.useBots}>
                  <ToggleSwitchThumb active={game.useBots} />
                </ToggleSwitchTrack>
                <ToggleSwitchLabel>{game.useBots ? "On" : "Off"}</ToggleSwitchLabel>
              </ToggleSwitch>
            </ToggleContainer>
          )}

          {/* Bot status indicator */}
          {game.useBots && (
            <InfoCard success>
              <InfoText>{game.botCount} bot{game.botCount > 1 ? 's' : ''} will join the game</InfoText>
            </InfoCard>
          )}

          <SettingsButton onClick={() => setShowSettings(!showSettings)}>
            {showSettings ? "Hide Settings" : "Game Settings"}
          </SettingsButton>
          
          {showSettings && <AISettings />}
        </OptionsContainer>

        <ReadyButton
          disabled={yourPlayer && yourPlayer.readyToStart}
          onClick={() => Rune.actions.setReadyToStart()}
        >
          {yourPlayer && yourPlayer.readyToStart ? "Waiting for others..." : "I'm Ready"}
        </ReadyButton>
      </ContentContainer>
    </Root>
  )
})

const Root = styled.div`
  animation: fadeIn 300ms ease-out forwards;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 4vh 0;
  background: linear-gradient(180deg, #5f3dc4 0%, #462297 50%, #311b92 100%);
  position: relative;
  height: 100%;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 40%),
                radial-gradient(circle at 75% 75%, rgba(255,255,255,0.05) 0%, transparent 40%);
    pointer-events: none;
    z-index: 0;
  }
  
  > * {
    position: relative;
    z-index: 1;
  }
`

const LogoContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: ${rel(30)};
`

const LogoImg = styled.img`
  width: ${rel(180)};
  filter: drop-shadow(0 ${rel(4)} ${rel(6)} rgba(0, 0, 0, 0.2));
`

const GameTitle = styled.h1`
  font-size: ${rel(36)};
  font-weight: bold;
  color: white;
  margin: ${rel(10)} 0 0;
  letter-spacing: ${rel(2)};
  text-align: center;
`

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 90%;
  max-width: ${rel(400)};
`

const PlayerCounter = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: ${rel(30)};
`

const PlayerCountValue = styled.div`
  font-size: ${rel(36)};
  font-weight: bold;
  color: white;
  text-shadow: 0 ${rel(2)} ${rel(4)} rgba(0, 0, 0, 0.3);
`

const PlayerCountLabel = styled.div`
  font-size: ${rel(18)};
  color: rgba(255, 255, 255, 0.8);
  margin-top: ${rel(5)};
`

const OptionsContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: ${rel(16)};
  margin-bottom: ${rel(40)};
`

const InfoCard = styled.div<{ warning?: boolean; success?: boolean }>`
  font-size: ${rel(16)};
  text-align: center;
  color: ${props => props.warning ? '#212121' : 'white'};
  background-color: ${props => 
    props.warning ? 'rgba(255, 193, 7, 0.9)' : 
    props.success ? 'rgba(76, 175, 80, 0.8)' : 
    'rgba(255, 255, 255, 0.15)'};
  padding: ${rel(12)} ${rel(16)};
  border-radius: ${rel(8)};
  width: 100%;
  backdrop-filter: blur(5px);
  box-shadow: 0 ${rel(2)} ${rel(8)} rgba(0, 0, 0, 0.2);
`

const InfoText = styled.div`
  font-size: ${rel(14)};
  line-height: 1.4;
`

const ToggleContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  background-color: rgba(255, 255, 255, 0.15);
  padding: ${rel(12)} ${rel(16)};
  border-radius: ${rel(8)};
  backdrop-filter: blur(5px);
  box-shadow: 0 ${rel(2)} ${rel(8)} rgba(0, 0, 0, 0.2);
`

const ToggleLabel = styled.div`
  font-size: ${rel(16)};
  color: white;
  font-weight: 500;
`

const ToggleSwitch = styled.div<{ active: boolean }>`
  display: flex;
  align-items: center;
  cursor: pointer;
`

const ToggleSwitchTrack = styled.div<{ active?: boolean }>`
  width: ${rel(42)};
  height: ${rel(22)};
  background-color: ${props => props.active ? 'rgba(76, 175, 80, 0.6)' : 'rgba(255, 255, 255, 0.3)'};
  border-radius: ${rel(11)};
  position: relative;
  transition: background-color 150ms ease-out;
`

const ToggleSwitchThumb = styled.div<{ active: boolean }>`
  width: ${rel(18)};
  height: ${rel(18)};
  background-color: white;
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: ${props => props.active ? `calc(100% - ${rel(20)})` : `${rel(2)}`};
  transform: translateY(-50%);
  transition: left 150ms ease-out;
  box-shadow: 0 ${rel(1)} ${rel(3)} rgba(0, 0, 0, 0.2);
`

const ToggleSwitchLabel = styled.div`
  font-size: ${rel(14)};
  color: white;
  margin-left: ${rel(8)};
`

const SettingsButton = styled.button`
  font-size: ${rel(16)};
  color: white;
  background-color: rgba(255, 255, 255, 0.15);
  padding: ${rel(12)} ${rel(16)};
  border: none;
  border-radius: ${rel(8)};
  cursor: pointer;
  text-align: center;
  width: 100%;
  font-weight: 500;
  backdrop-filter: blur(5px);
  box-shadow: 0 ${rel(2)} ${rel(8)} rgba(0, 0, 0, 0.2);
  transition: background-color 150ms ease-out;

  &:hover {
    background-color: rgba(255, 255, 255, 0.25);
  }
  
  &:active {
    transform: translateY(${rel(1)});
    box-shadow: 0 ${rel(1)} ${rel(4)} rgba(0, 0, 0, 0.2);
  }
`

export const ReadyButton = styled.button<{ disabled?: boolean }>`
  width: 85%;
  max-width: ${rel(336)};
  background: ${props => props.disabled ? 
    'linear-gradient(180deg, #5e35b1 0%, #4527a0 100%)' : 
    'linear-gradient(180deg, #8e24aa 0%, #6a1b9a 100%)'};
  border: none;
  border-radius: ${rel(12)};
  color: white;
  font-size: ${rel(20)};
  font-weight: 600;
  padding: ${rel(16)} ${rel(24)};
  text-align: center;
  cursor: ${props => props.disabled ? 'default' : 'pointer'};
  opacity: ${props => props.disabled ? 0.7 : 1};
  box-shadow: ${props => props.disabled ? 
    'none' : 
    `0 ${rel(4)} ${rel(12)} rgba(0, 0, 0, 0.3)`};
  transition: all 150ms ease-out;
  text-transform: uppercase;
  letter-spacing: ${rel(1)};

  &:hover {
    background: ${props => props.disabled ? 
      'linear-gradient(180deg, #5e35b1 0%, #4527a0 100%)' : 
      'linear-gradient(180deg, #9c27b0 0%, #7b1fa2 100%)'};
    transform: ${props => props.disabled ? 'none' : `translateY(${rel(-2)})`};
  }

  &:active {
    transform: ${props => props.disabled ? 'none' : `translateY(${rel(1)})`};
    box-shadow: ${props => props.disabled ? 
      'none' : 
      `0 ${rel(2)} ${rel(4)} rgba(0, 0, 0, 0.3)`};
  }
`
