import { useAtomValue } from "jotai"
import { $players } from "../../state/$state"
import { useEffect, useMemo, memo } from "react"

export const ImagePreloader = memo(() => {
  const players = useAtomValue($players)

  const playerAvatars = useMemo(() => {
    // Get avatar URLs from players with info
    const avatars = players
      .filter(player => player.info) // Filter out players without info
      .map(player => player.info.avatarUrl)

    // Filter out undefined values
    return avatars.filter(Boolean)
  }, [players])

  useEffect(() => {
    playerAvatars.forEach(preload)
  }, [playerAvatars])

  return null
})

const preloaded = new Set<string>()

function preload(imgUrl: string) {
  if (!imgUrl || preloaded.has(imgUrl)) return

  const img = new Image()
  img.src = imgUrl
  preloaded.add(imgUrl)
}
