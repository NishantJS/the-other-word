import styled from "styled-components/macro"
import { useAtomValue } from "jotai"
import { $gameStarted, $ready } from "../../state/$state"
import { Start } from "../Start/Start"
import { Game } from "../Game/Game"


import { ImagePreloader } from "./ImagePreloader"
import { memo } from "react"

export const App = memo(() => {
  const ready = useAtomValue($ready)
  const gameStarted = useAtomValue($gameStarted)

  if (!ready) return <Root />

  return (
    <Root>
      <ImagePreloader />
      {gameStarted ? <Game /> : <Start />}
    </Root>
  )
})

const Root = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 25% 25%, rgba(255,255,255,0.05) 0%, transparent 40%),
                radial-gradient(circle at 75% 75%, rgba(255,255,255,0.03) 0%, transparent 40%);
    pointer-events: none;
    z-index: 0;
  }

  > * {
    position: relative;
    z-index: 1;
  }
`
