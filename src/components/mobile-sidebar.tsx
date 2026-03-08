import React from 'react'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from './ui/sheet'
import { Button } from './ui/button'
import { MenuIcon } from 'lucide-react'
import Sidebar from './sidebar'

const MobileSidebar = () => {
  return (
    <Sheet modal={false}>
        <SheetTrigger asChild>
            <Button variant={'secondary'} size={'icon'} className='lg:hidden'>
                <MenuIcon/>
            </Button>
        </SheetTrigger>
        <SheetContent side='left' className='p-0'>
            <SheetTitle className='sr-only'>Sidebar</SheetTitle>
            <Sidebar/>
        </SheetContent>
    </Sheet>
  )
}

export default MobileSidebar