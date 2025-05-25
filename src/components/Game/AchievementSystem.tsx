import React, { memo, useEffect, useState } from 'react'
import styled, { keyframes, css } from 'styled-components/macro'
import { useAtomValue } from 'jotai'
import { $yourPlayer, $game, $round, $currentTurn } from '../../state/$state'
import { rel } from '../../style/rel'

const popIn = keyframes`
  0% { transform: scale(0.5) rotate(-10deg); opacity: 0; }
  50% { transform: scale(1.2) rotate(5deg); opacity: 1; }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
`

const slideInRight = keyframes`
  0% { transform: translateX(${rel(300)}); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
`

const glow = keyframes`
  0% { box-shadow: 0 0 ${rel(5)} rgba(255, 193, 7, 0.5); }
  50% { box-shadow: 0 0 ${rel(20)} rgba(255, 193, 7, 0.8); }
  100% { box-shadow: 0 0 ${rel(5)} rgba(255, 193, 7, 0.5); }
`

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  unlocked: boolean
  progress?: number
  maxProgress?: number
}

interface GameStats {
  gamesPlayed: number
  gamesWon: number
  timesImpostor: number
  timesImpostorCaught: number
  timesImpostorEscaped: number
  perfectDescriptions: number
  quickVotes: number
  streak: number
  maxStreak: number
}

export const AchievementSystem = memo(() => {
  const yourPlayer = useAtomValue($yourPlayer)
  const game = useAtomValue($game)
  const round = useAtomValue($round)
  const currentTurn = useAtomValue($currentTurn)
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([])
  const [stats, setStats] = useState<GameStats>({
    gamesPlayed: 0,
    gamesWon: 0,
    timesImpostor: 0,
    timesImpostorCaught: 0,
    timesImpostorEscaped: 0,
    perfectDescriptions: 0,
    quickVotes: 0,
    streak: 0,
    maxStreak: 0
  })

  // Define achievements
  const achievements: Achievement[] = [
    {
      id: 'first_game',
      title: 'First Steps',
      description: 'Play your first game',
      icon: '🎮',
      rarity: 'common',
      unlocked: stats.gamesPlayed >= 1
    },
    {
      id: 'master_impostor',
      title: 'Master of Deception',
      description: 'Escape as impostor 3 times',
      icon: '🎭',
      rarity: 'rare',
      unlocked: stats.timesImpostorEscaped >= 3,
      progress: stats.timesImpostorEscaped,
      maxProgress: 3
    },
    {
      id: 'detective',
      title: 'Sharp Detective',
      description: 'Catch 5 impostors',
      icon: '🔍',
      rarity: 'rare',
      unlocked: stats.timesImpostorCaught >= 5,
      progress: stats.timesImpostorCaught,
      maxProgress: 5
    },
    {
      id: 'speed_voter',
      title: 'Quick Draw',
      description: 'Vote within 5 seconds',
      icon: '⚡',
      rarity: 'common',
      unlocked: stats.quickVotes >= 1
    },
    {
      id: 'winning_streak',
      title: 'On Fire!',
      description: 'Win 3 games in a row',
      icon: '🔥',
      rarity: 'epic',
      unlocked: stats.streak >= 3,
      progress: stats.streak,
      maxProgress: 3
    },
    {
      id: 'legendary_streak',
      title: 'Unstoppable',
      description: 'Win 10 games in a row',
      icon: '👑',
      rarity: 'legendary',
      unlocked: stats.maxStreak >= 10,
      progress: stats.maxStreak,
      maxProgress: 10
    }
  ]

  // Check for new achievements
  useEffect(() => {
    const newlyUnlocked = achievements.filter(achievement => 
      achievement.unlocked && !localStorage.getItem(`achievement_${achievement.id}`)
    )
    
    if (newlyUnlocked.length > 0) {
      newlyUnlocked.forEach(achievement => {
        localStorage.setItem(`achievement_${achievement.id}`, 'true')
      })
      setNewAchievements(newlyUnlocked)
    }
  }, [stats])

  // Dismiss achievement notification
  const dismissAchievement = (id: string) => {
    setNewAchievements(prev => prev.filter(a => a.id !== id))
  }

  return (
    <>
      {newAchievements.map(achievement => (
        <AchievementNotification
          key={achievement.id}
          achievement={achievement}
          onDismiss={() => dismissAchievement(achievement.id)}
        />
      ))}
      
      <StreakIndicator streak={stats.streak} />
    </>
  )
})

const AchievementNotification = memo(({ 
  achievement, 
  onDismiss 
}: { 
  achievement: Achievement
  onDismiss: () => void 
}) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onDismiss, 500)
    }, 4000)

    return () => clearTimeout(timer)
  }, [onDismiss])

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return '#9e9e9e'
      case 'rare': return '#2196f3'
      case 'epic': return '#9c27b0'
      case 'legendary': return '#ff9800'
      default: return '#9e9e9e'
    }
  }

  if (!isVisible) return null

  return (
    <NotificationContainer 
      rarity={achievement.rarity}
      onClick={() => {
        setIsVisible(false)
        setTimeout(onDismiss, 500)
      }}
    >
      <AchievementIcon rarity={achievement.rarity}>
        {achievement.icon}
      </AchievementIcon>
      <AchievementContent>
        <AchievementTitle color={getRarityColor(achievement.rarity)}>
          {achievement.title}
        </AchievementTitle>
        <AchievementDescription>
          {achievement.description}
        </AchievementDescription>
        <RarityBadge rarity={achievement.rarity}>
          {achievement.rarity.toUpperCase()}
        </RarityBadge>
      </AchievementContent>
    </NotificationContainer>
  )
})

const StreakIndicator = memo(({ streak }: { streak: number }) => {
  if (streak < 2) return null

  return (
    <StreakContainer>
      <StreakIcon>🔥</StreakIcon>
      <StreakText>{streak} Win Streak!</StreakText>
    </StreakContainer>
  )
})

const getRarityGlow = (rarity: string) => {
  switch (rarity) {
    case 'legendary':
      return css`animation: ${glow} 2s infinite ease-in-out;`;
    default:
      return '';
  }
};

const NotificationContainer = styled.div<{ rarity: string }>`
  position: fixed;
  top: ${rel(120)};
  right: ${rel(12)};
  display: flex;
  align-items: center;
  gap: ${rel(12)};
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(${rel(8)});
  border-radius: ${rel(12)};
  padding: ${rel(12)} ${rel(16)};
  border: ${rel(2)} solid ${props => {
    switch (props.rarity) {
      case 'rare': return '#2196f3'
      case 'epic': return '#9c27b0'
      case 'legendary': return '#ff9800'
      default: return '#9e9e9e'
    }
  }};
  z-index: 1000;
  animation: ${slideInRight} 0.5s ease-out;
  cursor: pointer;
  transition: transform 0.2s ease;
  max-width: ${rel(280)};
  
  ${props => props.rarity === 'legendary' && getRarityGlow(props.rarity)}
  
  &:hover {
    transform: translateX(-${rel(4)});
  }
`

const AchievementIcon = styled.span<{ rarity: string }>`
  font-size: ${rel(32)};
  animation: ${popIn} 0.6s ease-out;
  filter: drop-shadow(0 ${rel(2)} ${rel(4)} rgba(0, 0, 0, 0.3));
  
  ${props => props.rarity === 'legendary' && css`
    animation: ${popIn} 0.6s ease-out, ${glow} 2s infinite ease-in-out 0.6s;
  `}
`

const AchievementContent = styled.div`
  flex: 1;
`

const AchievementTitle = styled.div<{ color: string }>`
  color: ${props => props.color};
  font-size: ${rel(16)};
  font-weight: bold;
  margin-bottom: ${rel(4)};
`

const AchievementDescription = styled.div`
  color: #e4faff;
  font-size: ${rel(12)};
  line-height: 1.3;
  margin-bottom: ${rel(6)};
`

const RarityBadge = styled.span<{ rarity: string }>`
  background: ${props => {
    switch (props.rarity) {
      case 'rare': return '#2196f3'
      case 'epic': return '#9c27b0'
      case 'legendary': return '#ff9800'
      default: return '#9e9e9e'
    }
  }};
  color: white;
  font-size: ${rel(10)};
  font-weight: bold;
  padding: ${rel(2)} ${rel(6)};
  border-radius: ${rel(4)};
  text-transform: uppercase;
`

const StreakContainer = styled.div`
  position: fixed;
  top: ${rel(50)};
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: ${rel(8)};
  background: rgba(255, 87, 34, 0.9);
  backdrop-filter: blur(${rel(8)});
  border-radius: ${rel(20)};
  padding: ${rel(8)} ${rel(16)};
  z-index: 100;
  animation: ${popIn} 0.5s ease-out;
  box-shadow: 0 ${rel(4)} ${rel(12)} rgba(255, 87, 34, 0.3);
`

const StreakIcon = styled.span`
  font-size: ${rel(18)};
  animation: ${glow} 1.5s infinite ease-in-out;
`

const StreakText = styled.span`
  color: white;
  font-size: ${rel(14)};
  font-weight: bold;
`
