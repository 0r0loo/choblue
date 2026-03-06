'use client'

import { useState } from 'react'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@choblue/ui/select'
import { Preview } from './preview'

export function SelectBasic() {
  const [value, setValue] = useState('')

  return (
    <Preview>
      <div className="w-64">
        <Select value={value} onValueChange={setValue}>
          <SelectTrigger>
            <SelectValue placeholder="옵션을 선택하세요" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="americano">아메리카노</SelectItem>
            <SelectItem value="latte">카페라떼</SelectItem>
            <SelectItem value="cappuccino">카푸치노</SelectItem>
            <SelectItem value="espresso" disabled>에스프레소 (품절)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {value && <span className="text-sm text-muted-foreground">선택: {value}</span>}
    </Preview>
  )
}
