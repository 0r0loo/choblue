'use client'

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@choblue/ui/card'
import { Button } from '@choblue/ui/button'
import { Preview } from './preview'

export function CardBasic() {
  return (
    <Preview className="flex-col">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>작업 확인</CardTitle>
          <CardDescription>계속 진행하시겠습니까?</CardDescription>
        </CardHeader>
        <CardContent>
          <p>이 작업은 되돌릴 수 없습니다. 계속하려면 확인을 눌러주세요.</p>
        </CardContent>
        <CardFooter className="gap-2">
          <Button variant="outline" className="flex-1">취소</Button>
          <Button className="flex-1">확인</Button>
        </CardFooter>
      </Card>
    </Preview>
  )
}
