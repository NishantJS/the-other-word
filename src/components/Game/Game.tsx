import { useAtomValue } from "jotai"
import { $yourPlayer, $currentTurn, $game } from "../../state/$state"
import styled, { css } from "styled-components/macro"
import { Countdown } from "./Countdown"
import { Describing } from "./Describing/Describing"
import { Voting } from "./Voting/Voting"
import { ImpostorResults } from "./Results/ImpostorResults"
import { memo } from "react"
import { rel } from "../../style/rel"
import { BotSpeech } from "./BotSpeech/BotSpeech"

export const Game = memo(() => {
  const yourPlayer = useAtomValue($yourPlayer)
  const currentTurn = useAtomValue($currentTurn)
  const game = useAtomValue($game)

  if (!currentTurn) return null

  // Handle different stage types with type checking
  let content = null;

  if (currentTurn.stage === "countdown") {
    content = <Countdown />;
  } else if (currentTurn.stage === "describing") {
    content = <Describing />;
  } else if (currentTurn.stage === "voting") {
    content = <Voting />;
  } else if (currentTurn.stage === "result") {
    content = <ImpostorResults />;
  }

  return (
    <Root isImpostor={yourPlayer?.isImpostor}>
      {content}
      {/* Add BotSpeech component if speech is enabled */}
      {game.useSpeech && <BotSpeech />}
    </Root>
  )
})



const Root = styled.div<{ isImpostor?: boolean }>`
  animation: fadeIn 300ms ease-out forwards;
  z-index: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: radial-gradient(
    62.56% 62.56% at 50% 44.09%,
    #9c27b0 0%,
    #4a148c 81.77%,
    #311b92 100%
  );
`
