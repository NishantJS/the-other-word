import React from 'react'
import styled from 'styled-components/macro'
import { useAtomValue } from 'jotai'
import { $game } from '../../state/$state'
import { rel } from '../../style/rel'

export const AISettings: React.FC = () => {
  const game = useAtomValue($game)
  
  // Don't show settings during gameplay
  if (game.gameStarted) {
    return null
  }
  
  return (
    <Container>
      <SettingsHeader>
        <SettingsIcon>⚙️</SettingsIcon>
        <SettingsTitle>Game Settings</SettingsTitle>
      </SettingsHeader>
      
      <SettingCard>
        <SettingLabelContainer>
          <SettingLabel>AI Features</SettingLabel>
          <FeatureIcon>{game.useAI ? "🧠" : "📝"}</FeatureIcon>
        </SettingLabelContainer>
        <ToggleSwitch 
          active={game.useAI}
          onClick={() => Rune.actions.toggleAI()}
        >
          <ToggleSwitchTrack active={game.useAI}>
            <ToggleSwitchThumb active={game.useAI} />
          </ToggleSwitchTrack>
          <ToggleSwitchLabel>{game.useAI ? 'On' : 'Off'}</ToggleSwitchLabel>
        </ToggleSwitch>
      </SettingCard>
      
      <SettingDescription>
        {game.useAI 
          ? 'AI will generate unique descriptions for bots and analyze player descriptions.' 
          : 'Bots will use pre-written descriptions.'}
      </SettingDescription>
      
      <SettingCard>
        <SettingLabelContainer>
          <SettingLabel>Speech Features</SettingLabel>
          <FeatureIcon>{game.useSpeech ? "🔊" : "🔇"}</FeatureIcon>
        </SettingLabelContainer>
        <ToggleSwitch 
          active={game.useSpeech}
          onClick={() => Rune.actions.toggleSpeech()}
        >
          <ToggleSwitchTrack active={game.useSpeech}>
            <ToggleSwitchThumb active={game.useSpeech} />
          </ToggleSwitchTrack>
          <ToggleSwitchLabel>{game.useSpeech ? 'On' : 'Off'}</ToggleSwitchLabel>
        </ToggleSwitch>
      </SettingCard>
      
      <SettingDescription>
        {game.useSpeech 
          ? 'Bots will speak their descriptions and you can use voice recognition during voting.' 
          : 'No speech synthesis or recognition will be used.'}
      </SettingDescription>
      
      {!game.useSpeech && game.useAI && (
        <InfoNote warning>
          AI analysis is available, but speech features are disabled.
        </InfoNote>
      )}
      
      {game.useSpeech && !game.useAI && (
        <InfoNote warning>
          Speech features are enabled, but bots will use pre-written descriptions.
        </InfoNote>
      )}
      
      <InfoNote info>
        Settings can only be changed before the game starts.
      </InfoNote>
    </Container>
  )
}

const Container = styled.div`
  width: 100%;
  padding: ${rel(16)};
  margin-top: ${rel(8)};
  display: flex;
  flex-direction: column;
  gap: ${rel(12)};
  background-color: rgba(0, 0, 0, 0.15);
  border-radius: ${rel(12)};
  backdrop-filter: blur(10px);
  box-shadow: 0 ${rel(4)} ${rel(12)} rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
`

const SettingsHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${rel(12)};
  padding-bottom: ${rel(8)};
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`

const SettingsIcon = styled.span`
  font-size: ${rel(18)};
  margin-right: ${rel(8)};
`

const SettingsTitle = styled.h3`
  color: white;
  font-size: ${rel(18)};
  font-weight: 500;
  margin: 0;
`

const SettingCard = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.08);
  padding: ${rel(12)} ${rel(16)};
  border-radius: ${rel(8)};
  backdrop-filter: blur(5px);
  box-shadow: 0 ${rel(2)} ${rel(6)} rgba(0, 0, 0, 0.15);
  transition: background-color 150ms ease;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.12);
  }
`

const SettingLabelContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${rel(8)};
`

const SettingLabel = styled.div`
  color: white;
  font-size: ${rel(16)};
  font-weight: 500;
`

const FeatureIcon = styled.span`
  font-size: ${rel(16)};
`

const ToggleSwitch = styled.div<{ active: boolean }>`
  display: flex;
  align-items: center;
  cursor: pointer;
`

const ToggleSwitchTrack = styled.div<{ active: boolean }>`
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

const SettingDescription = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: ${rel(12)};
  line-height: 1.4;
  margin: ${rel(-4)} 0 ${rel(8)} ${rel(4)};
`

const InfoNote = styled.div<{ warning?: boolean; info?: boolean }>`
  font-size: ${rel(12)};
  color: ${props => props.warning 
    ? 'rgba(255, 193, 7, 0.9)'
    : props.info 
      ? 'rgba(33, 150, 243, 0.9)' 
      : 'rgba(255, 255, 255, 0.7)'};
  background-color: ${props => props.warning 
    ? 'rgba(255, 193, 7, 0.1)' 
    : props.info 
      ? 'rgba(33, 150, 243, 0.1)' 
      : 'transparent'};
  padding: ${props => props.warning || props.info ? `${rel(8)} ${rel(12)}` : '0'};
  border-radius: ${rel(6)};
  line-height: 1.4;
  text-align: ${props => props.info ? 'center' : 'left'};
  font-style: ${props => props.info ? 'italic' : 'normal'};
`
