import { useAtomValue } from "jotai"
import { $players } from "../../state/$state"
import { useEffect, useMemo, memo } from "react"

export const ImagePreloader = memo(() => {
  const players = useAtomValue($players)
  const playerAvatars = useMemo(
    () => players.map((player) => player.info.avatarUrl),
    [players]
  )

  useEffect(() => {
    playerAvatars.forEach(preload)
  }, [playerAvatars])

  return null
})

const preloaded = new Set<string>()

function preload(imgUrl: string) {
  if (preloaded.has(imgUrl)) return

  const img = new Image()
  img.src = imgUrl
  preloaded.add(imgUrl)
}
