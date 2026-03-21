import Navbar from '@/components/navbar'
import Sidebar from '@/components/sidebar'
import { CreateProjectModal } from '@/features/projects/components/create-project-modal'
import { CreateTaskModal } from '@/features/tasks/components/create-task-modal'
import { EditTaskModal } from '@/features/tasks/components/edit-task-modal'
import { CreateWorkspaceModal } from '@/features/workspaces/components/create-workspace-modal'
import React from 'react'

const DashboardLayout = ({
    children
}: {
    children: React.ReactNode
}) => {
    return (
        <div className='min-h-screen'>
            <CreateProjectModal/>
            <CreateWorkspaceModal/>
            <CreateTaskModal/>
            <EditTaskModal/>
            <div className='flex w-full h-full'>
                <div className='fixed left-0 top-0 hidden lg:block lg:w-66 h-full overflow-y-auto'>
                    <Sidebar />
                </div>
                <div className='lg:pl-66 w-full'>
                    <div className='mx-auto max-w-full h-full'>
                        <Navbar/>
                        <main className='h-full py-8 px-6 flex flex-col'>
                            {children}
                        </main>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DashboardLayout