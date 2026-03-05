'use client'

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@choblue/ui/card'
import { Button } from '@choblue/ui/button'
import { Preview } from './preview'

export function CardBasic() {
  return (
    <Preview className="flex-col">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Confirm Action</CardTitle>
          <CardDescription>Are you sure you want to proceed?</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This action cannot be undone. Please confirm to continue.</p>
        </CardContent>
        <CardFooter className="gap-2">
          <Button variant="outline" className="flex-1">Cancel</Button>
          <Button className="flex-1">Confirm</Button>
        </CardFooter>
      </Card>
    </Preview>
  )
}
