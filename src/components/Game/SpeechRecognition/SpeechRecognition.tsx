import React, { useState, useEffect } from 'react'
import styled from 'styled-components/macro'
import { useAtomValue } from 'jotai'
import { $game, $yourPlayer, $currentTurn } from '../../../state/$state'
import { rel } from '../../../style/rel'
import { initSpeechRecognition, startSpeechRecognition, stopSpeechRecognition, analyzeForImpostor } from '../../../lib/ai'

export const SpeechRecognition: React.FC = () => {
  const game = useAtomValue($game)
  const yourPlayer = useAtomValue($yourPlayer)
  const currentTurn = useAtomValue($currentTurn)

  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isSupported, setIsSupported] = useState(true)

  // Check if speech recognition is supported
  useEffect(() => {
    const supported = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
    setIsSupported(supported)
  }, [])

  // Don't show the component if speech is not enabled or not supported
  if (!game.useSpeech || !isSupported) {
    return null
  }

  // Only show during voting stage
  if (!currentTurn || currentTurn.stage !== 'voting') {
    return null
  }

  // Don't show if player has already voted
  if (yourPlayer?.voted) {
    return null
  }

  const handleStartListening = () => {
    setIsListening(true)
    setTranscript('')

    startSpeechRecognition((text) => {
      setTranscript(text)
      setIsListening(false)

      // We're not using AI to avoid network requests
      // Instead, we'll just display the transcript
    })
  }

  const handleStopListening = () => {
    setIsListening(false)
    stopSpeechRecognition()
  }

  return (
    <Container>
      <Title>Voice Analysis</Title>

      {isListening ? (
        <ListeningContainer>
          <ListeningIndicator>Listening...</ListeningIndicator>
          <StopButton onClick={handleStopListening}>Stop</StopButton>
        </ListeningContainer>
      ) : (
        <StartButton onClick={handleStartListening}>
          <MicIcon>🎤</MicIcon>
          <ButtonText>Speak to analyze</ButtonText>
        </StartButton>
      )}

      {transcript && (
        <TranscriptContainer>
          <TranscriptLabel>You said:</TranscriptLabel>
          <Transcript>{transcript}</Transcript>
        </TranscriptContainer>
      )}

      {/* AI analysis removed to avoid network requests */}
    </Container>
  )
}

const Container = styled.div`
  background-color: rgba(0, 0, 0, 0.7);
  border-radius: ${rel(16)};
  padding: ${rel(16)};
  margin-top: ${rel(16)};
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: ${rel(400)};
  margin-left: auto;
  margin-right: auto;
`

const Title = styled.h3`
  color: white;
  font-size: ${rel(20)};
  margin-top: 0;
  margin-bottom: ${rel(16)};
`

const StartButton = styled.button`
  background: linear-gradient(180deg, #7b1fa2 0%, #9c27b0 100%);
  border: none;
  border-radius: ${rel(24)};
  padding: ${rel(12)} ${rel(24)};
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
`

const MicIcon = styled.span`
  font-size: ${rel(24)};
  margin-right: ${rel(8)};
`

const ButtonText = styled.span`
  color: white;
  font-size: ${rel(16)};
  font-weight: bold;
`

const ListeningContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`

const ListeningIndicator = styled.div`
  color: #ff5722;
  font-size: ${rel(18)};
  margin-bottom: ${rel(12)};
  animation: pulse 1.5s infinite;

  @keyframes pulse {
    0% { opacity: 0.5; }
    50% { opacity: 1; }
    100% { opacity: 0.5; }
  }
`

const StopButton = styled.button`
  background-color: #f44336;
  border: none;
  border-radius: ${rel(16)};
  padding: ${rel(8)} ${rel(16)};
  color: white;
  font-weight: bold;
  cursor: pointer;
`

const TranscriptContainer = styled.div`
  margin-top: ${rel(16)};
  width: 100%;
`

const TranscriptLabel = styled.div`
  color: #bbbbbb;
  font-size: ${rel(14)};
  margin-bottom: ${rel(4)};
`

const Transcript = styled.div`
  color: white;
  font-size: ${rel(16)};
  background-color: rgba(0, 0, 0, 0.3);
  padding: ${rel(8)};
  border-radius: ${rel(8)};
`

const AnalysisContainer = styled.div`
  margin-top: ${rel(16)};
  width: 100%;
  background-color: rgba(0, 0, 0, 0.3);
  padding: ${rel(12)};
  border-radius: ${rel(8)};
`

const AnalysisLabel = styled.div`
  color: #bbbbbb;
  font-size: ${rel(14)};
  margin-bottom: ${rel(4)};
`

const Rating = styled.div`
  color: white;
  font-size: ${rel(16)};
  font-weight: bold;
  margin-bottom: ${rel(8)};
`

const RatingValue = styled.span<{ rating: number }>`
  color: ${props => {
    if (props.rating <= 3) return '#4caf50';
    if (props.rating <= 7) return '#ff9800';
    return '#f44336';
  }};
`

const Explanation = styled.div`
  color: white;
  font-size: ${rel(14)};
  line-height: 1.4;
`
