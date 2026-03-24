# Sprint Stack

Sprint Stack is a full-stack project management application built with Next.js, React, Hono, and Appwrite. It supports authentication, multi-workspace collaboration, member roles, project organization, task tracking, analytics, and multiple task views including table, kanban, and calendar.

## Overview

This project combines:

- Next.js App Router for the frontend and route layouts
- Hono for typed server API routes under `/api`
- Appwrite for auth, database access, storage, and OAuth
- TanStack Query for client-side data fetching and cache management
- React Hook Form and Zod for validated forms
- shadcn/ui and Radix primitives for the UI layer

The application is organized around feature modules such as auth, workspaces, projects, tasks, and members.

## Features

- Email/password authentication
- Google and GitHub OAuth login
- Workspace creation with optional image upload
- Invite-code based workspace joining
- Workspace member management with `ADMIN` and `MEMBER` roles
- Project creation, editing, deletion, and image upload
- Task creation, editing, deletion, filtering, and assignment
- Task views in table, kanban, and calendar formats
- Drag-and-drop task ordering with bulk status/position updates
- Workspace-level and project-level analytics comparing current month vs previous month
- Protected server-side redirects based on authenticated session state

## Tech Stack

### Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui
- Radix UI

### Data and API

- Hono
- Appwrite
- node-appwrite
- TanStack React Query

### Forms and Validation

- React Hook Form
- Zod
- `@hookform/resolvers`

### UI and Productivity Libraries

- Recharts
- `@hello-pangea/dnd`
- `react-big-calendar`
- `date-fns`
- `nuqs`
- `sonner`

## Application Flow

1. Users authenticate with email/password or OAuth.
2. An Appwrite session secret is stored in an HTTP-only cookie.
3. Protected API routes use Hono middleware to validate the session and load the current user.
4. Users are redirected to either workspace creation or their first workspace dashboard.
5. Inside a workspace, users can manage projects, tasks, members, and workspace settings.
6. Analytics endpoints aggregate task and project counts for dashboard cards.

## Project Structure

```text
src/
	app/                    Next.js App Router pages, grouped layouts, and API handlers
	components/             Shared UI and layout components
	features/
		auth/                 Authentication UI, hooks, schemas, and API routes
		workspaces/           Workspace CRUD, invite flow, analytics, and settings
		members/              Member listing, role updates, and removal
		projects/             Project CRUD, analytics, and modal/forms
		tasks/                Task CRUD, filters, board/table/calendar views
	hooks/                  Reusable client hooks
	lib/                    Appwrite clients, typed RPC client, middleware, and utilities
	config.ts               Appwrite database, table, and bucket identifiers
```

## Routing Notes

The application uses route groups to separate concerns:

- `(auth)` for sign-in and sign-up screens
- `(dashboard)` for the main authenticated workspace dashboard
- `(standalone)` for settings, members, project settings, and workspace join/create flows
- `api/[[...route]]` as the Hono entry point for all backend feature routes

## API Modules

The Hono API is mounted from a single entry point and exposes these modules:

- `/api/auth`
- `/api/workspaces`
- `/api/members`
- `/api/projects`
- `/api/tasks`

All protected routes use shared session middleware that loads:

- Appwrite `account`
- Appwrite `storage`
- Appwrite `tablesDB`
- authenticated `user`

## Appwrite Data Model

This project expects an Appwrite database and storage bucket configured through environment variables.

### Tables

#### Workspaces

- `name: string`
- `userId: string`
- `imageUrl?: string`
- `inviteCode: string`

#### Members

- `userId: string`
- `workspaceId: string`
- `role: ADMIN | MEMBER`

#### Projects

- `workspaceId: string`
- `name: string`
- `imageUrl?: string`

#### Tasks

- `workspaceId: string`
- `name: string`
- `projectId: string`
- `assigneeId: string`
- `description?: string`
- `dueDate: string`
- `status: BACKLOG | TODO | IN_PROGRESS | IN_REVIEW | DONE`
- `position: number`

### Storage

- One bucket for uploaded workspace and project images

## Environment Variables

Create a `.env.local` file in the project root and define the following variables:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000

NEXT_PUBLIC_APPWRITE_ENDPOINT=https://your-appwrite-endpoint/v1
NEXT_PUBLIC_APPWRITE_PROJECT=your_appwrite_project_id
NEXT_APPWRITE_KEY=your_appwrite_api_key

NEXT_PUBLIC_APPWRITE_DATABASE_ID=your_database_id
NEXT_PUBLIC_APPWRITE_WORKSPACES_ID=your_workspaces_table_id
NEXT_PUBLIC_APPWRITE_IMAGES_BUCKET_ID=your_images_bucket_id
NEXT_PUBLIC_APPWRITE_MEMBERS_ID=your_members_table_id
NEXT_PUBLIC_APPWRITE_PROJECTS_ID=your_projects_table_id
NEXT_PUBLIC_APPWRITE_TASKS_ID=your_tasks_table_id
```

## Local Setup

### Prerequisites

- Node.js 20 or newer
- npm
- An Appwrite project with Database, Storage, Auth, and OAuth configured

### Installation

```bash
npm install
```

### Run the development server

```bash
npm run dev
```

Open `http://localhost:3000` in the browser.

## Appwrite Setup Checklist

1. Create an Appwrite project.
2. Enable Email/Password auth.
3. Enable Google and GitHub OAuth if you want social login.
4. Create a database with tables for workspaces, members, projects, and tasks.
5. Create a storage bucket for uploaded images.
6. Generate an Appwrite API key with the permissions required for account, users, tables, and storage operations used by the server.
7. Add your local and production callback URLs for OAuth.
8. Copy all resulting IDs into `.env.local`.

## Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Implementation Highlights

- Typed client requests are generated with Hono's `hc` client.
- Server-side route guards use the Appwrite session cookie.
- Dashboard redirects are resolved on the server before rendering.
- React Query is used for feature-level mutations and data synchronization.
- Task UI supports filtering by project, assignee, status, search, and due date.

## Deployment Notes

- Set the same environment variables in your hosting platform.
- Make sure `NEXT_PUBLIC_APP_URL` matches the deployed domain.
- Configure Appwrite OAuth success and failure URLs for the deployed domain.
- If Appwrite storage is hosted on a remote domain, the Next.js image remote pattern is derived from `NEXT_PUBLIC_APPWRITE_ENDPOINT`.

## Repository Summary

Sprint Stack is structured as a modular, feature-oriented Next.js application with a typed Hono backend and Appwrite as the backend service layer. It is a solid base for a Jira-style collaboration tool with workspace isolation, role-based membership, and task management across multiple visual views.
