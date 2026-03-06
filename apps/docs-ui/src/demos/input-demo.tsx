'use client'

import { Input } from '@choblue/ui/input'
import { Preview } from './preview'

export function InputSizes() {
  return (
    <Preview className="flex-col items-stretch">
      <Input size="sm" placeholder="작은 입력" />
      <Input size="md" placeholder="보통 입력" />
      <Input size="lg" placeholder="큰 입력" />
    </Preview>
  )
}

export function InputStates() {
  return (
    <Preview className="flex-col items-stretch">
      <Input placeholder="기본" />
      <Input disabled placeholder="비활성" />
      <Input aria-invalid="true" placeholder="오류" />
    </Preview>
  )
}

export function InputTypes() {
  return (
    <Preview className="flex-col items-stretch">
      <Input type="email" placeholder="이메일" />
      <Input type="password" placeholder="비밀번호" />
      <Input type="number" placeholder="숫자" />
    </Preview>
  )
}
