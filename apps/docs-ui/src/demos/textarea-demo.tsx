'use client'

import { Textarea } from '@choblue/ui/textarea'
import { Preview } from './preview'

export function TextareaSizes() {
  return (
    <Preview className="flex-col items-stretch">
      <Textarea size="sm" placeholder="Small textarea" rows={3} />
      <Textarea size="md" placeholder="Medium textarea" rows={3} />
      <Textarea size="lg" placeholder="Large textarea" rows={3} />
    </Preview>
  )
}

export function TextareaStates() {
  return (
    <Preview className="flex-col items-stretch">
      <Textarea placeholder="Default" rows={3} />
      <Textarea disabled placeholder="Disabled" rows={3} />
      <Textarea aria-invalid="true" placeholder="Invalid" rows={3} />
    </Preview>
  )
}
