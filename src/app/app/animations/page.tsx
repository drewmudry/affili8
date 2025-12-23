import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/index";
import { animations } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AnimationsPageClient } from "./animations-client";

export default async function AnimationsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return redirect("/sign-in");
  }

  const user = session.user;

  // Get user's animations
  const userAnimations = await db
    .select()
    .from(animations)
    .where(eq(animations.userId, user.id))
    .orderBy(desc(animations.createdAt));

  const animationData = userAnimations.map((animation) => ({
    id: animation.id,
    videoUrl: animation.videoUrl,
    prompt: animation.prompt,
    avatarId: animation.avatarId,
    createdAt: animation.createdAt,
    updatedAt: animation.updatedAt,
  }));

  return (
    <SidebarProvider>
      <AppSidebar user={{
        name: user.name || "User",
        email: user.email || "",
        avatar: user.image || null,
      }} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4 flex-1">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/app">
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Animations</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                  Animations
                </h1>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                  Animated versions of your avatars
                </p>
              </div>
            </div>
            <AnimationsPageClient animations={animationData} />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
