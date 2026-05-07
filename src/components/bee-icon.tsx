import React from 'react'

interface BeeIconProps {
  className?: string
}

export function BeeIcon({ className = "w-6 h-6" }: BeeIconProps) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 2c1.5 0 3 1 3 3 0 1.5-1.5 3-3 3s-3-1.5-3-3c0-2 1.5-3 3-3z"/>
      <path d="M8 7c-2.5 1-4 3.5-4 6 0 3.5 2.5 6 8 8 5.5-2 8-4.5 8-8 0-2.5-1.5-5-4-6"/>
      <path d="M12 8v2"/>
      <path d="M8 11h8"/>
      <path d="M8 15h8"/>
      <path d="M12 14v4"/>
      <path d="M6 4l-2-2"/>
      <path d="M18 4l2-2"/>
      <path d="M6 20l-2 2"/>
      <path d="M18 20l2 2"/>
    </svg>
  )
}

export default BeeIcon
