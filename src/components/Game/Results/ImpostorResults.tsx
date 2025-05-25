// filepath: e:\Code\codejam\oink-oink\src\components\Game\Results\ImpostorResults.tsx
import { memo } from "react"
import styled from "styled-components/macro"
import { rel } from "../../../style/rel"

// This component is deprecated. Use ImpostorResultsNew instead.
export const ImpostorResults = memo(() => {
  return (
    <RedirectMessage>
      Please use <strong>ImpostorResultsNew</strong> component
    </RedirectMessage>
  )
})

const RedirectMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: ${rel(20)};
  font-size: ${rel(18)};
  text-align: center;
  color: #e4faff;
`
