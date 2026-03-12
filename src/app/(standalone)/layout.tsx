import { UserButton } from '@/features/auth/components/user-button'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const StandaloneLayout = ({
    children
}: {
    children: React.ReactNode
}) => {
    return (
        <main className='bg-neutral-100 min-h-screen'>
            <div className='mx-auto max-w-11/12 p-4'>
                <nav className='flex justify-between items-center h-18.25'>
                    <Link href={'/'} className='flex gap-2 items-center'>
                        <Image
                            src={'/logo.svg'}
                            alt='logo'
                            width={70}
                            height={40} />
                        <span className='text-xl font-semibold'>Sprint Stack</span>
                    </Link>
                    <UserButton/>
                </nav>
                <div className='flex flex-col items-center justify-center py-4'>
                    {children}
                </div>
            </div>
        </main>
    )
}

export default StandaloneLayout