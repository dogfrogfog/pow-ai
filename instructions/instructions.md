# Product Requirements Document (PRD)

## Project Overview

You are building a platform where users can generate a document in their preferred programming language, with the ability to download the document later. The platform will be built using Next.js 14, shadcn, Tailwind CSS, and Lucid Icons.

## Core Functionalities

### 1. Document Creation

- Users can create a new document by selecting a programming language.
- Generated code should be editable in markdown format.
- Users can save and download the generated file once satisfied.

### 2. Document Generation

- Documents are generated using AI in the specified programming language.
- All generations are saved to a database and linked to the user.
- Implement generation using the Vercel AI SDK package.

### 3. Document - user relation

- Each generated document should be stored in redis database. Use package ioredis.
- Key of each generation should be a uuid
- Each user should have a relation to the creeated document
- Userv relations to the documents should be stored in publicMetadata field of user clerk object - docs: https://clerk.com/docs/references/javascript/user/user

### 4. Document Management

- Users can view a list of previously generated documents.
- Documents are displayed as cards, with sorting and filtering options.
- Users can edit document parameters directly from the card view.

### 5. Public Examples

- The main page will showcase publicly available examples of generated documents.
- Users can preview these documents.

### 6. Authentication

- Users must sign up and log in to access the application.
- All features are disabled for unauthenticated users.
- Use Clerk for authentication, with login/signup buttons in the header.

### 7. Subscription

- Users can subscribe to the app using Stripe.
- Subscriptions are linked to user accounts.
- Non-subscribers can create only one generation, encouraging subscription.
- Include Stripe billing links for easy subscription management.

## Current File Structure

├── /app
│ ├── /api
│ │ └── [api-routes].ts
│ ├── /dashboard
│ │ ├── page.tsx
│ │ └── [other-pages].tsx
│ ├── layout.tsx
│ └── page.tsx
├── /src
│ ├── /components
│ │ ├── example-component.tsx
│ │ ├── app-sidebar.tsx
│ │ ├── nav-main.tsx
│ │ ├── nav-projects.tsx
│ │ ├── nav-secondary.tsx
│ │ ├── nav-user.tsx
│ │ ├── storage-card.tsx
│ │ ├── team-switcher.tsx
│ │ └── /ui
│ ├── /hooks
│ │ ├── use-mobile.tsx
│ │ └── use-sidebar.tsx
│ └── /lib
│ └── utils.ts
├── /public
│ └── favicon.ico
├── /styles
│ └── globals.css
├── .env.local
├── .gitignore
├── next-env.d.ts
├── next.config.mjs
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
└── tsconfig.json

## Additional Requirements

1. **Project Setup**

   - New components should be placed in `/src/components` and named like `example-component.tsx`.
   - New pages should be added to `/app`.
   - Use the Next.js 14 app router.
   - Perform data fetching in server components and pass data as props.
   - Client components must include `'use client'` at the top of the file.

2. **Server-Side API Calls**

   - Interact with external APIs server-side.
   - Create dedicated API routes in the `app/api` directory.
   - Fetch data through these API routes in client-side components.

3. **Environment Variables**

   - Store sensitive information in environment variables.
   - Use a `.env.local` file for local development and ensure it's in `.gitignore`.
   - Set environment variables in the deployment platform for production.

4. **Error Handling and Logging**

   - Implement comprehensive error handling in both client-side and server-side code.
   - Log errors server-side for debugging.
   - Display user-friendly error messages client-side.

5. **Type Safety**

   - Use TypeScript interfaces for all data structures.
   - Avoid using `any` type; define proper types for all variables and function parameters.

6. **API Client Initialization**
   - Initialize API clients in server-side code only.
   - Ensure API clients are properly initialized before use.
