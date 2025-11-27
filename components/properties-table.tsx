"use client"

import { useMemo, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MoreHorizontal, Search, Eye, Pencil, Trash2, Plus, Bed, Bath, Maximize } from "lucide-react"
import { useGetPropertiesQuery } from "@/state/api"
import { Property } from "@/types/index.t"
// import type { Property } from "@/types/property"

// Mock data based on the property structure from the API
const mockProperties: any[] = [
  {
    id: "1",
    sellerId: "seller-1",
    status: "PUBLISHED",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-20T14:45:00Z",
    basic: {
      exposeId: "1",
      propertyType: "HOUSE",
      address: "123 Main Street",
      city: "Budapest",
      county: "Pest",
      villageId: null,
      price: 45000000,
      currency: "HUF",
      livingArea: 150,
      rooms: 5,
      bedrooms: 3,
      bathrooms: 2,
    },
    location: {
      exposeId: "1",
      latitude: 47.4979,
      longitude: 19.0402,
      coordinates: { longitude: 19.0402, latitude: 47.4979 },
    },
    media: [
      {
        id: "m1",
        mediaType: "IMAGE",
        url: "/modern-house-exterior.png",
        thumbnailUrl: null,
        uploadedAt: "2024-01-15T10:30:00Z",
      },
    ],
    seller: [{ id: "seller-1", firstName: "John", lastName: "Doe", avatarUrl: null }],
  },
  {
    id: "2",
    sellerId: "seller-2",
    status: "IN_REVIEW",
    createdAt: "2024-01-18T09:00:00Z",
    updatedAt: "2024-01-18T09:00:00Z",
    basic: {
      exposeId: "2",
      propertyType: "APARTMENT",
      address: "456 Oak Avenue",
      city: "Debrecen",
      county: "Hajdú-Bihar",
      villageId: null,
      price: 28000000,
      currency: "HUF",
      livingArea: 85,
      rooms: 3,
      bedrooms: 2,
      bathrooms: 1,
    },
    location: {
      exposeId: "2",
      latitude: 47.5316,
      longitude: 21.6273,
      coordinates: { longitude: 21.6273, latitude: 47.5316 },
    },
    media: [
      {
        id: "m2",
        mediaType: "IMAGE",
        url: "/modern-apartment-building.png",
        thumbnailUrl: null,
        uploadedAt: "2024-01-18T09:00:00Z",
      },
    ],
    seller: [{ id: "seller-2", firstName: "Jane", lastName: "Smith", avatarUrl: null }],
  },
  {
    id: "3",
    sellerId: "seller-3",
    status: "PUBLISHED",
    createdAt: "2024-01-10T15:20:00Z",
    updatedAt: "2024-01-22T11:30:00Z",
    basic: {
      exposeId: "3",
      propertyType: "VILLA",
      address: "789 Garden Road",
      city: "Szeged",
      county: "Csongrád",
      villageId: null,
      price: 120000000,
      currency: "HUF",
      livingArea: 320,
      rooms: 8,
      bedrooms: 5,
      bathrooms: 4,
    },
    location: {
      exposeId: "3",
      latitude: 46.253,
      longitude: 20.1414,
      coordinates: { longitude: 20.1414, latitude: 46.253 },
    },
    media: [
      {
        id: "m3",
        mediaType: "IMAGE",
        url: "/luxury-villa.png",
        thumbnailUrl: null,
        uploadedAt: "2024-01-10T15:20:00Z",
      },
    ],
    seller: [{ id: "seller-3", firstName: "Peter", lastName: "Nagy", avatarUrl: null }],
  },
  {
    id: "4",
    sellerId: "seller-1",
    status: "DRAFT",
    createdAt: "2024-01-22T08:00:00Z",
    updatedAt: "2024-01-22T08:00:00Z",
    basic: {
      exposeId: "4",
      propertyType: "LAND",
      address: "Plot 12, Industrial Zone",
      city: "Győr",
      county: "Győr-Moson-Sopron",
      villageId: null,
      price: 15000000,
      currency: "HUF",
      livingArea: 0,
      rooms: 0,
      bedrooms: 0,
      bathrooms: 0,
    },
    location: {
      exposeId: "4",
      latitude: 47.6875,
      longitude: 17.6504,
      coordinates: { longitude: 17.6504, latitude: 47.6875 },
    },
    media: [],
    seller: [{ id: "seller-1", firstName: "John", lastName: "Doe", avatarUrl: null }],
  },
  {
    id: "5",
    sellerId: "seller-4",
    status: "PUBLISHED",
    createdAt: "2024-01-05T12:00:00Z",
    updatedAt: "2024-01-21T16:00:00Z",
    basic: {
      exposeId: "5",
      propertyType: "APARTMENT",
      address: "22 River Street",
      city: "Pécs",
      county: "Baranya",
      villageId: null,
      price: 32000000,
      currency: "HUF",
      livingArea: 95,
      rooms: 4,
      bedrooms: 2,
      bathrooms: 1,
    },
    location: {
      exposeId: "5",
      latitude: 46.0727,
      longitude: 18.2323,
      coordinates: { longitude: 18.2323, latitude: 46.0727 },
    },
    media: [
      {
        id: "m5",
        mediaType: "IMAGE",
        url: "/modern-city-apartment.png",
        thumbnailUrl: null,
        uploadedAt: "2024-01-05T12:00:00Z",
      },
    ],
    seller: [{ id: "seller-4", firstName: "Anna", lastName: "Kovács", avatarUrl: null }],
  },
]

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PUBLISHED: "default",
  IN_REVIEW: "secondary",
  DRAFT: "outline",
  REJECTED: "destructive",
}

const propertyTypeLabels: Record<string, string> = {
  HOUSE: "House",
  APARTMENT: "Apartment",
  VILLA: "Villa",
  LAND: "Land",
  COMMERCIAL: "Commercial",
}

function formatPrice(price: number, currency: string) {
  return new Intl.NumberFormat("hu-HU", {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 0,
  }).format(price)
}

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(dateString))
}

export function PropertiesTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [propertyTypeFilter, setPropertyTypeFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  );
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [deletePropertyId, setDeletePropertyId] = useState<string | null>(null);


   // Fetch properties using your existing API
  const { data: properties = [], isLoading, error, refetch } = useGetPropertiesQuery({});

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

  console.log("Fetched properties:", properties);
  
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
      active: properties.filter((p) => p.status === ("PUBLISHED" as any)).length,
      pending: properties.filter((p) => p.status === ("PENDING" as any)).length,
      sold: properties.filter((p) => p.status === ("SOLD" as any)).length,
      averagePrice:
        properties.reduce((sum, p) => sum + (p.basic?.price || 0), 0) /
          properties.length || 0,
    };
  }, [properties]);

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
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <CardTitle>All Properties</CardTitle>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Property
          </Button>
        </div>
        <div className="flex flex-col gap-4 pt-4 md:flex-row md:items-center">
          {/* <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by address, city, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div> */}
          {/* <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PUBLISHED">Published</SelectItem>
                <SelectItem value="IN_REVIEW">In Review</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="HOUSE">House</SelectItem>
                <SelectItem value="APARTMENT">Apartment</SelectItem>
                <SelectItem value="VILLA">Villa</SelectItem>
                <SelectItem value="LAND">Land</SelectItem>
                <SelectItem value="COMMERCIAL">Commercial</SelectItem>
              </SelectContent>
            </Select>
          </div> */}
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="hidden md:table-cell">Details</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell">Seller</TableHead>
                <TableHead className="hidden lg:table-cell">Listed</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProperties.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center">
                    No properties found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredProperties.map((property) => (
                  <TableRow key={property.id}>
                    <TableCell>
                      <div className="h-12 w-12 overflow-hidden rounded-md bg-muted">
                        {property.media[0] ? (
                          <img
                            src={property.media[0].url || "/placeholder.svg"}
                            alt={property.basic.address}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                            No img
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{property.basic.address}</span>
                        <span className="text-sm text-muted-foreground">
                          {property.basic.city}, {property.basic.county}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {propertyTypeLabels[property.basic.propertyType] || property.basic.propertyType}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatPrice(property.basic.price, property.basic.currency)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        {property.basic.bedrooms > 0 && (
                          <span className="flex items-center gap-1">
                            <Bed className="h-3.5 w-3.5" />
                            {property.basic.bedrooms}
                          </span>
                        )}
                        {property.basic.bathrooms > 0 && (
                          <span className="flex items-center gap-1">
                            <Bath className="h-3.5 w-3.5" />
                            {property.basic.bathrooms}
                          </span>
                        )}
                        {property.basic.livingArea > 0 && (
                          <span className="flex items-center gap-1">
                            <Maximize className="h-3.5 w-3.5" />
                            {property.basic.livingArea}m²
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusColors[property.status]}>{property.status.replace("_", " ")}</Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {property.seller[0] && (
                        <span className="text-sm">
                          {property.seller[0].firstName} {property.seller[0].lastName}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                      {formatDate(property.createdAt)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit Property
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-muted-foreground">
            Showing {filteredProperties.length} of {mockProperties.length} properties
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
