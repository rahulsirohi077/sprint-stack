"use client"
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

interface AuthLayoutProps {
    children: React.ReactNode
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
    const pathname = usePathname();
    const isSignIn = pathname === '/sign-in'

    return (
        <main className='bg-neutral-100 min-h-screen'>
            <div className='mx-auto max-w-11/12 p-4'>
                <nav className='flex justify-between items-center'>
                    <div className='flex font-semibold text-xl justify-center items-center gap-2'>
                        <Image src={'/logo.svg'} alt='logo' width={60} height={50} />
                        <div className='hidden md:block'>
                            Sprint Stack
                        </div>
                    </div>
                    <Button asChild variant={'secondary'}>
                        <Link href={isSignIn ? "/sign-up" : "/sign-in"}>
                            {isSignIn ? "SignUp" : "Login"}
                        </Link>
                    </Button>
                </nav>
                <div className='flex flex-col items-center justify-center pt-4 md:pt-14'>
                    {children}
                </div>
            </div>
        </main>
    )
}

export default AuthLayout