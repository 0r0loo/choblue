'use client'

import { Input } from '@choblue/ui/input'
import { Preview } from './preview'

export function InputSizes() {
  return (
    <Preview className="flex-col items-stretch">
      <Input size="sm" placeholder="Small input" />
      <Input size="md" placeholder="Medium input" />
      <Input size="lg" placeholder="Large input" />
    </Preview>
  )
}

export function InputStates() {
  return (
    <Preview className="flex-col items-stretch">
      <Input placeholder="Default" />
      <Input disabled placeholder="Disabled" />
      <Input aria-invalid="true" placeholder="Invalid" />
    </Preview>
  )
}

export function InputTypes() {
  return (
    <Preview className="flex-col items-stretch">
      <Input type="email" placeholder="Email" />
      <Input type="password" placeholder="Password" />
      <Input type="number" placeholder="Number" />
    </Preview>
  )
}
