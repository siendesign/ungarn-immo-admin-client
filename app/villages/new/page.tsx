"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import React, { useState, useRef, useCallback } from "react";
import {
  MapPin,
  Building,
  Wifi,
  Bus,
  Users,
  Palmtree,
  Link as LinkIcon,
  Save,
  X,
  Plus,
  ArrowLeft,
  CheckCircle,
  Upload,
  ImageIcon,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useCreateVillageMutation } from "@/state/api";
import { useRouter } from "next/navigation";
import Image from "next/image";
import useImageUpload from "@/hooks/use-imageUpload";

interface VillageFormData {
  // Basic Info
  name: string;
  county: string;
  population: number;
  description: string;
  latitude: number;
  longitude: number;
  thumbnailUrl: string | null;

  // Infrastructure
  infrastructure: {
    hasGroceryStore: boolean;
    hasSupermarket: boolean;
    supermarketName: string;
    storeDistanceKm: number | null;
    hasWeeklyMarket: boolean;
    hasBaker: boolean;
    hasButcher: boolean;
    hasHouseDoctor: boolean;
    doctorHours: string;
    doctorGerman: boolean;
    nextSpecialistKm: number | null;
    nextHospitalKm: number | null;
    hasPharmacy: boolean;
    pharmacyHours: string;
    hasDentist: boolean;
    dentistGerman: boolean;
    hasPost: boolean;
    hasAtm: boolean;
    hasBank: boolean;
    bankName: string;
    hasKindergarten: boolean;
    kindergartenInfo: string;
    hasPrimarySchool: boolean;
    primarySchoolInfo: string;
    hasSecondarySchool: boolean;
    secondarySchoolInfo: string;
    restaurantsCount: number;
    restaurantInfo: string;
  };

  // Internet
  internet: {
    typicalSpeed: number;
    internetTypes: string[];
    mobileCoverage: string;
  };

  // Transport
  transport: {
    busRoutes: string;
    busFrequency: string;
    trainStation: string;
    trainDistanceKm: number | null;
    motorwayDistanceKm: number | null;
  };

  // Community
  community: {
    germanCommunityCount: number;
    associations: string;
    festivals: string;
    atmosphere: string;
  };

  // Leisure
  leisure: {
    nearLakes: boolean;
    hikingTrails: boolean;
    bicyclePaths: boolean;
    spaDistanceKm: number | null;
    culturalSites: string;
    nearestTownDistanceKm: number | null;
  };

  // Links
  links: Array<{
    linkType: "WEBSITE" | "WIKIPEDIA" | "YOUTUBE" | "OTHER";
    url: string;
  }>;
}

// Thumbnail Upload Component
interface ThumbnailUploadProps {
  thumbnailUrl: string | null;
  onUpload: (url: string) => void;
  onRemove: () => void;
}

const ThumbnailUpload: React.FC<ThumbnailUploadProps> = ({
  thumbnailUrl,
  onUpload,
  onRemove,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(thumbnailUrl);

  const {
    uploadImage,
    deleteImage,
    isUploading,
    isDeleting,
    progress,
    error,
    reset: resetUpload,
  } = useImageUpload({
    bucket: "listings", // Make sure this bucket exists in Supabase
    folder: "thumbnails",
    maxSizeMB: 5,
    allowedTypes: ["image/jpeg", "image/png", "image/webp"],
  });

  const handleFileSelect = useCallback(
    async (file: File) => {
      // If there's an existing image, delete it first
      if (previewUrl && previewUrl.includes("supabase")) {
        await deleteImage(previewUrl);
      }

      // Show preview immediately
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      // Upload to Supabase
      const url = await uploadImage(file);

      if (url) {
        onUpload(url);
        // Clean up object URL after successful upload
        URL.revokeObjectURL(objectUrl);
        setPreviewUrl(url);
      } else {
        // Revert preview on error
        setPreviewUrl(thumbnailUrl);
        URL.revokeObjectURL(objectUrl);
      }
    },
    [uploadImage, onUpload, thumbnailUrl]
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFileSelect(e.dataTransfer.files[0]);
      }
    },
    [handleFileSelect]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        handleFileSelect(e.target.files[0]);
      }
    },
    [handleFileSelect]
  );

  const handleRemove = useCallback(async () => {
    // Delete from Supabase if it's a Supabase URL
    if (previewUrl && previewUrl.includes("supabase")) {
      const deleted = await deleteImage(previewUrl);
      if (!deleted) {
        // Optionally show error but still proceed with UI removal
        console.error("Failed to delete image from storage");
      }
    }

    setPreviewUrl(null);
    resetUpload();
    onRemove();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [previewUrl, deleteImage, onRemove, resetUpload]);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      <Label>Village Thumbnail</Label>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleInputChange}
        className="hidden"
      />

      {/* Upload area or preview */}
      {previewUrl ? (
        <div className="relative group">
          <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border">
            <Image
              src={previewUrl}
              alt="Village thumbnail preview"
              fill
              className="object-cover"
            />
            {(isUploading || isDeleting) && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="text-center text-white">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <p className="text-sm">
                    {isDeleting ? "Removing..." : `Uploading... ${progress}%`}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Overlay with actions */}
          {!isUploading && !isDeleting && (
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleClick}
                disabled={isDeleting}
              >
                <Upload className="h-4 w-4 mr-2" />
                Replace
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleRemove}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                {isDeleting ? "Removing..." : "Remove"}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={handleClick}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`
            relative cursor-pointer rounded-lg border-2 border-dashed p-8
            transition-colors duration-200
            ${
              dragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
            }
            ${isUploading ? "pointer-events-none" : ""}
          `}
        >
          {isUploading ? (
            <div className="text-center">
              <Loader2 className="h-10 w-10 mx-auto mb-3 text-primary animate-spin" />
              <p className="text-sm font-medium mb-2">Uploading image...</p>
              <Progress value={progress} className="w-full max-w-xs mx-auto" />
              <p className="text-xs text-muted-foreground mt-2">{progress}%</p>
            </div>
          ) : (
            <div className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <ImageIcon className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium mb-1">
                Drop an image here or click to upload
              </p>
              <p className="text-xs text-muted-foreground">
                JPG, PNG, or WebP (max 5MB)
              </p>
            </div>
          )}
        </div>
      )}

      {/* Progress bar during upload */}
      {isUploading && !previewUrl && (
        <Progress value={progress} className="w-full" />
      )}

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <X className="h-4 w-4" />
          {error}
        </div>
      )}
    </div>
  );
};

const CreateVillagePage = () => {
  const router = useRouter();
  const [createVillage, { isLoading }] = useCreateVillageMutation();
  const [activeTab, setActiveTab] = useState("basic");

  // Define tab order for navigation
  const tabs = [
    "basic",
    "infrastructure",
    "internet",
    "transport",
    "community",
    "leisure",
    "links",
  ] as const;

  const currentTabIndex = tabs.indexOf(activeTab as typeof tabs[number]);
  const isFirstTab = currentTabIndex === 0;
  const isLastTab = currentTabIndex === tabs.length - 1;

  const goToNextTab = () => {
    if (!isLastTab) {
      setActiveTab(tabs[currentTabIndex + 1]);
    }
  };

  const goToPreviousTab = () => {
    if (!isFirstTab) {
      setActiveTab(tabs[currentTabIndex - 1]);
    }
  };

  const [formData, setFormData] = useState<VillageFormData>({
    name: "",
    county: "",
    population: 0,
    description: "",
    latitude: 0,
    longitude: 0,
    thumbnailUrl: null,
    infrastructure: {
      hasGroceryStore: false,
      hasSupermarket: false,
      supermarketName: "",
      storeDistanceKm: null,
      hasWeeklyMarket: false,
      hasBaker: false,
      hasButcher: false,
      hasHouseDoctor: false,
      doctorHours: "",
      doctorGerman: false,
      nextSpecialistKm: null,
      nextHospitalKm: null,
      hasPharmacy: false,
      pharmacyHours: "",
      hasDentist: false,
      dentistGerman: false,
      hasPost: false,
      hasAtm: false,
      hasBank: false,
      bankName: "",
      hasKindergarten: false,
      kindergartenInfo: "",
      hasPrimarySchool: false,
      primarySchoolInfo: "",
      hasSecondarySchool: false,
      secondarySchoolInfo: "",
      restaurantsCount: 0,
      restaurantInfo: "",
    },
    internet: {
      typicalSpeed: 0,
      internetTypes: [],
      mobileCoverage: "",
    },
    transport: {
      busRoutes: "",
      busFrequency: "",
      trainStation: "",
      trainDistanceKm: null,
      motorwayDistanceKm: null,
    },
    community: {
      germanCommunityCount: 0,
      associations: "",
      festivals: "",
      atmosphere: "",
    },
    leisure: {
      nearLakes: false,
      hikingTrails: false,
      bicyclePaths: false,
      spaDistanceKm: null,
      culturalSites: "",
      nearestTownDistanceKm: null,
    },
    links: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleBasicChange = (
    field: keyof Pick<
      VillageFormData,
      "name" | "county" | "population" | "description" | "latitude" | "longitude"
    >,
    value: any
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleThumbnailUpload = (url: string) => {
    setFormData((prev) => ({ ...prev, thumbnailUrl: url }));
  };

  const handleThumbnailRemove = () => {
    setFormData((prev) => ({ ...prev, thumbnailUrl: null }));
  };

  const handleInfrastructureChange = (
    field: keyof VillageFormData["infrastructure"],
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      infrastructure: { ...prev.infrastructure, [field]: value },
    }));
  };

  const handleInternetChange = (
    field: keyof VillageFormData["internet"],
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      internet: { ...prev.internet, [field]: value },
    }));
  };

  const handleTransportChange = (
    field: keyof VillageFormData["transport"],
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      transport: { ...prev.transport, [field]: value },
    }));
  };

  const handleCommunityChange = (
    field: keyof VillageFormData["community"],
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      community: { ...prev.community, [field]: value },
    }));
  };

  const handleLeisureChange = (
    field: keyof VillageFormData["leisure"],
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      leisure: { ...prev.leisure, [field]: value },
    }));
  };

  const addLink = () => {
    setFormData((prev) => ({
      ...prev,
      links: [...prev.links, { linkType: "WEBSITE", url: "" }],
    }));
  };

  const removeLink = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index),
    }));
  };

  const updateLink = (
    index: number,
    field: "linkType" | "url",
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      links: prev.links.map((link, i) =>
        i === index ? { ...link, [field]: value } : link
      ),
    }));
  };

  const toggleInternetType = (type: string) => {
    setFormData((prev) => ({
      ...prev,
      internet: {
        ...prev.internet,
        internetTypes: prev.internet.internetTypes.includes(type)
          ? prev.internet.internetTypes.filter((t) => t !== type)
          : [...prev.internet.internetTypes, type],
      },
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Village name is required";
    }
    if (!formData.county.trim()) {
      newErrors.county = "County is required";
    }
    if (formData.population <= 0) {
      newErrors.population = "Population must be greater than 0";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }
    if (formData.latitude === 0) {
      newErrors.latitude = "Latitude is required";
    }
    if (formData.longitude === 0) {
      newErrors.longitude = "Longitude is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setActiveTab("basic");
      return;
    }

    try {
        console.log("Submitting village data:", formData);
        
      await createVillage(formData).unwrap();
      router.push("/villages");
    } catch (error) {
      console.error("Failed to create village:", error);
    }
  };

  const getCompletionStatus = () => {
    const sections = {
      basic: !!(
        formData.name &&
        formData.county &&
        formData.population &&
        formData.description &&
        formData.latitude &&
        formData.longitude
      ),
      infrastructure: !!(formData.infrastructure.restaurantsCount >= 0),
      internet: !!(
        formData.internet.typicalSpeed > 0 &&
        formData.internet.internetTypes.length > 0
      ),
      transport: !!formData.transport.busRoutes,
      community: !!formData.community.germanCommunityCount,
      leisure: true, // Optional
      links: true, // Optional
    };

    return sections;
  };

  const completionStatus = getCompletionStatus();

  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarProvider className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset>
            <div className="flex flex-1 flex-col gap-4 p-4">
              {/* Header */}
              <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push("/villages")}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Villages
                    </Button>
                  </div>
                  <h1 className="text-3xl font-bold tracking-tight mt-2">
                    Create New Village
                  </h1>
                  <p className="text-muted-foreground">
                    Add a new village to the system with complete information
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => router.push("/villages")}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit} disabled={isLoading}>
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading ? "Creating..." : "Create Village"}
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Form Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-7 ">
                  <TabsTrigger value="basic" className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <p className="hidden md:flex">Basic</p>
                    {completionStatus.basic && (
                      <CheckCircle className="h-3 w-3 text-green-500" />
                    )}
                  </TabsTrigger>
                  <TabsTrigger
                    value="infrastructure"
                    className="flex items-center gap-1"
                  >
                    <Building className="h-3 w-3" />
                    <p className="hidden md:flex">Infrastructure</p>
                    {completionStatus.infrastructure && (
                      <CheckCircle className="h-3 w-3 text-green-500" />
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="internet" className="flex items-center gap-1">
                    <Wifi className="h-3 w-3" />
                    <p className="hidden md:flex">Internet</p>
                    {completionStatus.internet && (
                      <CheckCircle className="h-3 w-3 text-green-500" />
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="transport" className="flex items-center gap-1">
                    <Bus className="h-3 w-3" />
                    <p className="hidden md:flex">Transport</p>
                    {completionStatus.transport && (
                      <CheckCircle className="h-3 w-3 text-green-500" />
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="community" className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <p className="hidden md:flex">Community</p>
                    {completionStatus.community && (
                      <CheckCircle className="h-3 w-3 text-green-500" />
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="leisure" className="flex items-center gap-1">
                    <Palmtree className="h-3 w-3" />
                    <p className="hidden md:flex">Leisure</p>
                    {completionStatus.leisure && (
                      <CheckCircle className="h-3 w-3 text-green-500" />
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="links" className="flex items-center gap-1">
                    <LinkIcon className="h-3 w-3" />
                    <p className="hidden md:flex">Links</p>
                    {completionStatus.links && (
                      <CheckCircle className="h-3 w-3 text-green-500" />
                    )}
                  </TabsTrigger>
                </TabsList>

                {/* Basic Info Tab */}
                <TabsContent value="basic" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Basic Information</CardTitle>
                      <CardDescription>
                        Essential details about the village
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Thumbnail Upload Section */}
                      <ThumbnailUpload
                        thumbnailUrl={formData.thumbnailUrl}
                        onUpload={handleThumbnailUpload}
                        onRemove={handleThumbnailRemove}
                      />

                      <Separator className="my-4" />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">
                            Village Name <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) =>
                              handleBasicChange("name", e.target.value)
                            }
                            placeholder="Enter village name"
                            className={errors.name ? "border-red-500" : ""}
                          />
                          {errors.name && (
                            <p className="text-sm text-red-500">{errors.name}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="county">
                            County <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="county"
                            value={formData.county}
                            onChange={(e) =>
                              handleBasicChange("county", e.target.value)
                            }
                            placeholder="Enter county name"
                            className={errors.county ? "border-red-500" : ""}
                          />
                          {errors.county && (
                            <p className="text-sm text-red-500">{errors.county}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="population">
                            Population <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="population"
                            type="number"
                            value={formData.population || ""}
                            onChange={(e) =>
                              handleBasicChange(
                                "population",
                                parseInt(e.target.value) || 0
                              )
                            }
                            placeholder="Enter population"
                            className={errors.population ? "border-red-500" : ""}
                          />
                          {errors.population && (
                            <p className="text-sm text-red-500">
                              {errors.population}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label>
                            Coordinates <span className="text-red-500">*</span>
                          </Label>
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              type="number"
                              step="0.000001"
                              value={formData.latitude || ""}
                              onChange={(e) =>
                                handleBasicChange(
                                  "latitude",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              placeholder="Latitude"
                              className={errors.latitude ? "border-red-500" : ""}
                            />
                            <Input
                              type="number"
                              step="0.000001"
                              value={formData.longitude || ""}
                              onChange={(e) =>
                                handleBasicChange(
                                  "longitude",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              placeholder="Longitude"
                              className={errors.longitude ? "border-red-500" : ""}
                            />
                          </div>
                          {(errors.latitude || errors.longitude) && (
                            <p className="text-sm text-red-500">
                              Valid coordinates are required
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">
                          Description <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) =>
                            handleBasicChange("description", e.target.value)
                          }
                          placeholder="Describe the village..."
                          rows={4}
                          className={errors.description ? "border-red-500" : ""}
                        />
                        {errors.description && (
                          <p className="text-sm text-red-500">
                            {errors.description}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Infrastructure Tab - Keep existing content */}
                <TabsContent value="infrastructure" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Infrastructure</CardTitle>
                      <CardDescription>
                        Amenities and services available in the village
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Shopping */}
                      <div>
                        <h3 className="font-semibold mb-3">Shopping</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="hasGroceryStore"
                              checked={formData.infrastructure.hasGroceryStore}
                              onCheckedChange={(checked) =>
                                handleInfrastructureChange(
                                  "hasGroceryStore",
                                  checked
                                )
                              }
                            />
                            <Label htmlFor="hasGroceryStore">
                              Has Grocery Store
                            </Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="hasSupermarket"
                              checked={formData.infrastructure.hasSupermarket}
                              onCheckedChange={(checked) =>
                                handleInfrastructureChange("hasSupermarket", checked)
                              }
                            />
                            <Label htmlFor="hasSupermarket">Has Supermarket</Label>
                          </div>

                          {formData.infrastructure.hasSupermarket && (
                            <div className="space-y-2">
                              <Label htmlFor="supermarketName">
                                Supermarket Name
                              </Label>
                              <Input
                                id="supermarketName"
                                value={formData.infrastructure.supermarketName}
                                onChange={(e) =>
                                  handleInfrastructureChange(
                                    "supermarketName",
                                    e.target.value
                                  )
                                }
                                placeholder="e.g., Lidl, Aldi"
                              />
                            </div>
                          )}

                          <div className="space-y-2">
                            <Label htmlFor="storeDistanceKm">
                              Store Distance (km)
                            </Label>
                            <Input
                              id="storeDistanceKm"
                              type="number"
                              step="0.1"
                              value={formData.infrastructure.storeDistanceKm || ""}
                              onChange={(e) =>
                                handleInfrastructureChange(
                                  "storeDistanceKm",
                                  e.target.value
                                    ? parseFloat(e.target.value)
                                    : null
                                )
                              }
                              placeholder="Distance to nearest store"
                            />
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="hasWeeklyMarket"
                              checked={formData.infrastructure.hasWeeklyMarket}
                              onCheckedChange={(checked) =>
                                handleInfrastructureChange(
                                  "hasWeeklyMarket",
                                  checked
                                )
                              }
                            />
                            <Label htmlFor="hasWeeklyMarket">
                              Has Weekly Market
                            </Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="hasBaker"
                              checked={formData.infrastructure.hasBaker}
                              onCheckedChange={(checked) =>
                                handleInfrastructureChange("hasBaker", checked)
                              }
                            />
                            <Label htmlFor="hasBaker">Has Baker</Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="hasButcher"
                              checked={formData.infrastructure.hasButcher}
                              onCheckedChange={(checked) =>
                                handleInfrastructureChange("hasButcher", checked)
                              }
                            />
                            <Label htmlFor="hasButcher">Has Butcher</Label>
                          </div>
                        </div>
                      </div>

                      {/* Healthcare */}
                      <div>
                        <h3 className="font-semibold mb-3">Healthcare</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="hasHouseDoctor"
                              checked={formData.infrastructure.hasHouseDoctor}
                              onCheckedChange={(checked) =>
                                handleInfrastructureChange("hasHouseDoctor", checked)
                              }
                            />
                            <Label htmlFor="hasHouseDoctor">Has House Doctor</Label>
                          </div>

                          {formData.infrastructure.hasHouseDoctor && (
                            <>
                              <div className="space-y-2">
                                <Label htmlFor="doctorHours">Doctor Hours</Label>
                                <Input
                                  id="doctorHours"
                                  value={formData.infrastructure.doctorHours}
                                  onChange={(e) =>
                                    handleInfrastructureChange(
                                      "doctorHours",
                                      e.target.value
                                    )
                                  }
                                  placeholder="e.g., Mon-Fri 9-17"
                                />
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="doctorGerman"
                                  checked={formData.infrastructure.doctorGerman}
                                  onCheckedChange={(checked) =>
                                    handleInfrastructureChange(
                                      "doctorGerman",
                                      checked
                                    )
                                  }
                                />
                                <Label htmlFor="doctorGerman">
                                  Doctor Speaks German
                                </Label>
                              </div>
                            </>
                          )}

                          <div className="space-y-2">
                            <Label htmlFor="nextSpecialistKm">
                              Distance to Specialist (km)
                            </Label>
                            <Input
                              id="nextSpecialistKm"
                              type="number"
                              step="0.1"
                              value={formData.infrastructure.nextSpecialistKm || ""}
                              onChange={(e) =>
                                handleInfrastructureChange(
                                  "nextSpecialistKm",
                                  e.target.value
                                    ? parseFloat(e.target.value)
                                    : null
                                )
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="nextHospitalKm">
                              Distance to Hospital (km)
                            </Label>
                            <Input
                              id="nextHospitalKm"
                              type="number"
                              step="0.1"
                              value={formData.infrastructure.nextHospitalKm || ""}
                              onChange={(e) =>
                                handleInfrastructureChange(
                                  "nextHospitalKm",
                                  e.target.value
                                    ? parseFloat(e.target.value)
                                    : null
                                )
                              }
                            />
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="hasPharmacy"
                              checked={formData.infrastructure.hasPharmacy}
                              onCheckedChange={(checked) =>
                                handleInfrastructureChange("hasPharmacy", checked)
                              }
                            />
                            <Label htmlFor="hasPharmacy">Has Pharmacy</Label>
                          </div>

                          {formData.infrastructure.hasPharmacy && (
                            <div className="space-y-2">
                              <Label htmlFor="pharmacyHours">Pharmacy Hours</Label>
                              <Input
                                id="pharmacyHours"
                                value={formData.infrastructure.pharmacyHours}
                                onChange={(e) =>
                                  handleInfrastructureChange(
                                    "pharmacyHours",
                                    e.target.value
                                  )
                                }
                                placeholder="e.g., Mon-Fri 8-18"
                              />
                            </div>
                          )}

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="hasDentist"
                              checked={formData.infrastructure.hasDentist}
                              onCheckedChange={(checked) =>
                                handleInfrastructureChange("hasDentist", checked)
                              }
                            />
                            <Label htmlFor="hasDentist">Has Dentist</Label>
                          </div>

                          {formData.infrastructure.hasDentist && (
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="dentistGerman"
                                checked={formData.infrastructure.dentistGerman}
                                onCheckedChange={(checked) =>
                                  handleInfrastructureChange(
                                    "dentistGerman",
                                    checked
                                  )
                                }
                              />
                              <Label htmlFor="dentistGerman">
                                Dentist Speaks German
                              </Label>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Services */}
                      <div>
                        <h3 className="font-semibold mb-3">Services</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="hasPost"
                              checked={formData.infrastructure.hasPost}
                              onCheckedChange={(checked) =>
                                handleInfrastructureChange("hasPost", checked)
                              }
                            />
                            <Label htmlFor="hasPost">Has Post Office</Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="hasAtm"
                              checked={formData.infrastructure.hasAtm}
                              onCheckedChange={(checked) =>
                                handleInfrastructureChange("hasAtm", checked)
                              }
                            />
                            <Label htmlFor="hasAtm">Has ATM</Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="hasBank"
                              checked={formData.infrastructure.hasBank}
                              onCheckedChange={(checked) =>
                                handleInfrastructureChange("hasBank", checked)
                              }
                            />
                            <Label htmlFor="hasBank">Has Bank</Label>
                          </div>

                          {formData.infrastructure.hasBank && (
                            <div className="space-y-2">
                              <Label htmlFor="bankName">Bank Name</Label>
                              <Input
                                id="bankName"
                                value={formData.infrastructure.bankName}
                                onChange={(e) =>
                                  handleInfrastructureChange(
                                    "bankName",
                                    e.target.value
                                  )
                                }
                                placeholder="e.g., OTP Bank"
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Education */}
                      <div>
                        <h3 className="font-semibold mb-3">Education</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="hasKindergarten"
                              checked={formData.infrastructure.hasKindergarten}
                              onCheckedChange={(checked) =>
                                handleInfrastructureChange(
                                  "hasKindergarten",
                                  checked
                                )
                              }
                            />
                            <Label htmlFor="hasKindergarten">Has Kindergarten</Label>
                          </div>

                          {formData.infrastructure.hasKindergarten && (
                            <div className="space-y-2">
                              <Label htmlFor="kindergartenInfo">
                                Kindergarten Info
                              </Label>
                              <Input
                                id="kindergartenInfo"
                                value={formData.infrastructure.kindergartenInfo}
                                onChange={(e) =>
                                  handleInfrastructureChange(
                                    "kindergartenInfo",
                                    e.target.value
                                  )
                                }
                                placeholder="Additional information"
                              />
                            </div>
                          )}

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="hasPrimarySchool"
                              checked={formData.infrastructure.hasPrimarySchool}
                              onCheckedChange={(checked) =>
                                handleInfrastructureChange(
                                  "hasPrimarySchool",
                                  checked
                                )
                              }
                            />
                            <Label htmlFor="hasPrimarySchool">
                              Has Primary School
                            </Label>
                          </div>

                          {formData.infrastructure.hasPrimarySchool && (
                            <div className="space-y-2">
                              <Label htmlFor="primarySchoolInfo">
                                Primary School Info
                              </Label>
                              <Input
                                id="primarySchoolInfo"
                                value={formData.infrastructure.primarySchoolInfo}
                                onChange={(e) =>
                                  handleInfrastructureChange(
                                    "primarySchoolInfo",
                                    e.target.value
                                  )
                                }
                                placeholder="Additional information"
                              />
                            </div>
                          )}

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="hasSecondarySchool"
                              checked={formData.infrastructure.hasSecondarySchool}
                              onCheckedChange={(checked) =>
                                handleInfrastructureChange(
                                  "hasSecondarySchool",
                                  checked
                                )
                              }
                            />
                            <Label htmlFor="hasSecondarySchool">
                              Has Secondary School
                            </Label>
                          </div>

                          {formData.infrastructure.hasSecondarySchool && (
                            <div className="space-y-2">
                              <Label htmlFor="secondarySchoolInfo">
                                Secondary School Info
                              </Label>
                              <Input
                                id="secondarySchoolInfo"
                                value={formData.infrastructure.secondarySchoolInfo}
                                onChange={(e) =>
                                  handleInfrastructureChange(
                                    "secondarySchoolInfo",
                                    e.target.value
                                  )
                                }
                                placeholder="Additional information"
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Restaurants */}
                      <div>
                        <h3 className="font-semibold mb-3">Dining</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="restaurantsCount">
                              Number of Restaurants
                            </Label>
                            <Input
                              id="restaurantsCount"
                              type="number"
                              value={formData.infrastructure.restaurantsCount || ""}
                              onChange={(e) =>
                                handleInfrastructureChange(
                                  "restaurantsCount",
                                  parseInt(e.target.value) || 0
                                )
                              }
                            />
                          </div>

                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="restaurantInfo">Restaurant Info</Label>
                            <Textarea
                              id="restaurantInfo"
                              value={formData.infrastructure.restaurantInfo}
                              onChange={(e) =>
                                handleInfrastructureChange(
                                  "restaurantInfo",
                                  e.target.value
                                )
                              }
                              placeholder="Describe available restaurants..."
                              rows={2}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Internet Tab */}
                <TabsContent value="internet" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Internet & Connectivity</CardTitle>
                      <CardDescription>
                        Internet options and mobile coverage
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="typicalSpeed">
                            Typical Speed (Mbps)
                          </Label>
                          <Input
                            id="typicalSpeed"
                            type="number"
                            value={formData.internet.typicalSpeed || ""}
                            onChange={(e) =>
                              handleInternetChange(
                                "typicalSpeed",
                                parseInt(e.target.value) || 0
                              )
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="mobileCoverage">Mobile Coverage</Label>
                          <Select
                            value={formData.internet.mobileCoverage}
                            onValueChange={(value) =>
                              handleInternetChange("mobileCoverage", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select coverage" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="excellent">Excellent</SelectItem>
                              <SelectItem value="good">Good</SelectItem>
                              <SelectItem value="moderate">Moderate</SelectItem>
                              <SelectItem value="poor">Poor</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label>Internet Types Available</Label>
                          <div className="flex flex-wrap gap-2">
                            {["DSL", "Fiber", "Cable", "Mobile", "Satellite"].map(
                              (type) => (
                                <Badge
                                  key={type}
                                  variant={
                                    formData.internet.internetTypes.includes(type)
                                      ? "default"
                                      : "outline"
                                  }
                                  className="cursor-pointer"
                                  onClick={() => toggleInternetType(type)}
                                >
                                  {type}
                                </Badge>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Transport Tab */}
                <TabsContent value="transport" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Transportation</CardTitle>
                      <CardDescription>
                        Public transport and road access
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="busRoutes">Bus Routes</Label>
                          <Input
                            id="busRoutes"
                            value={formData.transport.busRoutes}
                            onChange={(e) =>
                              handleTransportChange("busRoutes", e.target.value)
                            }
                            placeholder="e.g., Route 10, 15"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="busFrequency">Bus Frequency</Label>
                          <Input
                            id="busFrequency"
                            value={formData.transport.busFrequency}
                            onChange={(e) =>
                              handleTransportChange("busFrequency", e.target.value)
                            }
                            placeholder="e.g., Every 30 mins"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="trainStation">Nearest Train Station</Label>
                          <Input
                            id="trainStation"
                            value={formData.transport.trainStation}
                            onChange={(e) =>
                              handleTransportChange("trainStation", e.target.value)
                            }
                            placeholder="Station name"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="trainDistanceKm">
                            Distance to Station (km)
                          </Label>
                          <Input
                            id="trainDistanceKm"
                            type="number"
                            step="0.1"
                            value={formData.transport.trainDistanceKm || ""}
                            onChange={(e) =>
                              handleTransportChange(
                                "trainDistanceKm",
                                e.target.value ? parseFloat(e.target.value) : null
                              )
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="motorwayDistanceKm">
                            Distance to Motorway (km)
                          </Label>
                          <Input
                            id="motorwayDistanceKm"
                            type="number"
                            step="0.1"
                            value={formData.transport.motorwayDistanceKm || ""}
                            onChange={(e) =>
                              handleTransportChange(
                                "motorwayDistanceKm",
                                e.target.value ? parseFloat(e.target.value) : null
                              )
                            }
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Community Tab */}
                <TabsContent value="community" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Community</CardTitle>
                      <CardDescription>
                        Local community information
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="germanCommunityCount">
                            German Community Size
                          </Label>
                          <Input
                            id="germanCommunityCount"
                            type="number"
                            value={formData.community.germanCommunityCount || ""}
                            onChange={(e) =>
                              handleCommunityChange(
                                "germanCommunityCount",
                                parseInt(e.target.value) || 0
                              )
                            }
                          />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="associations">Local Associations</Label>
                          <Textarea
                            id="associations"
                            value={formData.community.associations}
                            onChange={(e) =>
                              handleCommunityChange("associations", e.target.value)
                            }
                            placeholder="List local associations..."
                            rows={3}
                          />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="festivals">Festivals & Events</Label>
                          <Textarea
                            id="festivals"
                            value={formData.community.festivals}
                            onChange={(e) =>
                              handleCommunityChange("festivals", e.target.value)
                            }
                            placeholder="Describe annual festivals..."
                            rows={3}
                          />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="atmosphere">Village Atmosphere</Label>
                          <Textarea
                            id="atmosphere"
                            value={formData.community.atmosphere}
                            onChange={(e) =>
                              handleCommunityChange("atmosphere", e.target.value)
                            }
                            placeholder="Describe the general atmosphere and character..."
                            rows={3}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Leisure Tab */}
                <TabsContent value="leisure" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Leisure & Recreation</CardTitle>
                      <CardDescription>
                        Recreational facilities and attractions
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="nearLakes"
                            checked={formData.leisure.nearLakes}
                            onCheckedChange={(checked) =>
                              handleLeisureChange("nearLakes", checked)
                            }
                          />
                          <Label htmlFor="nearLakes">Near Lakes</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="hikingTrails"
                            checked={formData.leisure.hikingTrails}
                            onCheckedChange={(checked) =>
                              handleLeisureChange("hikingTrails", checked)
                            }
                          />
                          <Label htmlFor="hikingTrails">Hiking Trails</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="bicyclePaths"
                            checked={formData.leisure.bicyclePaths}
                            onCheckedChange={(checked) =>
                              handleLeisureChange("bicyclePaths", checked)
                            }
                          />
                          <Label htmlFor="bicyclePaths">Bicycle Paths</Label>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="spaDistanceKm">
                            Distance to Spa (km)
                          </Label>
                          <Input
                            id="spaDistanceKm"
                            type="number"
                            step="0.1"
                            value={formData.leisure.spaDistanceKm || ""}
                            onChange={(e) =>
                              handleLeisureChange(
                                "spaDistanceKm",
                                e.target.value ? parseFloat(e.target.value) : null
                              )
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="nearestTownDistanceKm">
                            Distance to Nearest Town (km)
                          </Label>
                          <Input
                            id="nearestTownDistanceKm"
                            type="number"
                            step="0.1"
                            value={formData.leisure.nearestTownDistanceKm || ""}
                            onChange={(e) =>
                              handleLeisureChange(
                                "nearestTownDistanceKm",
                                e.target.value ? parseFloat(e.target.value) : null
                              )
                            }
                          />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="culturalSites">Cultural Sites</Label>
                          <Textarea
                            id="culturalSites"
                            value={formData.leisure.culturalSites}
                            onChange={(e) =>
                              handleLeisureChange("culturalSites", e.target.value)
                            }
                            placeholder="Describe cultural attractions..."
                            rows={3}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Links Tab */}
                <TabsContent value="links" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>External Links</CardTitle>
                          <CardDescription>
                            Useful links about the village
                          </CardDescription>
                        </div>
                        <Button onClick={addLink} size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Link
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {formData.links.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          No links added yet. Click "Add Link" to get started.
                        </div>
                      ) : (
                        formData.links.map((link, index) => (
                          <div
                            key={index}
                            className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg"
                          >
                            <div className="space-y-2">
                              <Label>Link Type</Label>
                              <Select
                                value={link.linkType}
                                onValueChange={(value: any) =>
                                  updateLink(index, "linkType", value)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="WEBSITE">Website</SelectItem>
                                  <SelectItem value="WIKIPEDIA">
                                    Wikipedia
                                  </SelectItem>
                                  <SelectItem value="YOUTUBE">YouTube</SelectItem>
                                  <SelectItem value="OTHER">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2 md:col-span-2">
                              <div className="flex items-center justify-between">
                                <Label>URL</Label>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeLink(index)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                              <Input
                                value={link.url}
                                onChange={(e) =>
                                  updateLink(index, "url", e.target.value)
                                }
                                placeholder="https://..."
                              />
                            </div>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Bottom Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => router.push("/villages")}
                  >
                    Cancel
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  {/* Previous Button */}
                  <Button
                    variant="outline"
                    onClick={goToPreviousTab}
                    disabled={isFirstTab}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>

                  {/* Next or Submit Button */}
                  {isLastTab ? (
                    <Button onClick={handleSubmit} disabled={isLoading}>
                      <Save className="h-4 w-4 mr-2" />
                      {isLoading ? "Creating..." : "Create Village"}
                    </Button>
                  ) : (
                    <Button onClick={goToNextTab}>
                      Next
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Tab Progress Indicator */}
              <div className="flex items-center justify-center gap-1 pt-2">
                {tabs.map((tab, index) => (
                  <div
                    key={tab}
                    className={`h-2 w-8 rounded-full transition-colors ${
                      index <= currentTabIndex
                        ? "bg-primary"
                        : "bg-muted"
                    }`}
                  />
                ))}
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default CreateVillagePage;