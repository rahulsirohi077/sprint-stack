import { UserButton } from '@/features/auth/components/user-button'
import React from 'react'

const Navbar = () => {
  return (
    <div className='pt-4 px-6 flex items-center justify-between'>
        <div className='flex-col hidden lg:flex'>
            <h1 className='text-xl'>Home</h1>
            <p className='text-muted-foreground'>Monitor all of your projects and tasks here</p>
        </div>
        <UserButton/>
    </div>
  )
}

export default Navbar