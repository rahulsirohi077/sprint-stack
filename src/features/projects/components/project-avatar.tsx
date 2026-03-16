import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import React from 'react'
import { string } from 'zod';

interface ProjectAvatarProps {
    image?: string;
    name?: string;
    className?: string;
    fallbackClassName?: string;
}

const ProjectAvatar = ({
    image,
    name,
    className,
    fallbackClassName
}:ProjectAvatarProps) => {

    if(image){
        return (
            <div className={cn(
                'size-10 relative rounded-md overflow-hidden',
                className
            )}>
                <Image src={image} alt={name!} className='object-cover p-1' fill/>
            </div>
        )
    }

    return (
        <Avatar className={cn(
            "size-10 p-1 rounded-md",
            className
        )}>
            <AvatarFallback className={cn(
                'text-white bg-blue-600 font-semibold text-sm uppercase rounded-md',
                fallbackClassName
            )}>
                {name?.charAt(0)}
            </AvatarFallback>
        </Avatar>
    )
}

export default ProjectAvatar