"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MapPin,
  Bed,
  Bath,
  Maximize,
  Calendar,
  Home,
  Zap,
  Droplets,
  Thermometer,
  Wifi,
  Euro,
  User,
} from "lucide-react";
import { Property } from "@/types/index.t";

interface PropertyDetailModalProps {
  property: any | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PropertyDetailModal({
  property,
  open,
  onOpenChange,
}: PropertyDetailModalProps) {
  if (!property) return null;

  const formatPrice = (price: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Property Details</DialogTitle>
          <DialogDescription>
            Complete information about this property
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-8rem)]">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="condition">Condition</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              {/* Image Gallery */}
              {property.media && property.media.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {property.media.slice(0, 4).map((media: any, index: any) => (
                    <div
                      key={media.id}
                      className={`relative ${
                        index === 0 ? "col-span-2 h-64" : "h-32"
                      } bg-muted rounded-lg overflow-hidden`}
                    >
                      <img
                        src={media.url}
                        alt={`Property ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Basic Information */}
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-3xl font-bold">
                      {formatPrice(
                        property.basic?.price || 0,
                        property.basic?.currency || "USD"
                      )}
                    </h3>
                    <Badge className="text-sm">{property.status}</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground mt-2">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {property.basic?.address}, {property.basic?.city},{" "}
                      {property.basic?.county}
                    </span>
                  </div>
                </div>

                <Separator />

                {/* Property Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <Bed className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="text-2xl font-bold">
                        {property.basic?.bedrooms || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Bedrooms
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bath className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="text-2xl font-bold">
                        {property.basic?.bathrooms || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Bathrooms
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Maximize className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="text-2xl font-bold">
                        {property.basic?.livingArea || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">m²</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Home className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="text-2xl font-bold">
                        {property.basic?.rooms || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Rooms</div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Additional Info */}
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
                    <span className="text-muted-foreground">Build Year:</span>
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
                  <div>
                    <span className="text-muted-foreground">Listed Date:</span>
                    <span className="ml-2 font-medium">
                      {new Date(property.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Details Tab */}
            <TabsContent value="details" className="space-y-4">
              {property.details ? (
                <>
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg">Construction</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <InfoRow
                        label="Material"
                        value={property.details.material}
                      />
                      <InfoRow
                        label="Roof Type"
                        value={property.details.roofType}
                      />
                      <InfoRow
                        label="Roof Condition"
                        value={property.details.roofCondition}
                      />
                      <InfoRow
                        label="Insulation"
                        value={property.details.insulation}
                      />
                      <InfoRow
                        label="Windows"
                        value={property.details.windows}
                      />
                      <InfoRow
                        label="Windows Age"
                        value={property.details.windowsAge}
                      />
                      <InfoRow
                        label="Roller Shutters"
                        value={
                          property.details.hasRollerShutters ? "Yes" : "No"
                        }
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg flex items-center gap-2">
                      <Thermometer className="h-5 w-5" />
                      Utilities & Systems
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <InfoRow
                        label="Heating Type"
                        value={property.details.heatingType}
                        icon={<Thermometer className="h-4 w-4" />}
                      />
                      <InfoRow
                        label="Heating Condition"
                        value={property.details.heatingCondition}
                      />
                      <InfoRow
                        label="Electric Condition"
                        value={property.details.electricCondition}
                        icon={<Zap className="h-4 w-4" />}
                      />
                      <InfoRow
                        label="Water Condition"
                        value={property.details.waterCondition}
                        icon={<Droplets className="h-4 w-4" />}
                      />
                      <InfoRow
                        label="Internet Type"
                        value={property.details.internetType}
                        icon={<Wifi className="h-4 w-4" />}
                      />
                      <InfoRow
                        label="Internet Speed"
                        value={property.details.internetSpeed}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg">Energy</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <InfoRow
                        label="Energy Certificate"
                        value={
                          property.details.energyCertificate ? "Yes" : "No"
                        }
                      />
                      <InfoRow
                        label="Energy Class"
                        value={property.details.energyClass}
                      />
                      <InfoRow
                        label="Energy Consumption"
                        value={property.details.energyConsumption}
                      />
                      <InfoRow
                        label="Monthly Costs"
                        value={
                          property.details.monthlyCosts
                            ? `${property.details.monthlyCosts} ${property.basic?.currency}`
                            : "N/A"
                        }
                        icon={<Euro className="h-4 w-4" />}
                      />
                    </div>
                  </div>

                  {property.details.gardenDesc && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <h4 className="font-semibold text-lg">Garden</h4>
                        <p className="text-sm text-muted-foreground">
                          {property.details.gardenDesc}
                        </p>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No detailed information available
                </div>
              )}
            </TabsContent>

            {/* Condition Tab */}
            <TabsContent value="condition" className="space-y-4">
              {property.condition ? (
                <>
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg">Ratings</h4>
                    <div className="grid grid-cols-1 gap-4">
                      <RatingRow
                        label="Structure Rating"
                        rating={property.condition.structureRating}
                      />
                      <RatingRow
                        label="Electric Rating"
                        rating={property.condition.electricRating}
                      />
                      <RatingRow
                        label="Heating Rating"
                        rating={property.condition.heatingRating}
                      />
                    </div>
                  </div>

                  {property.condition.damageDescription && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <h4 className="font-semibold text-lg">
                          Damage Description
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {property.condition.damageDescription}
                        </p>
                      </div>
                    </>
                  )}

                  {property.condition.renovationNeeded && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <h4 className="font-semibold text-lg">
                          Renovation Needed
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {property.condition.renovationNeeded}
                        </p>
                      </div>
                    </>
                  )}

                  {property.condition.additionalNotes && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <h4 className="font-semibold text-lg">
                          Additional Notes
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {property.condition.additionalNotes}
                        </p>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No condition information available
                </div>
              )}
            </TabsContent>

            {/* Media Tab */}
            <TabsContent value="media" className="space-y-4">
              {property.media && property.media.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {property.media.map((media: any, index: any) => (
                    <div
                      key={media.id}
                      className="relative h-48 bg-muted rounded-lg overflow-hidden"
                    >
                      <img
                        src={media.url}
                        alt={`Property ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <Badge className="absolute top-2 left-2">
                        {media.mediaType}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No media available
                </div>
              )}

              {property.floorplans && property.floorplans.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg">Floor Plans</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {property.floorplans.map((plan: any, index: any) => (
                        <div
                          key={plan.id}
                          className="relative h-64 bg-muted rounded-lg overflow-hidden"
                        >
                          <img
                            src={plan.url}
                            alt={`Floor plan ${index + 1}`}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

// Helper components
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

function RatingRow({
  label,
  rating,
}: {
  label: string;
  rating: number | null | undefined;
}) {
  const ratingValue = rating || 0;
  const maxRating = 5;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm text-muted-foreground">
          {ratingValue}/{maxRating}
        </span>
      </div>
      <div className="flex gap-1">
        {[...Array(maxRating)].map((_, index) => (
          <div
            key={index}
            className={`h-2 flex-1 rounded-full ${
              index < ratingValue ? "bg-primary" : "bg-muted"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
