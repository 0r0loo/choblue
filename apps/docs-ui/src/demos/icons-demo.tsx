'use client'

import {
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronDoubleLeft,
  ChevronDoubleRight,
  SortAsc,
  SortDesc,
  SortDefault,
} from '@choblue/ui/icons'
import { Preview } from './preview'

export function AllIcons() {
  return (
    <Preview>
      <div className="grid grid-cols-3 gap-6 w-full">
        {[
          { name: 'X', Icon: X },
          { name: 'Check', Icon: Check },
          { name: 'ChevronLeft', Icon: ChevronLeft },
          { name: 'ChevronRight', Icon: ChevronRight },
          { name: 'ChevronDoubleLeft', Icon: ChevronDoubleLeft },
          { name: 'ChevronDoubleRight', Icon: ChevronDoubleRight },
          { name: 'SortAsc', Icon: SortAsc },
          { name: 'SortDesc', Icon: SortDesc },
          { name: 'SortDefault', Icon: SortDefault },
        ].map(({ name, Icon }) => (
          <div key={name} className="flex flex-col items-center gap-2 rounded-lg border border-border p-4">
            <Icon />
            <span className="text-xs text-muted-foreground">{name}</span>
          </div>
        ))}
      </div>
    </Preview>
  )
}

export function IconSizes() {
  return (
    <Preview>
      <div className="flex items-end gap-4">
        {[16, 24, 32, 48].map((s) => (
          <div key={s} className="flex flex-col items-center gap-2">
            <Check size={s} />
            <span className="text-xs text-muted-foreground">{s}px</span>
          </div>
        ))}
      </div>
    </Preview>
  )
}

export function IconColors() {
  return (
    <Preview>
      <div className="flex items-center gap-4">
        <Check className="text-primary" />
        <Check className="text-success-500" />
        <Check className="text-danger-500" />
        <Check className="text-muted-foreground" />
      </div>
    </Preview>
  )
}
