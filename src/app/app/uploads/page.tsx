import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getUserUploads } from "@/actions/uploads";
import { UploadModal } from "@/components/uploads/upload-modal";
import { UploadList } from "@/components/uploads/upload-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb";

export default async function UploadsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  // Get uploads where demo=false
  const allUploads = await getUserUploads(undefined, false);
  const images = allUploads.filter(u => u.type === 'image');
  const videos = allUploads.filter(u => u.type === 'video');

  return (
    <SidebarProvider>
      <AppSidebar user={{
        name: session.user.name || "User",
        email: session.user.email || "",
        avatar: session.user.image || null,
      }} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Uploads</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        
        <div className="p-4 pt-0 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Content Library</h1>
              <p className="text-muted-foreground">Manage your videos and images.</p>
            </div>
            <UploadModal />
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">All Content</TabsTrigger>
              <TabsTrigger value="image">Images</TabsTrigger>
              <TabsTrigger value="video">Videos</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4">
              <UploadList uploads={allUploads} />
            </TabsContent>
            <TabsContent value="image" className="mt-4">
              <UploadList uploads={images} />
            </TabsContent>
            <TabsContent value="video" className="mt-4">
              <UploadList uploads={videos} />
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
