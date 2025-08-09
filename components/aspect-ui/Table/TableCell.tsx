'use client'

import React, { ReactNode } from 'react'
import { cn } from '../../utils/cn'

interface TableCellProps extends React.HTMLAttributes<HTMLTableCellElement> {
  children: ReactNode
  className?: string
  colSpan?: number
}

export const TableCell: React.FC<TableCellProps> = ({
  children,
  className = '',
  colSpan,
  ...rest
}) => {
  return (
    <td
      className={cn('whitespace-nowrap p-2 align-middle text-sm', className)}
      colSpan={colSpan}
      {...rest}
    >
      {children}
    </td>
  )
}
