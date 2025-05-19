import { useAtomValue } from "jotai"
import { $players, $game } from "../../state/$state"
import { useEffect, useMemo, memo } from "react"

export const ImagePreloader = memo(() => {
  const players = useAtomValue($players)
  const game = useAtomValue($game)

  const playerAvatars = useMemo(() => {
    // Get avatar URLs from players with info
    const humanAvatars = players
      .filter(player => player.info) // Filter out players without info
      .map(player => player.info.avatarUrl)

    // Get avatar URLs from bots
    const botAvatars = game.bots.map(bot => bot.avatarUrl)

    // Combine both arrays and filter out undefined values
    // Add default bot avatar
    return [...humanAvatars, ...botAvatars, '/images/bots/default.svg'].filter(Boolean)
  }, [players, game.bots])

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
