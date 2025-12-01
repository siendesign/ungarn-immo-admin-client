"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import React, { useState } from "react";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  MapPin,
  Bed,
  Bath,
  Maximize,
  Home,
  Calendar,
  DollarSign,
  User,
  Mail,
  Phone,
  Building,
  Zap,
  Droplets,
  Thermometer,
  Wifi,
  Image as ImageIcon,
  FileText,
  Map,
  AlertTriangle,
} from "lucide-react";
import { useGetPropertyQuery, useUpdatePropertyMutation } from "@/state/api";
import { useRouter, useParams } from "next/navigation";
import { Property } from "@/types/index.t";

const AdminPropertyReviewPage = () => {
  const router = useRouter();
  const params = useParams();
  const propertyId = params.id as string;

  const { data: property, isLoading, error } = useGetPropertyQuery(propertyId);
  console.log("Fetched property:", property);

  const [updateProperty, { isLoading: updating }] = useUpdatePropertyMutation();

  const [activeTab, setActiveTab] = useState("overview");
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="[--header-height:calc(--spacing(14))]">
        <SidebarProvider className="flex flex-col">
          <SiteHeader />
          <div className="flex flex-1">
            <AppSidebar />
            <SidebarInset>
              <div className="flex flex-1 flex-col gap-4 p-4">
                <Skeleton className="h-12 w-64" />
                <Skeleton className="h-96 w-full" />
              </div>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="[--header-height:calc(--spacing(14))]">
        <SidebarProvider className="flex flex-col">
          <SiteHeader />
          <div className="flex flex-1">
            <AppSidebar />
            <SidebarInset>
              <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-center h-96">
                  <div className="text-center">
                    <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">
                      Property Not Found
                    </h2>
                    <p className="text-muted-foreground mb-4">
                      The property you're looking for doesn't exist.
                    </p>
                    <Button onClick={() => router.push("/admin/properties")}>
                      Back to Properties
                    </Button>
                  </div>
                </div>
              </div>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </div>
    );
  }

  const handleApprove = async () => {
    try {
      await updateProperty({
        id: propertyId,
        data: { status: "PUBLISHED" },
      }).unwrap();
      setShowApproveDialog(false);
      router.push("/properties");
    } catch (error) {
      console.error("Failed to approve property:", error);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      return;
    }

    try {
      await updateProperty({
        id: propertyId,
        data: {
          status: "REJECTED",
          reasonRejection: rejectionReason,
        },
      }).unwrap();
      setShowRejectDialog(false);
      router.push("/properties");
    } catch (error) {
      console.error("Failed to reject property:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return "bg-green-500";
      case "IN_REVIEW":
        return "bg-yellow-500";
      case "REJECTED":
        return "bg-red-500";
      case "SOLD":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getRatingStars = (rating: number | null | undefined) => {
    const stars = [];
    const actualRating = rating || 0;
    for (let i = 0; i < 5; i++) {
      stars.push(
        <div
          key={i}
          className={`h-4 w-4 rounded-full ${
            i < actualRating ? "bg-yellow-400" : "bg-gray-300"
          }`}
        />
      );
    }
    return stars;
  };

  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarProvider className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset>
            <div className="flex flex-1 flex-col gap-4 p-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push("/properties")}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Properties
                    </Button>
                    <Badge className={getStatusColor(property.status)}>
                      {property.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <h1 className="text-3xl font-bold tracking-tight">
                    {property.basic?.title || property.basic?.address}
                  </h1>
                  <div className="flex items-center gap-2 text-muted-foreground mt-1">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {property.basic?.address}, {property.basic?.city},{" "}
                      {property.basic?.county}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                {property.status === "IN_REVIEW" && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="border-red-500 text-red-500 hover:bg-red-50"
                      onClick={() => setShowRejectDialog(true)}
                      disabled={updating}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                    <Button
                      className="bg-green-500 hover:bg-green-600"
                      onClick={() => setShowApproveDialog(true)}
                      disabled={updating}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve & Publish
                    </Button>
                  </div>
                )}
              </div>

              <Separator />

              {/* Main Content */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Left Column - Main Details */}
                <div className="lg:col-span-2 space-y-4">
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-5">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="details">Details</TabsTrigger>
                      <TabsTrigger value="condition">Condition</TabsTrigger>
                      <TabsTrigger value="media">Media</TabsTrigger>
                      <TabsTrigger value="location">Location</TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-4">
                      {/* Main Image */}
                      <Card className="p-0 overflow-hidden">
                        <CardContent className="p-0">
                          {property.media && property.media.length > 0 ? (
                            <div className="relative h-96 bg-muted rounded-t-lg overflow-hidden">
                              <img
                                src={property.media[0].url}
                                alt="Property"
                                className="w-full h-full object-cover cursor-pointer"
                                onClick={() =>
                                  setSelectedImage(property.media![0].url)
                                }
                              />
                            </div>
                          ) : (
                            <div className="flex items-center justify-center h-96 bg-muted rounded-t-lg">
                              <ImageIcon className="h-16 w-16 text-muted-foreground" />
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Key Stats */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Property Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
                              <Bed className="h-6 w-6 text-muted-foreground mb-2" />
                              <div className="text-2xl font-bold">
                                {property.basic?.bedrooms || 0}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Bedrooms
                              </div>
                            </div>
                            <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
                              <Bath className="h-6 w-6 text-muted-foreground mb-2" />
                              <div className="text-2xl font-bold">
                                {property.basic?.bathrooms || 0}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Bathrooms
                              </div>
                            </div>
                            <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
                              <Maximize className="h-6 w-6 text-muted-foreground mb-2" />
                              <div className="text-2xl font-bold">
                                {property.basic?.livingArea || 0}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                m² Living
                              </div>
                            </div>
                            <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
                              <Home className="h-6 w-6 text-muted-foreground mb-2" />
                              <div className="text-2xl font-bold">
                                {property.basic?.rooms || 0}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Rooms
                              </div>
                            </div>
                          </div>

                          <Separator className="my-4" />

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">
                                Property Type:
                              </span>
                              <span className="ml-2 font-medium">
                                {property.basic?.propertyType || "N/A"}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">
                                Lot Size:
                              </span>
                              <span className="ml-2 font-medium">
                                {property.basic?.lotSize || 0} m²
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">
                                Build Year:
                              </span>
                              <span className="ml-2 font-medium">
                                {property.basic?.buildYear || "N/A"}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">
                                Last Renovation:
                              </span>
                              <span className="ml-2 font-medium">
                                {property.basic?.lastRenovation || "N/A"}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Description */}
                      {property.basic?.description && (
                        <Card>
                          <CardHeader>
                            <CardTitle>Description</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm whitespace-pre-wrap">
                              {property.basic.description}
                            </p>
                          </CardContent>
                        </Card>
                      )}
                    </TabsContent>

                    {/* Details Tab */}
                    <TabsContent value="details" className="space-y-4">
                      {(property as any).details ? (
                        <>
                          <Card>
                            <CardHeader>
                              <CardTitle>Construction Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <InfoRow
                                  label="Material"
                                  value={(property as any).details.material}
                                />
                                <InfoRow
                                  label="Roof Type"
                                  value={(property as any).details.roofType}
                                />
                                <InfoRow
                                  label="Roof Condition"
                                  value={
                                    (property as any).details.roofCondition
                                  }
                                />
                                <InfoRow
                                  label="Insulation"
                                  value={(property as any).details.insulation}
                                />
                                <InfoRow
                                  label="Windows"
                                  value={(property as any).details.windows}
                                />
                                <InfoRow
                                  label="Windows Age"
                                  value={
                                    (property as any).details.windowsAge
                                      ? `${
                                          (property as any).details.windowsAge
                                        } years`
                                      : null
                                  }
                                />
                                <InfoRow
                                  label="Roller Shutters"
                                  value={
                                    (property as any).details.hasRollerShutters
                                      ? "Yes"
                                      : "No"
                                  }
                                />
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <Zap className="h-5 w-5" />
                                Utilities & Systems
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <InfoRow
                                  label="Heating Type"
                                  value={(property as any).details.heatingType}
                                  icon={<Thermometer className="h-4 w-4" />}
                                />
                                <InfoRow
                                  label="Heating Condition"
                                  value={
                                    (property as any).details.heatingCondition
                                  }
                                />
                                <InfoRow
                                  label="Electric Condition"
                                  value={
                                    (property as any).details.electricCondition
                                  }
                                  icon={<Zap className="h-4 w-4" />}
                                />
                                <InfoRow
                                  label="Water Condition"
                                  value={
                                    (property as any).details.waterCondition
                                  }
                                  icon={<Droplets className="h-4 w-4" />}
                                />
                                <InfoRow
                                  label="Internet Type"
                                  value={(property as any).details.internetType}
                                  icon={<Wifi className="h-4 w-4" />}
                                />
                                <InfoRow
                                  label="Internet Speed"
                                  value={
                                    (property as any).details.internetSpeed
                                      ? `${
                                          (property as any).details
                                            .internetSpeed
                                        } Mbps`
                                      : null
                                  }
                                />
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader>
                              <CardTitle>Energy Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <InfoRow
                                  label="Energy Certificate"
                                  value={
                                    (property as any).details.energyCertificate
                                      ? "Yes"
                                      : "No"
                                  }
                                />
                                <InfoRow
                                  label="Energy Class"
                                  value={(property as any).details.energyClass}
                                />
                                <InfoRow
                                  label="Energy Consumption"
                                  value={
                                    (property as any).details.energyConsumption
                                      ? `${
                                          (property as any).details
                                            .energyConsumption
                                        } kWh/m²a`
                                      : null
                                  }
                                />
                                <InfoRow
                                  label="Monthly Costs"
                                  value={
                                    typeof (property as any).details
                                      .monthlyCosts === "object"
                                      ? "See breakdown"
                                      : (property as any).details.monthlyCosts
                                  }
                                />
                              </div>
                            </CardContent>
                          </Card>

                          {(property as any).details.gardenDesc && (
                            <Card>
                              <CardHeader>
                                <CardTitle>Garden</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <p className="text-sm">
                                  {(property as any).details.gardenDesc}
                                </p>
                              </CardContent>
                            </Card>
                          )}
                        </>
                      ) : (
                        <Card>
                          <CardContent className="text-center py-8">
                            <p className="text-muted-foreground">
                              No detailed information available
                            </p>
                          </CardContent>
                        </Card>
                      )}
                    </TabsContent>

                    {/* Condition Tab */}
                    <TabsContent value="condition" className="space-y-4">
                      {(property as any).condition ? (
                        <>
                          <Card>
                            <CardHeader>
                              <CardTitle>Condition Ratings</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="space-y-3">
                                <div>
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium">
                                      Structure Rating
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                      {(property as any).condition
                                        .structureRating || 0}
                                      /5
                                    </span>
                                  </div>
                                  <div className="flex gap-1">
                                    {getRatingStars(
                                      (property as any).condition
                                        .structureRating
                                    )}
                                  </div>
                                </div>

                                <div>
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium">
                                      Electric Rating
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                      {(property as any).condition
                                        .electricRating || 0}
                                      /5
                                    </span>
                                  </div>
                                  <div className="flex gap-1">
                                    {getRatingStars(
                                      (property as any).condition.electricRating
                                    )}
                                  </div>
                                </div>

                                <div>
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium">
                                      Heating Rating
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                      {(property as any).condition
                                        .heatingRating || 0}
                                      /5
                                    </span>
                                  </div>
                                  <div className="flex gap-1">
                                    {getRatingStars(
                                      (property as any).condition.heatingRating
                                    )}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {(property as any).condition.damageDescription && (
                            <Card>
                              <CardHeader>
                                <CardTitle>Damage Description</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <p className="text-sm whitespace-pre-wrap">
                                  {
                                    (property as any).condition
                                      .damageDescription
                                  }
                                </p>
                              </CardContent>
                            </Card>
                          )}

                          {(property as any).condition.renovationNeeded && (
                            <Card>
                              <CardHeader>
                                <CardTitle>Renovation Needed</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <p className="text-sm whitespace-pre-wrap">
                                  {(property as any).condition.renovationNeeded}
                                </p>
                              </CardContent>
                            </Card>
                          )}

                          {(property as any).condition.additionalNotes && (
                            <Card>
                              <CardHeader>
                                <CardTitle>Additional Notes</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <p className="text-sm whitespace-pre-wrap">
                                  {(property as any).condition.additionalNotes}
                                </p>
                              </CardContent>
                            </Card>
                          )}
                        </>
                      ) : (
                        <Card>
                          <CardContent className="text-center py-8">
                            <p className="text-muted-foreground">
                              No condition information available
                            </p>
                          </CardContent>
                        </Card>
                      )}
                    </TabsContent>

                    {/* Media Tab */}
                    <TabsContent value="media" className="space-y-4">
                      {property.media && property.media.length > 0 ? (
                        <>
                          {/* Images */}
                          {(property as any).media.filter(
                            (m: any) => m.mediaType === "PHOTO"
                          ).length > 0 && (
                            <Card>
                              <CardHeader>
                                <CardTitle>
                                  Property Images (
                                  {
                                    (property as any).media.filter(
                                      (m: any) => m.mediaType === "PHOTO"
                                    ).length
                                  }
                                  )
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                  {(property as any).media
                                    .filter((m: any) => m.mediaType === "PHOTO")
                                    .map((media: any, index: any) => (
                                      <div
                                        key={media.id}
                                        className="relative h-48 bg-muted rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity group"
                                        onClick={() =>
                                          setSelectedImage(media.url)
                                        }
                                      >
                                        <img
                                          src={media.url}
                                          alt={`Property ${index + 1}`}
                                          className="w-full h-full object-cover"
                                        />
                                        <Badge className="absolute top-2 left-2">
                                          IMAGE
                                        </Badge>
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                          <ImageIcon className="h-8 w-8 text-white" />
                                        </div>
                                      </div>
                                    ))}
                                </div>
                              </CardContent>
                            </Card>
                          )}

                          {/* Videos */}
                          {property.media.filter((m) => m.mediaType === "VIDEO")
                            .length > 0 && (
                            <Card>
                              <CardHeader>
                                <CardTitle>
                                  Property Videos (
                                  {
                                    property.media.filter(
                                      (m) => m.mediaType === "VIDEO"
                                    ).length
                                  }
                                  )
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {property.media
                                    .filter((m) => m.mediaType === "VIDEO")
                                    .map((media, index) => (
                                      <div
                                        key={media.id}
                                        className="relative bg-muted rounded-lg overflow-hidden"
                                      >
                                        <video
                                          src={media.url}
                                          controls
                                          className="w-full h-64 object-cover"
                                          preload="metadata"
                                        >
                                          Your browser does not support the
                                          video tag.
                                        </video>
                                        <Badge className="absolute top-2 left-2">
                                          VIDEO
                                        </Badge>
                                      </div>
                                    ))}
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </>
                      ) : (
                        <Card>
                          <CardContent className="text-center py-8">
                            <ImageIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">
                              No media available
                            </p>
                          </CardContent>
                        </Card>
                      )}

                      {(property as any).floorplans &&
                        (property as any).floorplans.length > 0 && (
                          <Card>
                            <CardHeader>
                              <CardTitle>
                                Floor Plans (
                                {(property as any).floorplans.length})
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {(property as any).floorplans.map(
                                  (plan: any, index: number) => (
                                    <div
                                      key={plan.id}
                                      className="relative h-64 bg-muted rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity group"
                                      onClick={() => setSelectedImage(plan.url)}
                                    >
                                      <img
                                        src={plan.url}
                                        alt={`Floor plan ${index + 1}`}
                                        className="w-full h-full object-contain"
                                      />
                                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <FileText className="h-8 w-8 text-white" />
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        )}
                    </TabsContent>

                    {/* Location Tab */}
                    <TabsContent value="location" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Map className="h-5 w-5" />
                            Location Details
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {property.location ? (
                            <>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <InfoRow
                                  label="Latitude"
                                  value={property.location.latitude?.toFixed(6)}
                                />
                                <InfoRow
                                  label="Longitude"
                                  value={property.location.longitude?.toFixed(
                                    6
                                  )}
                                />
                              </div>
                              <Separator />
                              <div className="space-y-2">
                                <h4 className="font-medium">Full Address</h4>
                                <p className="text-sm">
                                  {property.basic?.address}
                                  <br />
                                  {property.basic?.postalCode}{" "}
                                  {property.basic?.city}
                                  <br />
                                  {property.basic?.county}
                                </p>
                              </div>
                              {(property as any).basic?.villageId && (
                                <>
                                  <Separator />
                                  <div className="space-y-2">
                                    <h4 className="font-medium">Village</h4>
                                    <Badge
                                      variant="outline"
                                      className="cursor-pointer uppercase"
                                      onClick={() =>
                                        router.push(
                                          `/villages/edit/${
                                            (property as any).basic?.villageId
                                          }`
                                        )
                                      }
                                    >
                                      {(property as any).basic?.village.name}
                                    </Badge>
                                    {/* <Badge variant="outline">
                                      Village ID: {(property as any).basic?.villageId}
                                    </Badge> */}
                                  </div>
                                </>
                              )}
                            </>
                          ) : (
                            <p className="text-muted-foreground text-center py-4">
                              No location information available
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>

                {/* Right Column - Sidebar */}
                <div className="space-y-4">
                  {/* Price */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Price
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {formatPrice(
                          property.basic?.price || 0,
                          property.basic?.currency || "EUR"
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Currency: {property.basic?.currency || "EUR"}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Seller Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Seller Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {(property as any).seller ? (
                        <>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {(property as any).seller.firstName}{" "}
                              {(property as any).seller.lastName}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {(property as any).seller.email}
                            </span>
                          </div>
                          {(property as any).seller.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">
                                {(property as any).seller.phone}
                              </span>
                            </div>
                          )}
                          <Separator />
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">
                                Email Verified
                              </span>
                              <Badge
                                variant={
                                  (property as any).seller.isEmailVerified
                                    ? "default"
                                    : "outline"
                                }
                                className={
                                  (property as any).seller.isEmailVerified
                                    ? "bg-green-500"
                                    : ""
                                }
                              >
                                {(property as any).seller.isEmailVerified
                                  ? "Yes"
                                  : "No"}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">
                                Seller Verified
                              </span>
                              <Badge
                                variant={
                                  (property as any).seller.isSellerVerified
                                    ? "default"
                                    : "outline"
                                }
                                className={
                                  (property as any).seller.isSellerVerified
                                    ? "bg-green-500"
                                    : ""
                                }
                              >
                                {(property as any).seller.isSellerVerified
                                  ? "Yes"
                                  : "No"}
                              </Badge>
                            </div>
                          </div>
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No seller information available
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Timestamps */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Timeline
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Created:</span>
                        <span className="ml-2 font-medium">
                          {new Date(property.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Updated:</span>
                        <span className="ml-2 font-medium">
                          {new Date(property.updatedAt).toLocaleString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Rejection Reason (if rejected) */}
                  {property.status === "REJECTED" &&
                    property.reasonRejection && (
                      <Card className="border-red-200">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-red-600">
                            <AlertTriangle className="h-5 w-5" />
                            Rejection Reason
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm">{property.reasonRejection}</p>
                        </CardContent>
                      </Card>
                    )}
                </div>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>

      {/* Approve Dialog */}
      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve & Publish Property?</AlertDialogTitle>
            <AlertDialogDescription>
              This will make the property visible to all users on the platform.
              The seller will be notified of the approval.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApprove}
              className="bg-green-500 hover:bg-green-600"
            >
              Approve & Publish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Property?</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for rejection. The seller will be
              notified.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="rejection-reason">Rejection Reason</Label>
            <Textarea
              id="rejection-reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Explain why this property is being rejected..."
              rows={4}
              className="mt-2"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              disabled={!rejectionReason.trim()}
              className="bg-red-500 hover:bg-red-600"
            >
              Reject Property
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Image Viewer Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-7xl max-h-[90vh]">
            <img
              src={selectedImage}
              alt="Full size"
              className="max-w-full max-h-[90vh] object-contain"
            />
            <Button
              variant="outline"
              size="sm"
              className="absolute top-4 right-4"
              onClick={() => setSelectedImage(null)}
            >
              <XCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper component for info rows
function InfoRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number | null | undefined;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col">
      <span className="text-muted-foreground flex items-center gap-1">
        {icon}
        {label}:
      </span>
      <span className="font-medium">{value || "N/A"}</span>
    </div>
  );
}

export default AdminPropertyReviewPage;
