import { AppSidebar } from "@/components/app-sidebar";
import { PropertiesStats } from "@/components/properties-stats";
import { PropertiesTable } from "@/components/properties-table";
import { SiteHeader } from "@/components/site-header";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import React from "react";

const Page = () => {
  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarProvider className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset>
            <div className="flex flex-1 flex-col gap-6 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">
                    Properties
                  </h1>
                  <p className="text-muted-foreground">
                    Manage and view all property listings
                  </p>
                </div>
              </div>
              <PropertiesStats />
              <PropertiesTable />
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default Page;
