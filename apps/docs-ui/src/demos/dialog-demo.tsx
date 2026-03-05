'use client'

import {
  Dialog, DialogTrigger, DialogContent, DialogClose,
  DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@choblue/ui/dialog'
import { Button } from '@choblue/ui/button'
import { Preview } from './preview'

export function DialogBasic() {
  return (
    <Preview>
      <Dialog>
        <DialogTrigger asChild>
          <Button>Open Dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
            <DialogDescription>
              This is a dialog description. You can put any content here.
            </DialogDescription>
          </DialogHeader>
          <div className="p-6 pt-0">
            <p className="text-sm text-foreground">Dialog body content.</p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button>Confirm</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Preview>
  )
}
