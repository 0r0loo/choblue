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
        onClick={() => toast({ title: 'Success', description: 'Operation completed.' })}
      >
        Default Toast
      </Button>
      <Button
        variant="danger"
        onClick={() => toast({ title: 'Error', description: 'Something went wrong.', variant: 'danger' })}
      >
        Danger Toast
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
