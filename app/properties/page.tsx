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
import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Home,
  MapPin,
  Bed,
  Bath,
  Maximize,
  DollarSign,
  Calendar,
  TrendingUp,
  Building,
  RefreshCw,
  Download,
  Plus,
} from "lucide-react";
import { useGetPropertiesQuery } from "@/state/api";
import { Property } from "@/types/index.t";
import { PropertyDetailModal } from "@/components/property-detail-modal";

const AdminPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [propertyTypeFilter, setPropertyTypeFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [selectedProperty, setSelectedProperty] = useState<any | null>(
    null
  );
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [deletePropertyId, setDeletePropertyId] = useState<string | null>(null);

  // Fetch properties using your existing API
  const { data: properties = [], isLoading, error, refetch } = useGetPropertiesQuery({});
console.log("properties data:", properties);
  

  // Filter properties based on search and filters
  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      const matchesSearch =
        searchTerm === "" ||
        property.basic?.address
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        property.basic?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || property.status === statusFilter;

      const matchesType =
        propertyTypeFilter === "all" ||
        property.basic?.propertyType === propertyTypeFilter;

      const matchesPrice =
        (priceRange.min === "" ||
          (property.basic?.price ?? 0) >= parseFloat(priceRange.min)) &&
        (priceRange.max === "" ||
          (property.basic?.price ?? 0) <= parseFloat(priceRange.max));

      return matchesSearch && matchesStatus && matchesType && matchesPrice;
    });
  }, [properties, searchTerm, statusFilter, propertyTypeFilter, priceRange]);

  // Calculate statistics
  const stats = useMemo(() => {
    return {
      total: properties.length,
      active: properties.filter((p) => p.status === "PUBLISHED" as any).length,
      pending: properties.filter((p) => p.status === "IN_REVIEW" as any).length,
      sold: properties.filter((p) => p.status === "SOLD" as any).length,
      averagePrice:
        properties.reduce((sum, p) => sum + (p.basic?.price || 0), 0) /
          properties.length || 0,
    };
  }, [properties]);

  const formatPrice = (price: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-500";
      case "PENDING":
        return "bg-yellow-500";
      case "SOLD":
        return "bg-blue-500";
      case "INACTIVE":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const handleViewProperty = (property: Property) => {
    setSelectedProperty(property);
    setIsDetailModalOpen(true);
  };

  const handleEditProperty = (property: Property) => {
    // Navigate to edit page or open edit modal
    console.log("Edit property:", property.id);
    // You can implement this based on your routing setup
  };

  const handleDeleteProperty = (propertyId: string) => {
    setDeletePropertyId(propertyId);
  };

  const confirmDelete = async () => {
    if (deletePropertyId) {
      // Implement delete logic here
      console.log("Delete property:", deletePropertyId);
      // After successful deletion, refetch properties
      // await deletePropertyMutation(deletePropertyId);
      // refetch();
      setDeletePropertyId(null);
    }
  };

  const handleExportData = () => {
    // Convert filtered properties to CSV
    const csv = convertToCSV(filteredProperties);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `properties-export-${new Date().toISOString()}.csv`;
    a.click();
  };

  const convertToCSV = (data: Property[]) => {
    const headers = [
      "ID",
      "Address",
      "City",
      "Price",
      "Type",
      "Bedrooms",
      "Bathrooms",
      "Area",
      "Status",
    ];
    const rows = data.map((p) => [
      p.id,
      p.basic?.address || "",
      p.basic?.city || "",
      p.basic?.price || 0,
      p.basic?.propertyType || "",
      p.basic?.bedrooms || 0,
      p.basic?.bathrooms || 0,
      p.basic?.livingArea || 0,
      p.status,
    ]);
    return [headers, ...rows].map((row) => row.join(",")).join("\n");
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setPropertyTypeFilter("all");
    setPriceRange({ min: "", max: "" });
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
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                      Property Management
                    </h1>
                    <p className="text-muted-foreground">
                      Manage and monitor all properties in the system
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => refetch()}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                    <Button variant="outline" onClick={handleExportData}>
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Property
                    </Button>
                  </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Properties
                      </CardTitle>
                      <Building className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.total}</div>
                      <p className="text-xs text-muted-foreground">
                        {filteredProperties.length} shown
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Active Listings
                      </CardTitle>
                      <Home className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.active}</div>
                      <p className="text-xs text-muted-foreground">
                        +{Math.round((stats.active / stats.total) * 100)}% of
                        total
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Pending
                      </CardTitle>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.pending}</div>
                      <p className="text-xs text-muted-foreground">
                        Awaiting approval
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Sold</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.sold}</div>
                      <p className="text-xs text-muted-foreground">
                        Successfully closed
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Avg. Price
                      </CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatPrice(stats.averagePrice)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Across all properties
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Search and Filters */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Search & Filter</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                      >
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
                            placeholder="Search by address, city, or ID..."
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
                            <SelectItem value="ACTIVE">Active</SelectItem>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="SOLD">Sold</SelectItem>
                            <SelectItem value="INACTIVE">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select
                          value={propertyTypeFilter}
                          onValueChange={setPropertyTypeFilter}
                        >
                          <SelectTrigger className="w-full md:w-[180px]">
                            <SelectValue placeholder="Property Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="HOUSE">House</SelectItem>
                            <SelectItem value="APARTMENT">Apartment</SelectItem>
                            <SelectItem value="CONDO">Condo</SelectItem>
                            <SelectItem value="LAND">Land</SelectItem>
                            <SelectItem value="VILLA">Villa</SelectItem>
                            <SelectItem value="BUNGALOW">Bungalow</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex flex-col gap-4 md:flex-row md:items-center">
                        <div className="flex gap-2 flex-1">
                          <Input
                            type="number"
                            placeholder="Min Price"
                            value={priceRange.min}
                            onChange={(e) =>
                              setPriceRange({ ...priceRange, min: e.target.value })
                            }
                            className="w-full"
                          />
                          <span className="flex items-center">-</span>
                          <Input
                            type="number"
                            placeholder="Max Price"
                            value={priceRange.max}
                            onChange={(e) =>
                              setPriceRange({ ...priceRange, max: e.target.value })
                            }
                            className="w-full"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant={viewMode === "grid" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setViewMode("grid")}
                          >
                            Grid
                          </Button>
                          <Button
                            variant={viewMode === "table" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setViewMode("table")}
                          >
                            Table
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Separator />

              {/* Properties Display */}
              <div className="flex-1">
                {isLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-lg text-muted-foreground">
                      Loading properties...
                    </div>
                  </div>
                ) : error ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-lg text-red-500">
                      Error loading properties
                    </div>
                  </div>
                ) : filteredProperties.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center h-64 text-center">
                      <Building className="h-16 w-16 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        No properties found
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Try adjusting your filters or search term
                      </p>
                      <Button variant="outline" onClick={clearFilters}>
                        Clear Filters
                      </Button>
                    </CardContent>
                  </Card>
                ) : viewMode === "grid" ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredProperties.map((property) => (
                      <Card
                        key={property.id}
                        className="overflow-hidden hover:shadow-lg transition-shadow pt-0"
                      >
                        <div className="relative h-48 bg-muted">
                          {property.media && property.media[0] ? (
                            <img
                              src={property.media[0].url}
                              alt={property.basic?.address || "Property"}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <Home className="h-16 w-16 text-muted-foreground" />
                            </div>
                          )}
                          <Badge
                            className={`absolute top-2 right-2 ${getStatusColor(
                              property.status
                            )}`}
                          >
                            {property.status}
                          </Badge>
                        </div>
                        <CardHeader>
                          <CardTitle className="text-lg">
                            {/* {formatPrice(
                              property.basic?.price || 0,
                              property.basic?.currency || "USD"
                            )} */}
                            {property.basic?.title || "Untitled Property"}
                          </CardTitle>
                          <CardDescription className="flex items-start gap-1">
                            <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-2">
                              {property.basic?.address}, {property.basic?.city}
                            </span>
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Bed className="h-4 w-4" />
                              <span>{property.basic?.bedrooms || 0}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Bath className="h-4 w-4" />
                              <span>{property.basic?.bathrooms || 0}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Maximize className="h-4 w-4" />
                              <span>{property.basic?.livingArea || 0} m²</span>
                            </div>
                          </div>
                          <div className="mt-2">
                            <Badge variant="outline">
                              {property.basic?.propertyType || "N/A"}
                            </Badge>
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewProperty(property)}
                          >
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
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleViewProperty(property)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleEditProperty(property)}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDeleteProperty(property.id)}
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
                ) : (
                  <Card className="px-5">
                    <Table >
                      <TableHeader>
                        <TableRow>
                          <TableHead>Property</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Beds/Baths</TableHead>
                          <TableHead>Area</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody >
                        {filteredProperties.map((property) => (
                          <TableRow key={property.id} >
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {property.basic?.title}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  {property.basic?.address}, {property.basic?.city}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {property.basic?.propertyType || "N/A"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {formatPrice(
                                property.basic?.price || 0,
                                property.basic?.currency || "USD"
                              )}
                            </TableCell>
                            <TableCell>
                              {property.basic?.bedrooms || 0} /{" "}
                              {property.basic?.bathrooms || 0}
                            </TableCell>
                            <TableCell>
                              {property.basic?.livingArea || 0} m²
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(property.status)}>
                                {property.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(property.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleViewProperty(property)}
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleEditProperty(property)}
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() =>
                                      handleDeleteProperty(property.id)
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
                )}
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>

      {/* Property Detail Modal */}
      <PropertyDetailModal
        property={selectedProperty}
        open={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletePropertyId}
        onOpenChange={() => setDeletePropertyId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              property and remove all associated data.
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

export default AdminPage;