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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React, { useState } from "react";
import {
  Search,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Users,
  UserCheck,
  Building2,
  ShoppingCart,
  Mail,
  Phone,
  RefreshCw,
  Download,
  TrendingUp,
  Home,
  Shield,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  useGetAllUsersQuery,
  useGetAllSellersQuery,
  useGetAllBuyersQuery,
  useGetUserStatsQuery,
  useDeleteUserMutation,
  User,
  Seller,
  Buyer,
} from "@/state/api";

const UserAdminPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit] = useState(50);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  // Fetch data based on active tab
  const {
    data: usersData,
    isLoading: usersLoading,
    error: usersError,
    refetch: refetchUsers,
  } = useGetAllUsersQuery(
    {
      page: currentPage,
      limit: pageLimit,
      role: roleFilter !== "all" ? roleFilter : undefined,
      search: searchTerm || undefined,
    },
    { skip: activeTab !== "all" }
  );

  const {
    data: sellersData,
    isLoading: sellersLoading,
    refetch: refetchSellers,
  } = useGetAllSellersQuery(
    {
      page: currentPage,
      limit: pageLimit,
      search: searchTerm || undefined,
    },
    { skip: activeTab !== "sellers" }
  );

  const {
    data: buyersData,
    isLoading: buyersLoading,
    refetch: refetchBuyers,
  } = useGetAllBuyersQuery(
    {
      page: currentPage,
      limit: pageLimit,
      search: searchTerm || undefined,
    },
    { skip: activeTab !== "buyers" }
  );

  const { data: statsData } = useGetUserStatsQuery();
  const [deleteUser] = useDeleteUserMutation();

  const handleDeleteUser = (userId: string) => {
    setDeleteUserId(userId);
  };

  const confirmDelete = async () => {
    if (deleteUserId) {
      try {
        await deleteUser({ id: deleteUserId }).unwrap();
        refetchUsers();
        refetchSellers();
        refetchBuyers();
      } catch (error) {
        console.error("Failed to delete user:", error);
      } finally {
        setDeleteUserId(null);
      }
    }
  };

  const handleExportData = () => {
    let data: any[] = [];
    let filename = "";

    if (activeTab === "all" && usersData) {
      data = usersData.users;
      filename = "users";
    } else if (activeTab === "sellers" && sellersData) {
      data = sellersData.sellers;
      filename = "sellers";
    } else if (activeTab === "buyers" && buyersData) {
      data = buyersData.buyers;
      filename = "buyers";
    }

    const csv = convertToCSV(data, activeTab);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}-export-${new Date().toISOString()}.csv`;
    a.click();
  };

  const convertToCSV = (data: any[], type: string) => {
    if (type === "all") {
      const headers = [
        "ID",
        "Email",
        "Name",
        "Role",
        "Phone",
        "Email Verified",
        "Properties",
        "Created",
      ];
      const rows = data.map((u: User) => [
        u.id,
        u.email,
        `${u.firstName} ${u.lastName}`,
        u.role,
        u.phone || "",
        u.isEmailVerified ? "Yes" : "No",
        u.exposesCount || 0,
        new Date(u.createdAt).toLocaleDateString(),
      ]);
      return [headers, ...rows].map((row) => row.join(",")).join("\n");
    } else if (type === "sellers") {
      const headers = [
        "ID",
        "Name",
        "Email",
        "Phone",
        "Verified",
        "Total Properties",
        "Published",
        "Sold",
      ];
      const rows = data.map((s: Seller) => [
        s.id,
        `${s.firstName} ${s.lastName}`,
        s.email,
        s.phone || "",
        s.isSellerVerified ? "Yes" : "No",
        s.propertyStats.total,
        s.propertyStats.published,
        s.propertyStats.sold,
      ]);
      return [headers, ...rows].map((row) => row.join(",")).join("\n");
    } else {
      const headers = ["ID", "Name", "Email", "Phone", "Email Verified", "Created"];
      const rows = data.map((b: Buyer) => [
        b.id,
        `${b.firstName} ${b.lastName}`,
        b.email,
        b.phone || "",
        b.isEmailVerified ? "Yes" : "No",
        new Date(b.createdAt).toLocaleDateString(),
      ]);
      return [headers, ...rows].map((row) => row.join(",")).join("\n");
    }
  };

  const handleRefresh = () => {
    if (activeTab === "all") refetchUsers();
    else if (activeTab === "sellers") refetchSellers();
    else if (activeTab === "buyers") refetchBuyers();
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-purple-500";
      case "SELLER":
        return "bg-blue-500";
      case "BUYER":
        return "bg-green-500";
      case "MODERATOR":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  const isLoading = usersLoading || sellersLoading || buyersLoading;

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
                <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                      User Management
                    </h1>
                    <p className="text-muted-foreground">
                      Manage users, sellers, and buyers
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleRefresh}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                    <Button variant="outline" onClick={handleExportData} className="hidden md:flex">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>

                {/* Statistics Cards */}
                {statsData && (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Total Users
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {statsData.overview.totalUsers}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          +{statsData.overview.recentUserCount} this month
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Sellers
                        </CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {statsData.overview.totalSellers}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Property managers
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Buyers
                        </CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {statsData.overview.totalBuyers}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Property seekers
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Moderators
                        </CardTitle>
                        <Shield className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {statsData.overview.totalModerators}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Content moderators
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Top Seller
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-lg font-bold truncate">
                          {statsData.topSellers[0]?.name || "N/A"}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {statsData.topSellers[0]?.propertiesCount || 0}{" "}
                          properties
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Search and Filters */}
                <Card>
                  <CardHeader>
                    <CardTitle>Search & Filter</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-4 md:flex-row">
                      <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="search"
                          placeholder="Search by name or email..."
                          className="pl-8"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      {activeTab === "all" && (
                        <Select value={roleFilter} onValueChange={setRoleFilter}>
                          <SelectTrigger className="w-full md:w-[180px]">
                            <SelectValue placeholder="Role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Roles</SelectItem>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                            <SelectItem value="MODERATOR">Moderator</SelectItem>
                            <SelectItem value="SELLER">Seller</SelectItem>
                            <SelectItem value="BUYER">Buyer</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Separator />

              {/* Tabs for different views */}
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="all">All Users</TabsTrigger>
                  <TabsTrigger value="sellers">Sellers</TabsTrigger>
                  <TabsTrigger value="buyers">Buyers</TabsTrigger>
                </TabsList>

                {/* All Users Tab */}
                <TabsContent value="all" className="space-y-4">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="text-lg text-muted-foreground">
                        Loading users...
                      </div>
                    </div>
                  ) : usersError ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="text-lg text-red-500">
                        Error loading users
                      </div>
                    </div>
                  ) : usersData && usersData.users.length > 0 ? (
                    <>
                      <Card>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>User</TableHead>
                              <TableHead>Role</TableHead>
                              <TableHead>Contact</TableHead>
                              <TableHead>Verification</TableHead>
                              <TableHead>Properties</TableHead>
                              <TableHead>Joined</TableHead>
                              <TableHead className="text-right">
                                Actions
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {usersData.users.map((user) => (
                              <TableRow key={user.id}>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    {user.avatarUrl ? (
                                      <img
                                        src={"https://jzhlioxxjwqwvwybtcfl.supabase.co/storage/v1/object/public/avatars/"+user.avatarUrl}
                                        alt={user.firstName}
                                        className="h-8 w-8 rounded-full object-cover"
                                      />
                                    ) : (
                                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                        <Users className="h-4 w-4" />
                                      </div>
                                    )}
                                    <div className="flex flex-col">
                                      <span className="font-medium">
                                        {user.firstName} {user.lastName}
                                      </span>
                                      <span className="text-sm text-muted-foreground">
                                        {user.email}
                                      </span>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    className={getRoleBadgeColor(user.role)}
                                  >
                                    {user.role}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-col gap-1">
                                    <span className="text-sm flex items-center gap-1">
                                      <Mail className="h-3 w-3" />
                                      {user.email}
                                    </span>
                                    {user.phone && (
                                      <span className="text-sm flex items-center gap-1">
                                        <Phone className="h-3 w-3" />
                                        {user.phone}
                                      </span>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-1 text-xs">
                                      {user.isEmailVerified ? (
                                        <CheckCircle className="h-3 w-3 text-green-500" />
                                      ) : (
                                        <XCircle className="h-3 w-3 text-red-500" />
                                      )}
                                      Email
                                    </div>
                                    {user.role === "SELLER" && (
                                      <div className="flex items-center gap-1 text-xs">
                                        {user.isSellerVerified ? (
                                          <CheckCircle className="h-3 w-3 text-green-500" />
                                        ) : (
                                          <XCircle className="h-3 w-3 text-red-500" />
                                        )}
                                        Seller
                                      </div>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <span className="font-medium">
                                    {user.exposesCount || 0}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  {new Date(user.createdAt).toLocaleDateString()}
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
                                      <DropdownMenuItem>
                                        <Eye className="h-4 w-4 mr-2" />
                                        View Details
                                      </DropdownMenuItem>
                                      <DropdownMenuItem>
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem>
                                        <UserCheck className="h-4 w-4 mr-2" />
                                        Verify
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        className="text-red-600"
                                        onClick={() =>
                                          handleDeleteUser(user.id)
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

                      {/* Pagination */}
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          Showing {usersData.users.length} of{" "}
                          {usersData.pagination.total} users
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
                              currentPage ===
                              usersData.pagination.totalPages
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
                        <Users className="h-16 w-16 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                          No users found
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Try adjusting your search or filters
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Sellers Tab */}
                <TabsContent value="sellers" className="space-y-4">
                  {sellersLoading ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="text-lg text-muted-foreground">
                        Loading sellers...
                      </div>
                    </div>
                  ) : sellersData && sellersData.sellers.length > 0 ? (
                    <>
                      <Card>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Seller</TableHead>
                              <TableHead>Contact</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Properties</TableHead>
                              <TableHead>Published</TableHead>
                              <TableHead>Sold</TableHead>
                              <TableHead>Joined</TableHead>
                              <TableHead className="text-right">
                                Actions
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {sellersData.sellers.map((seller) => (
                              <TableRow key={seller.id}>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    {seller.avatarUrl ? (
                                      <img
                                        src={"https://jzhlioxxjwqwvwybtcfl.supabase.co/storage/v1/object/public/avatars/"+seller.avatarUrl}
                                        alt={seller.firstName}
                                        className="h-8 w-8 rounded-full object-cover"
                                      />
                                    ) : (
                                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                        <Building2 className="h-4 w-4" />
                                      </div>
                                    )}
                                    <div className="flex flex-col">
                                      <span className="font-medium">
                                        {seller.firstName} {seller.lastName}
                                      </span>
                                      <span className="text-sm text-muted-foreground">
                                        {seller.email}
                                      </span>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {seller.phone || "N/A"}
                                </TableCell>
                                <TableCell>
                                  {seller.isSellerVerified ? (
                                    <Badge className="bg-green-500">
                                      Verified
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="border-yellow-500">
                                      Unverified
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <span className="font-semibold">
                                    {seller.propertyStats.total}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="bg-green-50">
                                    {seller.propertyStats.published}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="bg-blue-50">
                                    {seller.propertyStats.sold}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {new Date(
                                    seller.createdAt
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
                                      <DropdownMenuItem>
                                        <Eye className="h-4 w-4 mr-2" />
                                        View Profile
                                      </DropdownMenuItem>
                                      <DropdownMenuItem>
                                        <Home className="h-4 w-4 mr-2" />
                                        View Properties
                                      </DropdownMenuItem>
                                      {!seller.isSellerVerified && (
                                        <DropdownMenuItem>
                                          <UserCheck className="h-4 w-4 mr-2" />
                                          Verify Seller
                                        </DropdownMenuItem>
                                      )}
                                      <DropdownMenuItem>
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        className="text-red-600"
                                        onClick={() =>
                                          handleDeleteUser(seller.id)
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

                      {/* Pagination */}
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          Showing {sellersData.sellers.length} of{" "}
                          {sellersData.pagination.total} sellers
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
                              currentPage ===
                              sellersData.pagination.totalPages
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
                        <Building2 className="h-16 w-16 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                          No sellers found
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Try adjusting your search
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Buyers Tab */}
                <TabsContent value="buyers" className="space-y-4">
                  {buyersLoading ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="text-lg text-muted-foreground">
                        Loading buyers...
                      </div>
                    </div>
                  ) : buyersData && buyersData.buyers.length > 0 ? (
                    <>
                      <Card>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Buyer</TableHead>
                              <TableHead>Contact</TableHead>
                              <TableHead>Email Status</TableHead>
                              <TableHead>Joined</TableHead>
                              <TableHead className="text-right">
                                Actions
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {buyersData.buyers.map((buyer) => (
                              <TableRow key={buyer.id}>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    {buyer.avatarUrl ? (
                                      <img
                                        src={"https://jzhlioxxjwqwvwybtcfl.supabase.co/storage/v1/object/public/avatars/"+buyer.avatarUrl}
                                        alt={buyer.firstName}
                                        className="h-8 w-8 rounded-full object-cover"
                                      />
                                    ) : (
                                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                        <ShoppingCart className="h-4 w-4" />
                                      </div>
                                    )}
                                    <div className="flex flex-col">
                                      <span className="font-medium">
                                        {buyer.firstName} {buyer.lastName}
                                      </span>
                                      <span className="text-sm text-muted-foreground">
                                        {buyer.email}
                                      </span>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {buyer.phone || "N/A"}
                                </TableCell>
                                <TableCell>
                                  {buyer.isEmailVerified ? (
                                    <Badge className="bg-green-500">
                                      Verified
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="border-red-500">
                                      Unverified
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {new Date(
                                    buyer.createdAt
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
                                      <DropdownMenuItem>
                                        <Eye className="h-4 w-4 mr-2" />
                                        View Profile
                                      </DropdownMenuItem>
                                      <DropdownMenuItem>
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        className="text-red-600"
                                        onClick={() =>
                                          handleDeleteUser(buyer.id)
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

                      {/* Pagination */}
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          Showing {buyersData.buyers.length} of{" "}
                          {buyersData.pagination.total} buyers
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
                              currentPage === buyersData.pagination.totalPages
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
                        <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                          No buyers found
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Try adjusting your search
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteUserId}
        onOpenChange={() => setDeleteUserId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the user and all associated data including
              properties, messages, and other records. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UserAdminPage;