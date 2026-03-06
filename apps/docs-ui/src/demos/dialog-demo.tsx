'use client'

import { useState } from 'react'
import {
  Dialog, DialogTrigger, DialogContent, DialogClose,
  DialogHeader, DialogTitle, DialogDescription, DialogFooter,
  ConfirmProvider, useConfirm,
} from '@choblue/ui/dialog'
import { Button } from '@choblue/ui/button'
import { Preview } from './preview'

export function DialogBasic() {
  return (
    <Preview>
      <Dialog>
        <DialogTrigger asChild>
          <Button>다이얼로그 열기</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>다이얼로그 제목</DialogTitle>
            <DialogDescription>
              다이얼로그 설명입니다. 여기에 원하는 내용을 넣을 수 있습니다.
            </DialogDescription>
          </DialogHeader>
          <div className="p-6 pt-0">
            <p className="text-sm text-foreground">다이얼로그 본문 내용입니다.</p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">취소</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button>확인</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Preview>
  )
}

function ConfirmExample() {
  const confirm = useConfirm()
  const [result, setResult] = useState<string>('')

  const handleClick = async () => {
    const ok = await confirm({
      title: '계속하시겠습니까?',
      description: '이 작업은 되돌릴 수 없습니다.',
    })
    setResult(ok ? '확인됨' : '취소됨')
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <Button onClick={handleClick}>확인 열기</Button>
      {result && (
        <p className="text-sm text-muted-foreground">결과: {result}</p>
      )}
    </div>
  )
}

export function DialogConfirm() {
  return (
    <Preview>
      <ConfirmProvider>
        <ConfirmExample />
      </ConfirmProvider>
    </Preview>
  )
}

function ConfirmDangerExample() {
  const confirm = useConfirm()
  const [deleted, setDeleted] = useState(false)

  const handleDelete = async () => {
    const ok = await confirm({
      title: '상품 삭제',
      description: '이 상품이 영구적으로 삭제됩니다.',
      confirmText: '삭제',
      cancelText: '유지',
      variant: 'danger',
    })
    if (ok) setDeleted(true)
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <Button variant="danger" onClick={handleDelete}>상품 삭제</Button>
      {deleted && (
        <p className="text-sm text-danger-600">상품이 삭제되었습니다.</p>
      )}
    </div>
  )
}

export function DialogConfirmDanger() {
  return (
    <Preview>
      <ConfirmProvider>
        <ConfirmDangerExample />
      </ConfirmProvider>
    </Preview>
  )
}

function ConfirmCustomRenderExample() {
  const confirm = useConfirm()
  const [result, setResult] = useState<string>('')

  const handleDelete = async () => {
    const ok = await confirm({
      render: ({ confirm: onConfirm, cancel }) => (
        <>
          <DialogHeader>
            <DialogTitle>상품 삭제</DialogTitle>
            <DialogDescription>
              다음 상품이 영구적으로 삭제됩니다.
            </DialogDescription>
          </DialogHeader>
          <div className="p-6 pt-0">
            <div className="rounded-lg border border-border bg-surface p-4">
              <p className="text-sm font-semibold">아메리카노</p>
              <p className="text-sm text-muted-foreground">카테고리: 커피</p>
              <p className="text-sm text-muted-foreground">가격: ₩3,500</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={cancel}>취소</Button>
            <Button variant="danger" onClick={onConfirm}>삭제</Button>
          </DialogFooter>
        </>
      ),
    })
    setResult(ok ? '삭제됨' : '취소됨')
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <Button variant="danger" onClick={handleDelete}>상품 삭제 (커스텀)</Button>
      {result && (
        <p className="text-sm text-muted-foreground">결과: {result}</p>
      )}
    </div>
  )
}

export function DialogConfirmCustom() {
  return (
    <Preview>
      <ConfirmProvider>
        <ConfirmCustomRenderExample />
      </ConfirmProvider>
    </Preview>
  )
}
