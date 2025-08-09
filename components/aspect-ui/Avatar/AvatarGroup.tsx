'use client'

import React from 'react'
import { cn } from '../../utils/cn'
import { Avatar } from './Avatar'

interface AvatarGroupProps {
  className?: string
  children?: React.ReactNode
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  className = '',
  children,
  ...rest
}) => {
  return (
    <div className={cn('flex items-center -space-x-2', className)} {...rest}>
      {!children ? (
        <>
          <Avatar />
          <Avatar />
        </>
      ) : (
        <>{children}</>
      )}
    </div>
  )
}
