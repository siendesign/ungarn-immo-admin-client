"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import React, { use, useState } from "react";
import {
  Search,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  MapPin,
  Users,
  TrendingUp,
  Home,
  RefreshCw,
  Download,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  Building,
  Map,
  ImageIcon,
} from "lucide-react";
import {
  useGetAllVillagesQuery,
  useGetVillageStatsQuery,
  useGetCountiesQuery,
  useDeleteVillageMutation,
  useUpdateVillageStatusMutation,
  
} from "@/state/api";
import { useRouter } from "next/navigation";

const VillageAdminPage = () => {
    const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [countyFilter, setCountyFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit] = useState(50);
  const [deleteVillageId, setDeleteVillageId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Fetch data
  const {
    data: villagesData,
    isLoading,
    error,
    refetch,
  } = useGetAllVillagesQuery({
    page: currentPage,
    limit: pageLimit,
    search: searchTerm || undefined,
    county: countyFilter !== "all" ? countyFilter : undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });

  const { data: statsData } = useGetVillageStatsQuery();
  const { data: countiesData } = useGetCountiesQuery();
  const [deleteVillage] = useDeleteVillageMutation();
  const [updateStatus] = useUpdateVillageStatusMutation();

  const handleDeleteVillage = (villageId: string) => {
    setDeleteVillageId(villageId);
  };

  const confirmDelete = async () => {
    if (deleteVillageId) {
      try {
        await deleteVillage(deleteVillageId).unwrap();
        refetch();
      } catch (error) {
        console.error("Failed to delete village:", error);
      } finally {
        setDeleteVillageId(null);
      }
    }
  };

  const handleStatusChange = async (villageId: string, status: string) => {
    try {
      await updateStatus({ id: villageId, status }).unwrap();
      refetch();
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handleExportData = () => {
    if (!villagesData) return;

    const headers = [
      "Name",
      "County",
      "Population",
      "Status",
      "Properties",
      "Created",
    ];
    const rows = villagesData.villages.map((v) => [
      v.name,
      v.county,
      v.population,
      v.status,
      v._count?.exposes || 0,
      new Date(v.createdAt).toLocaleDateString(),
    ]);
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `villages-export-${new Date().toISOString()}.csv`;
    a.click();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return "bg-green-500";
      case "IN_REVIEW":
        return "bg-yellow-500";
      case "REJECTED":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return <CheckCircle className="h-4 w-4" />;
      case "IN_REVIEW":
        return <Clock className="h-4 w-4" />;
      case "REJECTED":
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setCountyFilter("all");
    setCurrentPage(1);
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
                      Village Management
                    </h1>
                    <p className="text-muted-foreground">
                      Manage village information and infrastructure
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={refetch}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                    <Button variant="outline" onClick={handleExportData}>
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    <Button onClick={() => router.push('/villages/new')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Village
                    </Button>
                  </div>
                </div>

                {/* Statistics Cards */}
                {statsData && (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Total Villages
                        </CardTitle>
                        <Map className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {statsData.overview.totalVillages}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          +{statsData.overview.recentVillageCount} this month
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Published
                        </CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {statsData.overview.publishedVillages}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Active villages
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          In Review
                        </CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {statsData.overview.inReviewVillages}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Awaiting approval
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Total Population
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {statsData.overview.totalPopulation.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Avg: {statsData.overview.averagePopulation}
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Top Village
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-lg font-bold truncate">
                          {statsData.topVillages[0]?.name || "N/A"}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {statsData.topVillages[0]?.propertiesCount || 0}{" "}
                          properties
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Search and Filters */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Search & Filter</CardTitle>
                      <Button variant="ghost" size="sm" onClick={clearFilters}>
                        Clear All
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-4 md:flex-row">
                        <div className="relative flex-1">
                          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="search"
                            placeholder="Search villages..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </div>
                        <Select
                          value={statusFilter}
                          onValueChange={setStatusFilter}
                        >
                          <SelectTrigger className="w-full md:w-[180px]">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="PUBLISHED">Published</SelectItem>
                            <SelectItem value="IN_REVIEW">In Review</SelectItem>
                            <SelectItem value="REJECTED">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select
                          value={countyFilter}
                          onValueChange={setCountyFilter}
                        >
                          <SelectTrigger className="w-full md:w-[180px]">
                            <SelectValue placeholder="County" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Counties</SelectItem>
                            {countiesData?.counties.map((county) => (
                              <SelectItem key={county} value={county}>
                                {county}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="flex gap-2">
                          <Button
                            variant={
                              viewMode === "table" ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => setViewMode("table")}
                          >
                            Table
                          </Button>
                          <Button
                            variant={viewMode === "grid" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setViewMode("grid")}
                          >
                            Grid
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Separator />

              {/* Villages Display */}
              <div className="flex-1">
                {isLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-lg text-muted-foreground">
                      Loading villages...
                    </div>
                  </div>
                ) : error ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-lg text-red-500">
                      Error loading villages
                    </div>
                  </div>
                ) : villagesData && villagesData.villages.length > 0 ? (
                  <>
                    {viewMode === "table" ? (
                      <Card>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-16">Thumbnail</TableHead>
                              <TableHead>Village</TableHead>
                              <TableHead>County</TableHead>
                              <TableHead>Population</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Properties</TableHead>
                              <TableHead>Infrastructure</TableHead>
                              <TableHead>Created</TableHead>
                              <TableHead className="text-right">
                                Actions
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {villagesData.villages.map((village) => (
                              <TableRow key={village.id}>
                                <TableCell>
                                  <div className="w-12 h-12 rounded-md overflow-hidden bg-muted flex items-center justify-center">
                                    {(village as any).thumbnailUrl ? (
                                      /* eslint-disable-next-line @next/next/no-img-element */
                                      <img
                                        src={(village as any).thumbnailUrl}
                                        alt={village.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          const target = e.target as HTMLImageElement;
                                          target.style.display = 'none';
                                          target.parentElement!.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>';
                                        }}
                                      />
                                    ) : (
                                      <ImageIcon className="h-5 w-5 text-muted-foreground" />
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-col">
                                    <span className="font-medium">
                                      {village.name}
                                    </span>
                                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                                      <MapPin className="h-3 w-3" />
                                      {village.latitude.toFixed(4)},{" "}
                                      {village.longitude.toFixed(4)}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell>{village.county}</TableCell>
                                <TableCell>
                                  <span className="font-medium">
                                    {village.population.toLocaleString()}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    className={getStatusColor(village.status)}
                                  >
                                    <span className="flex items-center gap-1">
                                      {getStatusIcon(village.status)}
                                      {village.status.replace("_", " ")}
                                    </span>
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline">
                                    <Home className="h-3 w-3 mr-1" />
                                    {village._count?.exposes || 0}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex gap-1">
                                    {village.infrastructure && (
                                      <Badge variant="outline" className="text-xs">
                                        Info
                                      </Badge>
                                    )}
                                    {village.internet && (
                                      <Badge variant="outline" className="text-xs">
                                        Net
                                      </Badge>
                                    )}
                                    {village.transport && (
                                      <Badge variant="outline" className="text-xs">
                                        Trans
                                      </Badge>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {new Date(
                                    village.createdAt
                                  ).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuLabel>
                                        Actions
                                      </DropdownMenuLabel>
                                      <DropdownMenuSeparator />
                                      {/* <DropdownMenuItem>
                                        <Eye className="h-4 w-4 mr-2" />
                                        View Details
                                      </DropdownMenuItem> */}
                                      <DropdownMenuItem onClick={() => {router.push(`/villages/edit/${village.id}`)}}>
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit
                                      </DropdownMenuItem>
                                      {village.status !== "PUBLISHED" && (
                                        <DropdownMenuItem
                                          onClick={() =>
                                            handleStatusChange(
                                              village.id,
                                              "PUBLISHED"
                                            )
                                          }
                                        >
                                          <CheckCircle className="h-4 w-4 mr-2" />
                                          Publish
                                        </DropdownMenuItem>
                                      )}
                                      {village.status !== "REJECTED" && (
                                        <DropdownMenuItem
                                          onClick={() =>
                                            handleStatusChange(
                                              village.id,
                                              "REJECTED"
                                            )
                                          }
                                        >
                                          <XCircle className="h-4 w-4 mr-2" />
                                          Reject
                                        </DropdownMenuItem>
                                      )}
                                      <DropdownMenuItem
                                        className="text-red-600"
                                        onClick={() =>
                                          handleDeleteVillage(village.id)
                                        }
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </Card>
                    ) : (
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {villagesData.villages.map((village) => (
                          <Card key={village.id} className="overflow-hidden pt-0">
                            {/* Thumbnail Image */}
                            <div className="relative w-full h-40 bg-muted ">
                              {(village as any).thumbnailUrl ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                  src={(village as any).thumbnailUrl}
                                  alt={village.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    if (target.nextElementSibling) {
                                      (target.nextElementSibling as HTMLElement).style.display = 'flex';
                                    }
                                  }}
                                />
                              ) : null}
                              <div 
                                className={`absolute inset-0 flex items-center justify-center ${(village as any).thumbnailUrl ? 'hidden' : 'flex'}`}
                              >
                                <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
                              </div>
                            </div>
                            <CardHeader className="pb-2">
                              <div className="flex items-start justify-between">
                                <div>
                                  <CardTitle className="text-lg">
                                    {village.name}
                                  </CardTitle>
                                  <CardDescription className="flex items-center gap-1 mt-1">
                                    <Building className="h-3 w-3" />
                                    {village.county}
                                  </CardDescription>
                                </div>
                                <Badge
                                  className={getStatusColor(village.status)}
                                >
                                  {village.status.replace("_", " ")}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-muted-foreground">
                                    Population
                                  </span>
                                  <span className="font-medium">
                                    {village.population.toLocaleString()}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-muted-foreground">
                                    Properties
                                  </span>
                                  <span className="font-medium">
                                    {village._count?.exposes || 0}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <MapPin className="h-3 w-3" />
                                  {village.latitude.toFixed(4)},{" "}
                                  {village.longitude.toFixed(4)}
                                </div>
                              </div>
                            </CardContent>
                            <CardFooter className="flex justify-between">
                              <Button variant="outline" size="sm" onClick={() => {router.push(`/villages/edit/${village.id}`)}}>
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>
                                    Actions
                                  </DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => {router.push(`/villages/edit/${village.id}`)}}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() =>
                                      handleDeleteVillage(village.id)
                                    }
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                    )}

                    {/* Pagination */}
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm text-muted-foreground">
                        Showing {villagesData.villages.length} of{" "}
                        {villagesData.pagination.total} villages
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(currentPage - 1)}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={
                            currentPage === villagesData.pagination.totalPages
                          }
                          onClick={() => setCurrentPage(currentPage + 1)}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center h-64 text-center">
                      <Map className="h-16 w-16 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        No villages found
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Try adjusting your search or filters
                      </p>
                      <Button variant="outline" onClick={clearFilters}>
                        Clear Filters
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteVillageId}
        onOpenChange={() => setDeleteVillageId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the village and all its associated
              data. Properties linked to this village will remain but will need
              to be reassigned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default VillageAdminPage;