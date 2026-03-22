import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import React from 'react'

interface CustomToolbarProps {
    date: Date;
    onNavigate: (action: "PREV" | "NEXT" | "TODAY") => void;
}

const CustomToolbar = ({
    date,
    onNavigate
}:CustomToolbarProps) => {
  return (
    <div className='flex mb-4 gap-x-2 items-center w-full lg:w-auto justify-center lg:justify-start'>
    <Button
      variant="secondary"
      size="icon"
      onClick={() => onNavigate("PREV")}
      className='flex items-center'
    >
      <ChevronLeftIcon className='size-4'/>
    </Button>
    <Button
      variant="secondary"
      onClick={() => onNavigate("TODAY")}
      className='flex items-center'
    >
      <CalendarIcon className='size-4 mb-0.5'/>
      <p className='text-sm font-medium'>{format(date, "MMMM yyyy")}</p>
    </Button>
    <Button
      variant="secondary"
      size="icon"
      onClick={() => onNavigate("NEXT")}
      className='flex items-center'
    >
      <ChevronRightIcon className='size-4'/>
        </Button>
    </div>
  )
}

export default CustomToolbar