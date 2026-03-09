import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { DottedSeparator } from './dotted-separator'
import Navigation from './navigation'
import WorkspaceSwitcher from './workspace-switcher'

const Sidebar = () => {
    return (
        <aside className='h-full bg-neutral-100 p-4 w-full space-y-4'>
            <Link href={"/"}>
            <div className='flex items-center justify-center gap-2'>
                <Image 
                    src={'/logo.svg'} 
                    alt='logo'
                    width={70}
                    height={40} 
                />
                <div className='text-xl font-semibold'>
                    Sprint Stack
                </div>
            </div>
                
            </Link>
            <DottedSeparator className='mt-2'/>
            <WorkspaceSwitcher />
            <DottedSeparator className='mt-2'/>
            <Navigation />
        </aside>
    )
}

export default Sidebar