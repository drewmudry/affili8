# Better Auth Rules & Patterns

This document outlines the correct patterns for using Better Auth in a Next.js/TypeScript application.

## Table of Contents

1. [Client-Side (React Components)](#client-side-react-components)
2. [Server-Side (Server Components & Actions)](#server-side-server-components--actions)
3. [Route Protection (Proxy)](#route-protection-proxy)
4. [Best Practices](#best-practices)

---

## Client-Side (React Components)

### Step A: Create the Client Helper

Create a file at `@/lib/auth-client.ts`:

```typescript
import { createAuthClient } from "better-auth/react";

const baseURL = process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000";

export const authClient = createAuthClient({
  baseURL,
});

export type Session = typeof authClient.$Infer.Session;
```

**Important:**
- Use `NEXT_PUBLIC_` prefix for environment variables that need to be accessible in the browser
- The client provides hooks like `useSession` that automatically manage loading states and data fetching
- No context provider needed

### Step B: Use it in a Component

In any **Client Component** where you need user data, use the hook:

```typescript
"use client"

import { authClient } from "@/lib/auth-client"

export default function UserProfile() {
  const { 
    data: session, 
    isPending, // loading state
    error 
  } = authClient.useSession()

  if (isPending) return <div>Loading...</div>
  if (!session) return <div>Not signed in</div>

  return (
    <div>
      <h1>Hello, {session.user.name}</h1>
      <button onClick={() => authClient.signOut()}>Sign Out</button>
    </div>
  )
}
```

**Key Points:**
- Must use `"use client"` directive
- `isPending` indicates loading state
- `error` contains any error information
- `data: session` contains the session object when available
- Use `authClient.signOut()` for logout

### Example: Interactive Component

For interactive parts (like logout buttons), extract them into separate client components:

```typescript
// src/app/dashboard/user-pill.tsx
"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import type { Session } from "@/lib/auth-client";

interface UserPillProps {
  session: Session;
}

export function UserPill({ session }: UserPillProps) {
  const router = useRouter();
  const user = session.user;

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/");
  };

  return (
    <button onClick={handleLogout}>
      {/* User pill UI */}
    </button>
  );
}
```

---

## Server-Side (Server Components & Actions)

In Next.js App Router, you **don't use hooks on the server**. You use the auth instance to check headers directly.

### Server Component Example

```typescript
// app/dashboard/page.tsx
import { auth } from "@/lib/auth" // your main server config file
import { headers } from "next/headers"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers() // 'await headers()' is required in Next.js 15+
  })

  if (!session) {
    return redirect("/sign-in")
  }

  return (
    <main>
      <h1>Welcome back, {session.user.name}</h1>
      <p>Your email is: {session.user.email}</p>
    </main>
  )
}
```

**Key Points:**
- **No `"use client"` directive** - this is a Server Component
- Use `auth.api.getSession({ headers: await headers() })`
- `await headers()` is **required** in Next.js 15+
- Use `redirect()` from `next/navigation` for redirects
- Can pass session data as props to client components

### Server Action Example

```typescript
"use server"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export async function someAuthenticatedAction() {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) {
    throw new Error("Not authenticated")
  }

  // Perform authenticated action
  return { success: true }
}
```

---

## Route Protection (Proxy)

While you can check auth in every page, the **recommended scalable way** to protect routes is using a **Proxy** (Next.js 16+). This prevents the page from even trying to render if the user isn't logged in.

### Proxy Configuration

Create `proxy.ts` at the root of your project:

```typescript
// proxy.ts
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  // Check if the user is accessing a protected route
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // THIS IS NOT SECURE!
    // This is the recommended approach to optimistically redirect users
    // We recommend handling auth checks in each page/route
    if (!session) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  runtime: "nodejs", // Required for auth.api calls
  matcher: ["/dashboard/:path*"], // Specify the routes the proxy applies to
};
```

**Key Points:**
- Proxy runs **before** the page renders
- Use `runtime: "nodejs"` to enable full session validation
- `matcher` specifies which routes to protect
- Still recommended to check auth in each page/route for security

### Alternative: Cookie-Only Check (Faster but Less Secure)

For faster checks without database calls:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
```

---

## Best Practices

### 1. Don't Build an AuthContext

❌ **Don't do this:**
```typescript
// Don't create AuthContext.tsx
const AuthContext = createContext(...)
```

✅ **Do this:**
- Use `authClient` directly in client components
- Use `auth` directly in server components
- No context provider needed

### 2. Server Components for Data Fetching

✅ **Prefer Server Components:**
- Better performance (runs on server)
- Direct database access
- No client-side JavaScript needed

```typescript
// Server Component
export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() });
  // ...
}
```

### 3. Client Components Only for Interactivity

✅ **Use Client Components only when needed:**
- Buttons with onClick handlers
- Forms with onSubmit
- Interactive UI elements

```typescript
"use client"
// Only for interactive parts
```

### 4. Environment Variables

**Server-side:**
```env
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=your-secret-here
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

**Client-side (must have NEXT_PUBLIC_ prefix):**
```env
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
```

### 5. Type Safety

Use the inferred types from your auth client:

```typescript
import type { Session } from "@/lib/auth-client";

interface Props {
  session: Session;
}
```

### 6. Error Handling

**Client-side:**
```typescript
const { data: session, isPending, error } = authClient.useSession();

if (error) {
  return <div>Error: {error.message}</div>;
}
```

**Server-side:**
```typescript
const session = await auth.api.getSession({ headers: await headers() });

if (!session) {
  redirect("/sign-in");
}
```

---

## Summary

### Client-Side Pattern
1. ✅ Create `@/lib/auth-client.ts` with `createAuthClient`
2. ✅ Use `authClient.useSession()` in client components
3. ✅ No context provider needed

### Server-Side Pattern
1. ✅ Import `auth` from `@/lib/auth`
2. ✅ Use `auth.api.getSession({ headers: await headers() })`
3. ✅ Use `redirect()` for unauthenticated users

### Route Protection
1. ✅ Use `proxy.ts` for optimistic redirects
2. ✅ Still check auth in each page/route for security
3. ✅ Use `runtime: "nodejs"` for full session validation

---

## File Structure

```
src/
├── lib/
│   ├── auth.ts              # Server-side auth config
│   └── auth-client.ts       # Client-side auth helper
├── app/
│   ├── dashboard/
│   │   ├── page.tsx         # Server Component (uses auth.api.getSession)
│   │   └── user-pill.tsx    # Client Component (uses authClient.useSession)
│   └── sign-in/
│       └── page.tsx         # Client Component (uses authClient.signIn)
proxy.ts                     # Route protection proxy
```

---

## Common Mistakes to Avoid

❌ **Don't use hooks in Server Components:**
```typescript
// ❌ WRONG - hooks don't work in server components
export default async function Page() {
  const { data } = authClient.useSession(); // ERROR!
}
```

❌ **Don't create an AuthContext:**
```typescript
// ❌ WRONG - Better Auth doesn't need this
const AuthContext = createContext(...);
```

❌ **Don't forget to await headers() in Next.js 15+:**
```typescript
// ❌ WRONG - headers() must be awaited in Next.js 15+
const session = await auth.api.getSession({
  headers: headers() // Missing await!
});
```

✅ **Correct patterns are documented above!**

