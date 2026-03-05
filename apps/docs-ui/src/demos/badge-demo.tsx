'use client'

import { Badge } from '@choblue/ui/badge'
import { Preview } from './preview'

export function BadgeVariants() {
  return (
    <Preview>
      <Badge variant="primary">Primary</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="info">Info</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="danger">Danger</Badge>
      <Badge variant="outline">Outline</Badge>
    </Preview>
  )
}
