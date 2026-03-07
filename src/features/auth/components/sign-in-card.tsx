"use client"
import { DottedSeparator } from '@/components/dotted-separator'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import React from 'react'
import { useForm } from 'react-hook-form'
import { FaGithub } from 'react-icons/fa'
import { FcGoogle } from 'react-icons/fc'
import z from 'zod'
import { loginSchema } from '../schemas'
import { useLogin } from '../api/use-login'


const SignInCard = () => {
    const {mutate, isPending} = useLogin();
    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: ""
        }
    })

    const onSubmit = (values: z.infer<typeof loginSchema>) => {
       mutate({json: values});
    };

    return (
        <Card className='w-full h-full md:w-121.75 border-none shadow-sm'>
            <CardHeader className='flex items-center justify-center text-center'>
                <CardTitle className='text-2xl'>
                    WELCOME BACK!
                </CardTitle>
            </CardHeader>
            <div className='px-7'>
                <DottedSeparator />
            </div>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
                        <FormField
                            name='email'
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type='email'
                                            placeholder='Enter Email Address'
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            name='password'
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type='password'
                                            placeholder='Enter Password'
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button disabled={isPending} size={'lg'} className='w-full'>
                            Login
                        </Button>
                    </form>
                </Form>
            </CardContent>
            <div className='px-7'>
                <DottedSeparator />
            </div>
            <CardContent className='flex flex-col gap-y-4'>
                <Button
                    disabled={isPending}
                    variant={"secondary"}
                    size={"lg"}
                    className='w-full'
                >
                    <FcGoogle className='mr-2 size-5' />
                    Login with Google
                </Button>
                <Button
                    disabled={isPending}
                    variant={"secondary"}
                    size={"lg"}
                    className='w-full'
                >
                    <FaGithub className='mr-2 size-5' />
                    Login with Github
                </Button>
            </CardContent>
            <div className='px-7'>
                <DottedSeparator/>
            </div>
            <CardContent className='flex items-center justify-center'>
                <p>
                    Don&apos;t have an account?{" "}
                    <Link href={"/sign-up"}>
                        <span className='text-blue-700'>Sign Up</span>
                    </Link> 
                </p>
            </CardContent>
        </Card>
    )
}

export { SignInCard }