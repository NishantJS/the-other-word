import { useAtomValue } from "jotai"
import { $players, $yourPlayer, $game } from "../../state/$state"
import { useMemo, memo, useState, useEffect } from "react"
import styled from "styled-components/macro"

import logo from "./new-logo.svg"
import { rel } from "../../style/rel"
import { PlayerLeavingNotification } from "../Game/PlayerLeavingNotification"


export const Start = memo(() => {
  const players = useAtomValue($players)
  const yourPlayer = useAtomValue($yourPlayer)
  const game = useAtomValue($game)
  const [showHowToPlay, setShowHowToPlay] = useState(false)

  const numReady = useMemo(
    () => players.filter((p) => p.readyToStart).length,
    [players]
  )

  const minPlayers = 3
  const maxPlayers = 6
  const hasEnoughPlayers = players.length >= minPlayers
  const canStart = hasEnoughPlayers && numReady === players.length

  return (
    <Root>
      <PlayerLeavingNotification />

      <LogoContainer>
        <LogoImg src={logo} />
        <GameTitle>THE OTHER WORD</GameTitle>
      </LogoContainer>

      <ContentContainer>
        <PlayerCounter>
          <PlayerCountValue hasEnoughPlayers={hasEnoughPlayers}>
            {players.length}/{maxPlayers}
          </PlayerCountValue>
          <PlayerCountLabel>
            {hasEnoughPlayers ?
              `${numReady}/${players.length} Players Ready` :
              `Need ${minPlayers - players.length} more players`
            }
          </PlayerCountLabel>
        </PlayerCounter>

        <OptionsContainer>
          <HowToPlayButton onClick={() => setShowHowToPlay(true)}>
            ❓ How to Play
          </HowToPlayButton>
        </OptionsContainer>

        <ReadyButton
          disabled={(yourPlayer && yourPlayer.readyToStart) || !hasEnoughPlayers}
          onClick={() => Rune.actions.setReadyToStart()}
        >
          {!hasEnoughPlayers ?
            `Need ${minPlayers - players.length} more players` :
            (yourPlayer && yourPlayer.readyToStart ? "Waiting for others..." : "I'm Ready")
          }
        </ReadyButton>
      </ContentContainer>

      {/* How to Play Modal */}
      {showHowToPlay && (
        <ModalOverlay onClick={() => setShowHowToPlay(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>🎭 How to Play</ModalTitle>
              <CloseButton onClick={() => setShowHowToPlay(false)}>✕</CloseButton>
            </ModalHeader>
            <ModalBody>
              <GameSection>
                <SectionTitle>🎯 Objective</SectionTitle>
                <SectionText>
                  Find the impostor! One player gets a slightly different word and must blend in while others try to identify them.
                </SectionText>
              </GameSection>

              <GameSection>
                <SectionTitle>🎮 How It Works</SectionTitle>
                <StepList>
                  <StepItem>
                    <StepNumber>1</StepNumber>
                    <StepText>Each player receives a secret word</StepText>
                  </StepItem>
                  <StepItem>
                    <StepNumber>2</StepNumber>
                    <StepText>One player (the impostor) gets a similar but different word</StepText>
                  </StepItem>
                  <StepItem>
                    <StepNumber>3</StepNumber>
                    <StepText>Players take turns describing their word (15 seconds each)</StepText>
                  </StepItem>
                  <StepItem>
                    <StepNumber>4</StepNumber>
                    <StepText>After all descriptions, vote for who you think is the impostor</StepText>
                  </StepItem>
                  <StepItem>
                    <StepNumber>5</StepNumber>
                    <StepText>Earn points for correct guesses and successful deception!</StepText>
                  </StepItem>
                </StepList>
              </GameSection>

              <GameSection>
                <SectionTitle>💡 Tips</SectionTitle>
                <TipList>
                  <TipItem>• Be descriptive but not too specific</TipItem>
                  <TipItem>• Listen carefully to other players</TipItem>
                  <TipItem>• If you're the impostor, try to blend in!</TipItem>
                  <TipItem>• Use the reaction emotes during descriptions</TipItem>
                </TipList>
              </GameSection>
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      )}
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
  background: transparent;
  position: relative;
  height: 100%;

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

const PlayerCountValue = styled.div<{ hasEnoughPlayers?: boolean }>`
  font-size: ${rel(36)};
  font-weight: bold;
  color: ${props => props.hasEnoughPlayers ? 'white' : '#ffab91'};
  text-shadow: 0 ${rel(2)} ${rel(4)} rgba(0, 0, 0, 0.3);
  transition: color 0.3s ease;
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

const HowToPlayButton = styled.button`
  width: 100%;
  background: rgba(255, 255, 255, 0.15);
  border: none;
  border-radius: ${rel(8)};
  color: white;
  font-size: ${rel(16)};
  font-weight: 500;
  padding: ${rel(12)} ${rel(16)};
  text-align: center;
  cursor: pointer;
  backdrop-filter: blur(5px);
  box-shadow: 0 ${rel(2)} ${rel(8)} rgba(0, 0, 0, 0.2);
  transition: all 150ms ease-out;

  &:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: translateY(${rel(-1)});
  }

  &:active {
    transform: translateY(0);
  }
`

// Modal Components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: ${rel(20)};
  backdrop-filter: blur(${rel(4)});
`

const ModalContent = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: ${rel(16)};
  max-width: ${rel(500)};
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 ${rel(20)} ${rel(40)} rgba(0, 0, 0, 0.3);
  border: ${rel(1)} solid rgba(255, 255, 255, 0.2);
`

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${rel(20)} ${rel(24)};
  border-bottom: ${rel(1)} solid rgba(255, 255, 255, 0.2);
`

const ModalTitle = styled.h2`
  font-size: ${rel(24)};
  font-weight: bold;
  color: white;
  margin: 0;
`

const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: ${rel(32)};
  height: ${rel(32)};
  color: white;
  font-size: ${rel(18)};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 150ms ease-out;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`

const ModalBody = styled.div`
  padding: ${rel(24)};
`

const GameSection = styled.div`
  margin-bottom: ${rel(24)};

  &:last-child {
    margin-bottom: 0;
  }
`

const SectionTitle = styled.h3`
  font-size: ${rel(18)};
  font-weight: 600;
  color: white;
  margin: 0 0 ${rel(12)} 0;
`

const SectionText = styled.p`
  font-size: ${rel(14)};
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.5;
  margin: 0;
`

const StepList = styled.ol`
  margin: 0;
  padding: 0;
  list-style: none;
`

const StepItem = styled.li`
  display: flex;
  align-items: flex-start;
  margin-bottom: ${rel(12)};

  &:last-child {
    margin-bottom: 0;
  }
`

const StepNumber = styled.div`
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  width: ${rel(24)};
  height: ${rel(24)};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${rel(12)};
  font-weight: 600;
  color: white;
  margin-right: ${rel(12)};
  flex-shrink: 0;
`

const StepText = styled.div`
  font-size: ${rel(14)};
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.4;
  padding-top: ${rel(2)};
`

const TipList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
`

const TipItem = styled.li`
  font-size: ${rel(14)};
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.4;
  margin-bottom: ${rel(8)};

  &:last-child {
    margin-bottom: 0;
  }
`



export const ReadyButton = styled.button<{ disabled?: boolean }>`
  width: 85%;
  max-width: ${rel(336)};
  background: ${props => props.disabled ?
    'linear-gradient(135deg, #666666 0%, #555555 100%)' :
    'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)'};
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
    `0 ${rel(4)} ${rel(12)} rgba(255, 107, 107, 0.4)`};
  transition: all 150ms ease-out;
  text-transform: uppercase;
  letter-spacing: ${rel(1)};

  &:hover {
    background: ${props => props.disabled ?
      'linear-gradient(135deg, #666666 0%, #555555 100%)' :
      'linear-gradient(135deg, #ff8a80 0%, #ff7043 100%)'};
    transform: ${props => props.disabled ? 'none' : `translateY(${rel(-2)})`};
    box-shadow: ${props => props.disabled ?
      'none' :
      `0 ${rel(6)} ${rel(16)} rgba(255, 107, 107, 0.6)`};
  }

  &:active {
    transform: ${props => props.disabled ? 'none' : `translateY(${rel(1)})`};
    box-shadow: ${props => props.disabled ?
      'none' :
      `0 ${rel(2)} ${rel(4)} rgba(0, 0, 0, 0.3)`};
  }
`
