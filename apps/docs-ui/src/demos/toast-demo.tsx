'use client'

import { ToastProvider, ToastViewport, useToast } from '@choblue/ui/toast'
import { Button } from '@choblue/ui/button'
import { Preview } from './preview'

function ToastButtons() {
  const { toast } = useToast()

  return (
    <div className="flex gap-4">
      <Button
        variant="primary"
        onClick={() => toast({ title: '성공', description: '작업이 완료되었습니다.' })}
      >
        기본 토스트
      </Button>
      <Button
        variant="danger"
        onClick={() => toast({ title: '오류', description: '문제가 발생했습니다.', variant: 'danger' })}
      >
        위험 토스트
      </Button>
    </div>
  )
}

export function ToastDemo() {
  return (
    <Preview>
      <ToastProvider>
        <ToastButtons />
        <ToastViewport />
      </ToastProvider>
    </Preview>
  )
}
