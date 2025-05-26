import { useState, useEffect } from "react"

export function useTimerValue({
  startedAt,
  duration,
}: {
  startedAt?: number
  duration: number
}) {
  const [value, setValue] = useState<number | null>(null)

  useEffect(() => {
    let handle: ReturnType<typeof requestAnimationFrame> | undefined
    let lastUpdateTime = 0

    if (startedAt) {
      const adjustedStartedAt =
        Date.now() - (Rune.gameTime() / 1000 - startedAt) * 1000

      const tick = (currentTime: number) => {
        // Throttle updates to 60fps for smoother animation
        if (currentTime - lastUpdateTime >= 16.67) { // ~60fps
          const newValue =
            duration - (Date.now() - adjustedStartedAt) / 1000 - 0.5

          if (newValue <= 0) {
            setValue(0)
          } else {
            setValue((oldValue) => {
              // Smooth interpolation for very small changes
              if (oldValue !== null && Math.abs(newValue - oldValue) < 0.1) {
                return oldValue * 0.9 + newValue * 0.1 // Smooth interpolation
              }
              // if we add time, don't go backwards, pause instead
              return oldValue !== null && newValue > oldValue ? oldValue : newValue
            })
            handle = requestAnimationFrame(tick)
          }
          lastUpdateTime = currentTime
        } else {
          handle = requestAnimationFrame(tick)
        }
      }

      handle = requestAnimationFrame(tick)
    } else {
      setValue(null)
    }

    return () => {
      if (handle) cancelAnimationFrame(handle)
    }
  }, [duration, startedAt])

  return value
}
