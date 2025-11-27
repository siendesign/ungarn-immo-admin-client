"use client";
import { AppSidebar } from "@/components/app-sidebar";
import Routing from "@/components/routing";
import { SiteHeader } from "@/components/site-header";
import StatsComponent from "@/components/stats-component";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useGetAuthUserQuery } from "@/state/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const iframeHeight = "800px";

export const description = "A sidebar with a header and a search form.";

export default function Page() {
  const { data: authData, refetch, isLoading } = useGetAuthUserQuery();
  const router = useRouter();
  useEffect(() => {
    if (isLoading) return;
    if (!authData || authData?.user.role !== "ADMIN") {
      console.log("User not logged in, redirecting...");
      // Redirect to dashboard or another page
      router.push("/login");
    }
  }, [authData , isLoading, router]);

   // Don't render the admin panel if not authenticated
  if (!authData?.user || authData?.user?.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="[--header-height:calc(--spacing(14))]">
      {/* <Routing /> */}
      <SidebarProvider className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset>
            <div className="flex flex-1 flex-col gap-4 p-4">
              <StatsComponent />
              {/* <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                <div className="bg-muted/50 aspect-video rounded-xl" />
                <div className="bg-muted/50 aspect-video rounded-xl" />
                <div className="bg-muted/50 aspect-video rounded-xl" />
              </div>
              <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" /> */}
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}
