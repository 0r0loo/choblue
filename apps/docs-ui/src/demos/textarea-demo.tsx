'use client'

import { Textarea } from '@choblue/ui/textarea'
import { Preview } from './preview'

export function TextareaSizes() {
  return (
    <Preview className="flex-col items-stretch">
      <Textarea size="sm" placeholder="작은 텍스트 영역" rows={3} />
      <Textarea size="md" placeholder="보통 텍스트 영역" rows={3} />
      <Textarea size="lg" placeholder="큰 텍스트 영역" rows={3} />
    </Preview>
  )
}

export function TextareaStates() {
  return (
    <Preview className="flex-col items-stretch">
      <Textarea placeholder="기본" rows={3} />
      <Textarea disabled placeholder="비활성" rows={3} />
      <Textarea aria-invalid="true" placeholder="오류" rows={3} />
    </Preview>
  )
}
