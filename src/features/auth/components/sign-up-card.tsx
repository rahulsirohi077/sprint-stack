import { DottedSeparator } from '@/components/dotted-separator'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import React from 'react'
import { useForm } from 'react-hook-form'
import { FaGithub } from 'react-icons/fa'
import { FcGoogle } from 'react-icons/fc'
import z from 'zod'
import { signUpSchema } from '../schemas'
import { useRegister } from '../api/use-register'


const SignUpCard = () => {
    const { mutate } = useRegister();

    const form = useForm<z.infer<typeof signUpSchema>>({
            resolver: zodResolver(signUpSchema),
            defaultValues: {
                name:"",
                email: "",
                password: ""
            }
        })

    const onSubmit = (values: z.infer<typeof signUpSchema>) => {
            mutate({json:values})
        }
    
  return (
    <Card className='w-full h-full md:w-121.75 border-none shadow-sm'>
        <CardHeader className='flex flex-col items-center justify-center text-center'>
            <CardTitle className='text-2xl'>
                Sign Up
            </CardTitle>
            <CardDescription>
                By Siging up, you agree to our{" "}
                <Link href={'/privacy'}>
                    <span className='text-blue-700'>Privacy Policy</span>
                </Link>{" "}
                and {" "}
                <Link href={'/terms'}>
                    <span className='text-blue-700'>Terms of Service</span>
                </Link>
            </CardDescription>
        </CardHeader>
        <div className='px-7'>
            <DottedSeparator/>
        </div>
        <CardContent>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
                <FormField
                    name='name'
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <Input
                                    {...field}
                                    type='text'
                                    placeholder='Enter Your Name'
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
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
                <Button disabled={false} size={'lg'} className='w-full'>
                    Sign Up
                </Button>
            </form>
            </Form>
        </CardContent>
        <div className='px-7'>
            <DottedSeparator/>
        </div>
        <CardContent className='flex flex-col gap-y-4'>
            <Button 
                disabled={false}
                variant={"secondary"}
                size={"lg"}
                className='w-full'
            >
                <FcGoogle className='mr-2 size-5'/>
                Login with Google
            </Button>
            <Button 
                disabled={false}
                variant={"secondary"}
                size={"lg"}
                className='w-full'
            >
                <FaGithub className='mr-2 size-5'/>
                Login with Github
            </Button>
        </CardContent>
         <div className='px-7'>
                <DottedSeparator/>
            </div>
            <CardContent className='flex items-center justify-center'>
                <p>
                    Already have an account?{" "}
                    <Link href={"/sign-in"}>
                        <span className='text-blue-700'>Sign In</span>
                    </Link> 
                </p>
            </CardContent>
    </Card>
  )
}

export { SignUpCard }