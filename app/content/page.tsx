"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Edit,
  RefreshCw,
  Languages,
  Clock,
  CheckCircle,
} from "lucide-react";
import { useGetPageConfigsQuery, useGetContentStatsQuery } from "@/state/api";
import { useRouter } from "next/navigation";

const ContentManagementPage = () => {
  const router = useRouter();
  const { data: configsData, isLoading, refetch } = useGetPageConfigsQuery();
  const { data: statsData } = useGetContentStatsQuery();

  const getLanguageLabel = (lang: string) => {
    switch (lang) {
      case "en":
        return "English";
      case "de":
        return "Deutsch";
      case "hu":
        return "Magyar";
      default:
        return lang;
    }
  };

  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarProvider className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset>
            <div className="flex flex-1 flex-col gap-4 p-4">
              {/* Header Section */}
              <div className="flex flex-col gap-4">
                <div className="flex md:items-center flex-col gap-4 md:flex-row justify-between">
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                      Content Management
                    </h1>
                    <p className="text-muted-foreground">
                      Manage website page content in all languages
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => refetch()}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                </div>

                {/* Statistics Cards */}
                {statsData && (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Total Pages
                        </CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {statsData.overview.totalPages}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Editable content pages
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Content Items
                        </CardTitle>
                        <Edit className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {statsData.overview.totalContent}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Total translations
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Languages
                        </CardTitle>
                        <Languages className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {statsData.overview.languages.length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {statsData.overview.languages.join(", ").toUpperCase()}
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Recent Updates
                        </CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {statsData.recentUpdates.length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Last 10 changes
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Content by Language */}
                {statsData && statsData.contentByLanguage.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Content by Language</CardTitle>
                      <CardDescription>
                        Translation coverage across languages
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-4 flex-wrap">
                        {statsData.contentByLanguage.map((item) => (
                          <div
                            key={item.language}
                            className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg"
                          >
                            <span className="font-medium">
                              {getLanguageLabel(item.language)}
                            </span>
                            <Badge variant="secondary">{item.count} items</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Pages Grid */}
              <div className="flex-1">
                <h2 className="text-xl font-semibold mb-4">Editable Pages</h2>
                {isLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-lg text-muted-foreground">
                      Loading pages...
                    </div>
                  </div>
                ) : configsData && configsData.pages.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {configsData.pages.map((page) => (
                      <Card
                        key={page.id}
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => router.push(`/content/${page.pageKey}`)}
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                {page.pageName}
                              </CardTitle>
                              <CardDescription className="mt-1">
                                {page.description}
                              </CardDescription>
                            </div>
                            <Badge
                              variant={page.isActive ? "default" : "secondary"}
                            >
                              {page.isActive ? (
                                <CheckCircle className="h-3 w-3 mr-1" />
                              ) : null}
                              {page.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">
                              {Array.isArray(page.sections)
                                ? page.sections.length
                                : 0}{" "}
                              editable sections
                            </div>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center h-64 text-center">
                      <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        No pages configured
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Page configurations will be created automatically
                      </p>
                      <Button variant="outline" onClick={() => refetch()}>
                        Refresh
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Recent Updates */}
              {statsData && statsData.recentUpdates.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Updates</CardTitle>
                    <CardDescription>
                      Latest content changes
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {statsData.recentUpdates.slice(0, 5).map((update, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between py-2 border-b last:border-0"
                        >
                          <div className="flex items-center gap-3">
                            <Badge variant="outline">{update.language.toUpperCase()}</Badge>
                            <span className="font-medium">{update.pageKey}</span>
                            <span className="text-muted-foreground">
                              → {update.sectionKey}
                            </span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(update.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default ContentManagementPage;
