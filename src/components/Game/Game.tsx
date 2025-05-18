import { useAtomValue } from "jotai"
import { $yourPlayer, $currentTurn } from "../../state/$state"
import styled, { css } from "styled-components/macro"
import { Countdown } from "./Countdown"
import { Describing } from "./Describing/Describing"
import { Voting } from "./Voting/Voting"
import { ImpostorResults } from "./Results/ImpostorResults"
import { memo } from "react"
import { rel } from "../../style/rel"

export const Game = memo(() => {
  const yourPlayer = useAtomValue($yourPlayer)
  const currentTurn = useAtomValue($currentTurn)

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
  } else if ((currentTurn.stage as any) === "acting") {
    // For backward compatibility
    content = <Describing />;
  } else if ((currentTurn.stage as any) === "endOfTurn") {
    // For backward compatibility
    content = <Voting />;
  }

  return (
    <Root isImpostor={yourPlayer?.isImpostor}>
      {content}
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
  ${({ isImpostor }) =>
    isImpostor &&
    css`
      background: radial-gradient(
        62.56% 62.56% at 50% 44.09%,
        #bc5287 0%,
        #24083a 81.77%,
        #24083a 100%
      );
    `};
`
