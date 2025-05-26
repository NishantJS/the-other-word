import { useAtomValue } from "jotai"
import { $yourPlayer, $currentTurn, $playersInfo, $game } from "../../../state/$state"
import styled, { css, keyframes } from "styled-components/macro"
import { rel } from "../../../style/rel"
import { memo, useEffect, useState } from "react"
import { descriptionDuration } from "../../../logic"
import { Reactions } from "./Reactions"
import { EmoteSelector } from "./EmoteSelector"

// Animation keyframes for components
const fadeIn = keyframes`
  0% { opacity: 0; transform: translateY(${rel(10)}); }
  100% { opacity: 1; transform: translateY(0); }
`;

const popIn = keyframes`
  0% { transform: scale(0.9); opacity: 0; }
  70% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

export const Describing = memo(() => {
  const yourPlayer = useAtomValue($yourPlayer)
  const currentTurn = useAtomValue($currentTurn)

  // If player is not describing, show a spectating view
  if (!yourPlayer?.describing) {
    return <SpectatingView />
  }

  // If player is describing, show their secret word
  return (
    <Root>
      {/* Reactions from other players */}
      <Reactions />
      
      {/* Main content area with instructions */}
      <ContentArea>
        <SecretWord>{yourPlayer.secretWord}</SecretWord>
        
        <CompactInstructions>
          <Instruction>Describe this word clearly</Instruction>
          <Instruction>Don't be too specific!</Instruction>
        </CompactInstructions>
        
        <FinishButton onClick={() => Rune.actions?.finishDescribing?.()}>
          I'm Done
        </FinishButton>
      </ContentArea>
      
      {/* Emote selector for reactions */}
      <EmoteSelector />
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
  const playersInfo = useAtomValue($playersInfo)
  const game = useAtomValue($game)

  // Get player info and check if they are bots
  let describingPlayer = null
  if (describingPlayerId) {
    const playerInfo = playersInfo[describingPlayerId]
    const gamePlayer = game.players.find(p => p.id === describingPlayerId)
    const isBot = gamePlayer?.isBot || false
    const botInfo = isBot ? game.bots.find(b => b.id === describingPlayerId) : null

    describingPlayer = {
      displayName: playerInfo?.displayName || botInfo?.name || 'Player',
      avatarUrl: playerInfo?.avatarUrl || botInfo?.avatarUrl || '/images/bots/default.svg',
      isBot: isBot
    }
  }

  const isImpostor = yourPlayer?.isImpostor
  const isNextPlayer = nextDescriberId === yourPlayer?.id

  if (!describingPlayer) return null
  return (
    <Root>
      {/* Show status indicators in corner - NO IMPOSTOR REVEAL */}
      {isNextPlayer && (
        <NextPlayerAlert>
          <AlertIcon>👁️</AlertIcon>
          You're next!
        </NextPlayerAlert>
      )}
      
      {/* Simplified speaker info */}<SpeakerDisplay>
        <AvatarImg src={describingPlayer.avatarUrl} />
        <PlayerName>
          {describingPlayer.displayName}
          <SpeakerStatus>is speaking</SpeakerStatus>
        </PlayerName>
        {describingPlayer.isBot && <BotBadge>🤖</BotBadge>}
      </SpeakerDisplay>
        {/* Concise instructions */}
      <CompactInstructions>
        <Instruction>Listen carefully for inconsistencies</Instruction>
        <Instruction>Can you identify the impostor?</Instruction>
      </CompactInstructions>
      
      {/* Emote selector for reactions */}
      <EmoteSelector />
    </Root>
  )
})

const Root = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${rel(8)} ${rel(12)};
  height: 100%;
  position: relative;
  overflow: hidden;
`

const WordChip = styled.div`
  position: absolute;
  top: ${rel(8)};
  right: ${rel(8)};
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  background: rgba(0, 0, 0, 0.4);
  border-radius: ${rel(8)};
  padding: ${rel(6)} ${rel(10)};
  z-index: 5;
  box-shadow: 0 ${rel(2)} ${rel(4)} rgba(0, 0, 0, 0.2);
  animation: ${fadeIn} 0.3s ease-out;
`

const WordLabel = styled.div`
  font-size: ${rel(10)};
  color: #e4faff;
  margin-bottom: ${rel(2)};
`

const WordValue = styled.div`
  font-size: ${rel(14)};
  font-weight: bold;
  color: white;
  text-transform: uppercase;
`

const ContentArea = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  width: 100%;
  margin: ${rel(40)} 0 ${rel(20)};
  gap: ${rel(20)};
`

const SecretWord = styled.div`
  font-size: ${rel(42)};
  font-weight: bold;
  color: #fff;
  background: linear-gradient(135deg, #7931c7, #5c2d91, #9c27b0);
  background-size: 200% 200%;
  animation: ${popIn} 0.5s ease-out, gradient-shift 3s ease-in-out infinite;
  padding: ${rel(16)} ${rel(32)};
  border-radius: ${rel(16)};
  box-shadow: 0 ${rel(8)} ${rel(24)} rgba(121, 49, 199, 0.4);
  text-transform: uppercase;
  text-align: center;
  margin-top: ${rel(40)};
  border: ${rel(2)} solid rgba(255, 255, 255, 0.3);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    animation: shine 2s infinite;
  }

  @keyframes gradient-shift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  
  @keyframes shine {
    0% { left: -100%; }
    100% { left: 100%; }
  }
`

const CompactInstructions = styled.div`
  display: flex;
  flex-direction: column;
  text-align: center;
  gap: ${rel(6)};
  color: #e4faff;
  max-width: ${rel(280)};
  margin: ${rel(10)} 0;
`

const Instruction = styled.p`
  margin: 0;
  font-size: ${rel(16)};
  line-height: 1.3;
`

const FinishButton = styled.button`
  background: linear-gradient(145deg, #4caf50, #45a049, #3d8b40);
  background-size: 200% 200%;
  color: white;
  font-size: ${rel(24)};
  font-weight: bold;
  padding: ${rel(14)} ${rel(28)};
  border-radius: ${rel(16)};
  border: none;
  box-shadow: 0 ${rel(6)} ${rel(16)} rgba(76, 175, 80, 0.4);
  cursor: pointer;
  margin-top: ${rel(24)};
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  text-transform: uppercase;
  letter-spacing: ${rel(1)};

  &:hover {
    transform: translateY(-${rel(2)});
    box-shadow: 0 ${rel(8)} ${rel(20)} rgba(76, 175, 80, 0.6);
    background-position: 100% 100%;
  }

  &:active {
    transform: translateY(${rel(1)});
    box-shadow: 0 ${rel(4)} ${rel(12)} rgba(76, 175, 80, 0.4);
  }
  
  &::before {
    content: '✓';
    position: absolute;
    left: ${rel(12)};
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover::before {
    opacity: 1;
  }
`

const NextPlayerAlert = styled.div`
  position: absolute;
  top: ${rel(40)};
  right: ${rel(10)};
  display: flex;
  align-items: center;
  background-color: rgba(255, 102, 0, 0.9);
  color: white;
  font-weight: bold;
  padding: ${rel(6)} ${rel(12)};
  border-radius: ${rel(20)};
  font-size: ${rel(14)};
  z-index: 5;
  gap: ${rel(6)};
  animation: ${pulse} 1.5s infinite;
  box-shadow: 0 ${rel(2)} ${rel(6)} rgba(0, 0, 0, 0.3);
`

const AlertIcon = styled.span`
  font-size: ${rel(14)};
`

const SpeakerDisplay = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: ${rel(60)};
  animation: ${fadeIn} 0.5s ease-out;
`

const AvatarImg = styled.img`
  width: ${rel(80)};
  height: ${rel(80)};
  border-radius: 50%;
  border: ${rel(3)} solid white;
  box-shadow: 0 ${rel(4)} ${rel(8)} rgba(0, 0, 0, 0.3);
  margin-bottom: ${rel(8)};
`

const PlayerName = styled.div`
  font-size: ${rel(20)};
  color: white;
  text-align: center;
  font-weight: bold;
`

const SpeakerStatus = styled.div`
  font-size: ${rel(16)};
  color: #e4faff;
  font-weight: normal;
  margin-top: ${rel(4)};
`

const BotBadge = styled.div`
  font-size: ${rel(14)};
  color: #00bcd4;
  background-color: rgba(0, 0, 0, 0.3);
  padding: ${rel(2)} ${rel(8)};
  border-radius: ${rel(10)};
  margin-top: ${rel(5)};
  display: flex;
  align-items: center;
`

const PlayerOrderRow = styled.div`
  display: flex;
  gap: ${rel(12)};
  margin-top: ${rel(20)};
  flex-wrap: wrap;
  justify-content: center;
  max-width: 100%;
  padding: 0 ${rel(10)};
`

const NextPlayerChip = styled.div<{ isNext?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${rel(8)};
  background: ${props => props.isNext ? 'rgba(255, 102, 0, 0.7)' : 'rgba(0, 0, 0, 0.3)'};
  border-radius: ${rel(16)};
  padding: ${rel(4)} ${rel(10)};
  animation: ${props => props.isNext ? css`${pulse} 1.5s infinite` : 'none'};
  box-shadow: 0 ${rel(2)} ${rel(4)} rgba(0, 0, 0, 0.2);
`

const NextPlayerAvatar = styled.img`
  width: ${rel(24)};
  height: ${rel(24)};
  border-radius: 50%;
`

const NextPlayerText = styled.span<{ isNext?: boolean }>`
  color: white;
  font-size: ${rel(12)};
  font-weight: ${props => props.isNext ? 'bold' : 'normal'};
`
