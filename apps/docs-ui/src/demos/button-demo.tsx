'use client'

import { Button } from '@choblue/ui/button'
import { Preview } from './preview'

export function ButtonVariants() {
  return (
    <Preview>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">Danger</Button>
    </Preview>
  )
}

export function ButtonSizes() {
  return (
    <Preview>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
      <Button size="icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
      </Button>
    </Preview>
  )
}

export function ButtonDisabled() {
  return (
    <Preview>
      <Button disabled>Disabled</Button>
      <Button variant="outline" disabled>Disabled</Button>
    </Preview>
  )
}
