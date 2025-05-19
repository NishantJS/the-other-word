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
      <Title>AI & Speech Settings</Title>
      
      <SettingRow>
        <SettingLabel>AI Features</SettingLabel>
        <ToggleButton 
          active={game.useAI}
          onClick={() => Rune.actions.toggleAI()}
        >
          {game.useAI ? 'Enabled' : 'Disabled'}
        </ToggleButton>
      </SettingRow>
      
      <SettingDescription>
        {game.useAI 
          ? 'AI will generate unique descriptions for bots and analyze player descriptions.' 
          : 'Bots will use pre-written descriptions.'}
      </SettingDescription>
      
      <SettingRow>
        <SettingLabel>Speech Features</SettingLabel>
        <ToggleButton 
          active={game.useSpeech}
          onClick={() => Rune.actions.toggleSpeech()}
        >
          {game.useSpeech ? 'Enabled' : 'Disabled'}
        </ToggleButton>
      </SettingRow>
      
      <SettingDescription>
        {game.useSpeech 
          ? 'Bots will speak their descriptions and you can use voice recognition during voting.' 
          : 'No speech synthesis or recognition will be used.'}
      </SettingDescription>
      
      {!game.useSpeech && game.useAI && (
        <WarningMessage>
          Note: AI analysis of descriptions is still available, but speech features are disabled.
        </WarningMessage>
      )}
      
      {game.useSpeech && !game.useAI && (
        <WarningMessage>
          Note: Speech features are enabled, but bots will use pre-written descriptions.
        </WarningMessage>
      )}
      
      <InfoMessage>
        These settings can only be changed before the game starts.
      </InfoMessage>
    </Container>
  )
}

const Container = styled.div`
  background-color: rgba(0, 0, 0, 0.7);
  border-radius: ${rel(16)};
  padding: ${rel(16)};
  margin-top: ${rel(16)};
  max-width: ${rel(400)};
  margin-left: auto;
  margin-right: auto;
`

const Title = styled.h3`
  color: white;
  font-size: ${rel(20)};
  margin-top: 0;
  margin-bottom: ${rel(16)};
  text-align: center;
`

const SettingRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${rel(8)};
`

const SettingLabel = styled.div`
  color: white;
  font-size: ${rel(16)};
  font-weight: bold;
`

const ToggleButton = styled.button<{ active: boolean }>`
  background: ${props => props.active 
    ? 'linear-gradient(180deg, #4CAF50 0%, #388E3C 100%)' 
    : 'linear-gradient(180deg, #F44336 0%, #D32F2F 100%)'};
  border: none;
  border-radius: ${rel(12)};
  padding: ${rel(8)} ${rel(16)};
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s;
  
  &:hover {
    transform: scale(1.05);
  }
  
  &:active {
    transform: scale(0.95);
  }
`

const SettingDescription = styled.div`
  color: #bbbbbb;
  font-size: ${rel(14)};
  margin-bottom: ${rel(16)};
  line-height: 1.4;
`

const WarningMessage = styled.div`
  color: #FFC107;
  font-size: ${rel(14)};
  margin-top: ${rel(8)};
  margin-bottom: ${rel(8)};
  padding: ${rel(8)};
  background-color: rgba(255, 193, 7, 0.1);
  border-radius: ${rel(8)};
  line-height: 1.4;
`

const InfoMessage = styled.div`
  color: #64B5F6;
  font-size: ${rel(14)};
  margin-top: ${rel(16)};
  text-align: center;
  font-style: italic;
`
