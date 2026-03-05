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
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="apple">Apple</SelectItem>
            <SelectItem value="banana">Banana</SelectItem>
            <SelectItem value="cherry">Cherry</SelectItem>
            <SelectItem value="grape" disabled>Grape (disabled)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {value && <span className="text-sm text-muted-foreground">Selected: {value}</span>}
    </Preview>
  )
}
