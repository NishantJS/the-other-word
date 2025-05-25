import React, { memo, useEffect, useState } from 'react'
import styled, { keyframes, css } from 'styled-components/macro'
import { rel } from '../../style/rel'

const bounceIn = keyframes`
  0% { transform: scale(0.3); opacity: 0; }
  50% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
`

const slideUp = keyframes`
  0% { transform: translateY(${rel(50)}); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
`

const fadeOut = keyframes`
  0% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-${rel(20)}); }
`

export interface FeedbackMessage {
  id: string
  type: 'success' | 'warning' | 'error' | 'info'
  title: string
  message?: string
  icon?: string
  duration?: number
}

interface FeedbackSystemProps {
  messages: FeedbackMessage[]
  onMessageDismiss: (id: string) => void
}

export const FeedbackSystem = memo(({ messages, onMessageDismiss }: FeedbackSystemProps) => {
  return (
    <FeedbackContainer>
      {messages.map((msg) => (
        <FeedbackMessage
          key={msg.id}
          message={msg}
          onDismiss={() => onMessageDismiss(msg.id)}
        />
      ))}
    </FeedbackContainer>
  )
})

const FeedbackMessage = memo(({ 
  message, 
  onDismiss 
}: { 
  message: FeedbackMessage
  onDismiss: () => void 
}) => {
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true)
      setTimeout(onDismiss, 300) // Wait for exit animation
    }, message.duration || 3000)

    return () => clearTimeout(timer)
  }, [message.duration, onDismiss])

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return '#4caf50'
      case 'warning': return '#ff9800'
      case 'error': return '#f44336'
      case 'info': return '#2196f3'
      default: return '#2196f3'
    }
  }

  const getTypeIcon = (type: string) => {
    if (message.icon) return message.icon
    
    switch (type) {
      case 'success': return '✅'
      case 'warning': return '⚠️'
      case 'error': return '❌'
      case 'info': return 'ℹ️'
      default: return 'ℹ️'
    }
  }

  return (
    <MessageCard 
      color={getTypeColor(message.type)}
      isExiting={isExiting}
      onClick={() => {
        setIsExiting(true)
        setTimeout(onDismiss, 300)
      }}
    >
      <MessageIcon>{getTypeIcon(message.type)}</MessageIcon>
      <MessageContent>
        <MessageTitle>{message.title}</MessageTitle>
        {message.message && <MessageText>{message.message}</MessageText>}
      </MessageContent>
    </MessageCard>
  )
})

export const useNotification = () => {
  const [messages, setMessages] = useState<FeedbackMessage[]>([])

  const addMessage = (message: Omit<FeedbackMessage, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    
    // Prevent duplicate messages by checking if similar message exists
    const isDuplicate = messages.some(msg => 
      msg.type === message.type && 
      msg.title === message.title && 
      msg.message === message.message
    )
    
    if (!isDuplicate) {
      setMessages(prev => [...prev.slice(-2), { ...message, id }]) // Keep only last 3 messages
    }
  }

  const removeMessage = (id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id))
  }

  const notify = {
    success: (title: string, message?: string, icon?: string) => 
      addMessage({ type: 'success', title, message, icon }),
    warning: (title: string, message?: string, icon?: string) => 
      addMessage({ type: 'warning', title, message, icon }),
    error: (title: string, message?: string, icon?: string) => 
      addMessage({ type: 'error', title, message, icon }),
    info: (title: string, message?: string, icon?: string) => 
      addMessage({ type: 'info', title, message, icon }),
  }

  return {
    messages,
    removeMessage,
    notify,
    FeedbackComponent: () => (
      <FeedbackSystem messages={messages} onMessageDismiss={removeMessage} />
    )
  }
}

const FeedbackContainer = styled.div`
  position: fixed;
  top: ${rel(80)};
  right: ${rel(12)};
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: ${rel(8)};
  max-width: ${rel(300)};
  
  @media (max-width: 480px) {
    top: ${rel(60)};
    left: ${rel(12)};
    right: ${rel(12)};
    max-width: none;
  }
`

const MessageCard = styled.div<{ color: string; isExiting: boolean }>`
  display: flex;
  align-items: center;
  gap: ${rel(12)};
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(${rel(8)});
  border-radius: ${rel(12)};
  padding: ${rel(12)} ${rel(16)};
  border-left: ${rel(4)} solid ${props => props.color};
  box-shadow: 0 ${rel(4)} ${rel(12)} rgba(0, 0, 0, 0.3);
  cursor: pointer;
  animation: ${props => props.isExiting ? 
    css`${fadeOut} 0.3s ease-out forwards` : 
    css`${slideUp} 0.4s ease-out`
  };
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateX(-${rel(4)});
  }
`

const MessageIcon = styled.span`
  font-size: ${rel(18)};
  animation: ${bounceIn} 0.5s ease-out;
`

const MessageContent = styled.div`
  flex: 1;
`

const MessageTitle = styled.div`
  color: white;
  font-size: ${rel(14)};
  font-weight: bold;
  margin-bottom: ${rel(2)};
`

const MessageText = styled.div`
  color: #e4faff;
  font-size: ${rel(12)};
  line-height: 1.3;
`
