import { useMemo, memo, useState, useEffect } from "react"
import styled, { css, keyframes } from "styled-components/macro"
import { rel } from "../../style/rel"
import { useTimerValue } from "./useTimerValue"

// Smooth animations for timer
const pulseScale = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`

const numberChange = keyframes`
  0% { transform: scale(1.2); opacity: 0.7; }
  50% { transform: scale(0.9); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
`

const smoothColorTransition = keyframes`
  0% { filter: hue-rotate(0deg) brightness(1); }
  50% { filter: hue-rotate(10deg) brightness(1.1); }
  100% { filter: hue-rotate(0deg) brightness(1); }
`

export const PieTimer = memo(
  ({
    startedAt,
    duration,
    almostOverAt,
  }: {
    startedAt?: number
    duration: number
    almostOverAt?: number
  }) => {
    const value = useTimerValue({ startedAt, duration })
    const [displayValue, setDisplayValue] = useState<number>(0)
    const [prevDisplayValue, setPrevDisplayValue] = useState<number>(0)

    // Smooth number transitions
    useEffect(() => {
      if (value !== null) {
        const newDisplayValue = Math.ceil(value)
        if (newDisplayValue !== displayValue) {
          setPrevDisplayValue(displayValue)
          setDisplayValue(newDisplayValue)
        }
      }
    }, [value, displayValue])

    const path = useMemo(() => {
      if (value === null) return ""

      const sector = 1 - (duration - value) / duration

      const [startX, startY] = calculateCoordinates(0)
      const [endX, endY] = calculateCoordinates(sector)
      const largeArcFlag = sector > 0.5 ? 1 : 0

      return [
        `M ${startX} ${startY}`, // Move
        `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`, // Arc
        "L 0 0", // Line
      ].join(" ")
    }, [duration, value])

    if (value === null) return null

    const almostOver = almostOverAt !== undefined && value <= almostOverAt
    const progress = value / duration

    return (
      <Root almostOver={almostOver}>
        <SvgRoot viewBox="-1 -1 2 2" almostOver={almostOver} progress={progress}>
          <path d={path}></path>
        </SvgRoot>
        <Text
          almostOver={almostOver}
          key={displayValue}
          hasChanged={displayValue !== prevDisplayValue}
        >
          {displayValue}
        </Text>
      </Root>
    )
  }
)

const Root = styled.div<{ almostOver: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${rel(160)};
  height: ${rel(160)};
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  ${({ almostOver }) =>
    almostOver &&
    css`
      animation: ${pulseScale} 0.8s ease-in-out infinite;
    `}
`

const SvgRoot = styled.svg<{ almostOver: boolean; progress: number }>`
  position: absolute;
  transform: rotate(-90deg) scaleY(-1);
  border-radius: 50%;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  path {
    transition: fill 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  ${({ almostOver, progress }) =>
    almostOver
      ? css`
          border: ${rel(6)} solid #f34545;
          path {
            fill: rgba(243, 69, 69, 0.4);
          }
          animation: ${smoothColorTransition} 1s ease-in-out infinite;
        `
      : css`
          border: ${rel(6)} solid #8bff6a;
          path {
            fill: rgba(113, 217, 84, ${0.3 + progress * 0.5});
          }
        `}
`

const Text = styled.div<{ almostOver: boolean; hasChanged: boolean }>`
  font-size: ${rel(48)};
  text-shadow: 0 ${rel(3)} 0 rgba(0, 0, 0, 0.35);
  z-index: 1;
  transition: color 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  ${({ hasChanged }) =>
    hasChanged &&
    css`
      animation: ${numberChange} 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    `}

  ${({ almostOver }) =>
    almostOver &&
    css`
      color: #f34545;
      font-weight: bold;
    `}
`

function calculateCoordinates(value: number) {
  const x = Math.cos(2 * Math.PI * value)
  const y = Math.sin(2 * Math.PI * value)
  return [x, y]
}
