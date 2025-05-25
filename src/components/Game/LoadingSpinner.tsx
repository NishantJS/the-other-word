import React, { memo } from 'react'
import styled, { keyframes } from 'styled-components/macro'
import { rel } from '../../style/rel'

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`

const pulse = keyframes`
  0% { transform: scale(1); opacity: 0.7; }
  50% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1); opacity: 0.7; }
`

const bounce = keyframes`
  0%, 20%, 53%, 80%, 100% { transform: translateY(0); }
  40%, 43% { transform: translateY(-${rel(8)}); }
  70% { transform: translateY(-${rel(4)}); }
`

const wave = keyframes`
  0% { transform: translateY(0); }
  25% { transform: translateY(-${rel(4)}); }
  50% { transform: translateY(0); }
  75% { transform: translateY(${rel(4)}); }
  100% { transform: translateY(0); }
`

export interface LoadingSpinnerProps {
  type?: 'spinner' | 'pulse' | 'dots' | 'wave'
  size?: 'small' | 'medium' | 'large'
  color?: string
  message?: string
}

export const LoadingSpinner = memo(({ 
  type = 'spinner', 
  size = 'medium', 
  color = '#ffffff',
  message 
}: LoadingSpinnerProps) => {
  const renderSpinner = () => {
    switch (type) {
      case 'pulse':
        return <PulseLoader size={size} color={color} />
      case 'dots':
        return <DotsLoader size={size} color={color} />
      case 'wave':
        return <WaveLoader size={size} color={color} />
      default:
        return <SpinnerLoader size={size} color={color} />
    }
  }

  return (
    <LoaderContainer>
      {renderSpinner()}
      {message && <LoaderMessage>{message}</LoaderMessage>}
    </LoaderContainer>
  )
})

const SpinnerLoader = styled.div<{ size: string; color: string }>`
  width: ${props => {
    switch (props.size) {
      case 'small': return rel(20)
      case 'large': return rel(40)
      default: return rel(30)
    }
  }};
  height: ${props => {
    switch (props.size) {
      case 'small': return rel(20)
      case 'large': return rel(40)
      default: return rel(30)
    }
  }};
  border: ${rel(3)} solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top: ${rel(3)} solid ${props => props.color};
  animation: ${spin} 1s linear infinite;
`

const PulseLoader = styled.div<{ size: string; color: string }>`
  width: ${props => {
    switch (props.size) {
      case 'small': return rel(16)
      case 'large': return rel(32)
      default: return rel(24)
    }
  }};
  height: ${props => {
    switch (props.size) {
      case 'small': return rel(16)
      case 'large': return rel(32)
      default: return rel(24)
    }
  }};
  background: ${props => props.color};
  border-radius: 50%;
  animation: ${pulse} 1.5s ease-in-out infinite;
`

const DotsLoader = styled.div<{ size: string; color: string }>`
  display: flex;
  gap: ${rel(4)};
  
  &::before,
  &::after,
  & {
    content: '';
    width: ${props => {
      switch (props.size) {
        case 'small': return rel(6)
        case 'large': return rel(12)
        default: return rel(8)
      }
    }};
    height: ${props => {
      switch (props.size) {
        case 'small': return rel(6)
        case 'large': return rel(12)
        default: return rel(8)
      }
    }};
    background: ${props => props.color};
    border-radius: 50%;
    animation: ${bounce} 1.4s ease-in-out infinite both;
  }
  
  &::before {
    animation-delay: -0.32s;
  }
  
  &::after {
    animation-delay: -0.16s;
  }
`

const WaveLoader = styled.div<{ size: string; color: string }>`
  display: flex;
  gap: ${rel(2)};
  
  span {
    width: ${props => {
      switch (props.size) {
        case 'small': return rel(3)
        case 'large': return rel(6)
        default: return rel(4)
      }
    }};
    height: ${props => {
      switch (props.size) {
        case 'small': return rel(20)
        case 'large': return rel(40)
        default: return rel(30)
      }
    }};
    background: ${props => props.color};
    border-radius: ${rel(2)};
    animation: ${wave} 1.2s ease-in-out infinite;
  }
  
  span:nth-child(2) { animation-delay: 0.1s; }
  span:nth-child(3) { animation-delay: 0.2s; }
  span:nth-child(4) { animation-delay: 0.3s; }
  span:nth-child(5) { animation-delay: 0.4s; }
`

const LoaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${rel(12)};
`

const LoaderMessage = styled.span`
  color: white;
  font-size: ${rel(14)};
  text-align: center;
  opacity: 0.8;
`

// Create WaveLoader with spans
export const WaveLoaderComponent = memo(({ size = 'medium', color = '#ffffff' }: { size?: string; color?: string }) => (
  <WaveLoader size={size} color={color}>
    <span />
    <span />
    <span />
    <span />
    <span />
  </WaveLoader>
))

// Skeleton loader for content
export const SkeletonLoader = memo(({ 
  width = '100%', 
  height = rel(20), 
  borderRadius = rel(4) 
}: { 
  width?: string
  height?: string
  borderRadius?: string 
}) => (
  <SkeletonContainer 
    width={width} 
    height={height} 
    borderRadius={borderRadius} 
  />
))

const shimmer = keyframes`
  0% { background-position: -${rel(200)} 0; }
  100% { background-position: ${rel(200)} 0; }
`

const SkeletonContainer = styled.div<{ width: string; height: string; borderRadius: string }>`
  width: ${props => props.width};
  height: ${props => props.height};
  border-radius: ${props => props.borderRadius};
  background: linear-gradient(90deg, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 75%);
  background-size: ${rel(200)} 100%;
  animation: ${shimmer} 1.5s infinite ease-in-out;
`
