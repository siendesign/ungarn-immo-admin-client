"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
// Import CSS
import "leaflet/dist/leaflet.css";
// ============================================
// Types and Interfaces
// ============================================

type SelectionMode = "area" | "pinpoint";
type AreaType = "circle" | "polygon";

interface Location {
  lat: number;
  lng: number;
  address?: string;
}

interface AreaSelection {
  type: AreaType;
  center?: Location;
  radius?: number;
  points?: Location[];
}

interface LocationData {
  area?: AreaSelection;
  pinpoint?: Location;
}

interface LocationPickerProps {
  initialData?: LocationData;
  onLocationChange?: (data: LocationData) => void;
  defaultCenter?: [number, number];
  defaultZoom?: number;
}

interface SearchResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  importance: number;
}

// Radius options in meters
const RADIUS_OPTIONS = [
  { label: "500m", value: 500 },
  { label: "1km", value: 1000 },
  { label: "2km", value: 2000 },
  { label: "5km", value: 5000 },
  { label: "10km", value: 10000 },
];

// ============================================
// Debounce Hook
// ============================================

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// ============================================
// Search Bar Component (No Leaflet dependency)
// ============================================

function LocationSearch({
  onLocationSelect,
}: {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    async function searchLocations() {
      if (debouncedQuery.length < 3) {
        setResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            debouncedQuery
          )}&limit=5&addressdetails=1`
        );
        const data = await response.json();
        setResults(data);
        setShowResults(true);
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }

    searchLocations();
  }, [debouncedQuery]);

  const handleSelect = (result: SearchResult) => {
    onLocationSelect(
      parseFloat(result.lat),
      parseFloat(result.lon),
      result.display_name
    );
    setQuery(result.display_name.split(",")[0]);
    setShowResults(false);
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setShowResults(false);
  };

  return (
    <div ref={searchRef} className="relative w-full ">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setShowResults(true)}
          placeholder="Search for a location..."
          className="w-full px-4 py-2.5 pl-10 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
        />
        <svg
          className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>

        {isSearching ? (
          <svg
            className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        ) : query ? (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        ) : null}
      </div>

      {showResults && results.length > 0 && (
        <div className="absolute z-[1001] w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          {results.map((result) => (
            <button
              key={result.place_id}
              onClick={() => handleSelect(result)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
            >
              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {result.display_name.split(",")[0]}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {result.display_name.split(",").slice(1).join(",").trim()}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {showResults &&
        query.length >= 3 &&
        !isSearching &&
        results.length === 0 && (
          <div className="absolute z-[1001] w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500 text-center">
              No locations found
            </p>
          </div>
        )}
    </div>
  );
}

// ============================================
// Map Component (Client-side only)
// ============================================

function LocationPickerMapInner({
  initialData,
  onLocationChange,
  defaultCenter = [9.0765, 7.3986],
  defaultZoom = 13,
}: LocationPickerProps) {
  // Dynamic imports for Leaflet (only runs on client)
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [L, setL] = useState<typeof import("leaflet") | null>(null);
  const [ReactLeaflet, setReactLeaflet] = useState<
    typeof import("react-leaflet") | null
  >(null);

  useEffect(() => {
    // Import Leaflet and React-Leaflet dynamically
    Promise.all([import("leaflet"), import("react-leaflet")]).then(
      ([leaflet, reactLeaflet]) => {
        setL(leaflet);
        setReactLeaflet(reactLeaflet);
        setLeafletLoaded(true);
      }
    );
  }, []);

  const [mode, setMode] = useState<SelectionMode>("area");
  const [areaType, setAreaType] = useState<AreaType>("circle");
  const [areaCenter, setAreaCenter] = useState<{
    lat: number;
    lng: number;
  } | null>(initialData?.area?.center || null);
  const [radius, setRadius] = useState<number>(
    initialData?.area?.radius || 1000
  );
  const [polygonPoints, setPolygonPoints] = useState<
    { lat: number; lng: number }[]
  >(initialData?.area?.points || []);
  const [pinpoint, setPinpoint] = useState<{ lat: number; lng: number } | null>(
    initialData?.pinpoint || null
  );
  const [areaAddress, setAreaAddress] = useState<string>("");
  const [pinpointAddress, setPinpointAddress] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [flyToPosition, setFlyToPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // Reverse geocoding
  const fetchAddress = useCallback(
    async (lat: number, lng: number): Promise<string> => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14`
        );
        const data = await response.json();
        return data.display_name || "Address not found";
      } catch (error) {
        console.error("Error fetching address:", error);
        return "Unable to fetch address";
      }
    },
    []
  );

  // Build and emit location data
  const emitLocationData = useCallback(
    (
      data: Partial<{
        areaCenter: { lat: number; lng: number } | null;
        radius: number;
        polygonPoints: { lat: number; lng: number }[];
        pinpoint: { lat: number; lng: number } | null;
        areaType: AreaType;
        areaAddress: string;
        pinpointAddress: string;
      }>
    ) => {
      const currentAreaCenter = data.areaCenter ?? areaCenter;
      const currentRadius = data.radius ?? radius;
      const currentPolygonPoints = data.polygonPoints ?? polygonPoints;
      const currentPinpoint = data.pinpoint ?? pinpoint;
      const currentAreaType = data.areaType ?? areaType;

      const locationData: LocationData = {};

      if (currentAreaType === "circle" && currentAreaCenter) {
        locationData.area = {
          type: "circle",
          center: {
            lat: currentAreaCenter.lat,
            lng: currentAreaCenter.lng,
            address: data.areaAddress ?? areaAddress,
          },
          radius: currentRadius,
        };
      } else if (
        currentAreaType === "polygon" &&
        currentPolygonPoints.length >= 3
      ) {
        locationData.area = {
          type: "polygon",
          points: currentPolygonPoints.map((p) => ({ lat: p.lat, lng: p.lng })),
        };
      }

      if (currentPinpoint) {
        locationData.pinpoint = {
          lat: currentPinpoint.lat,
          lng: currentPinpoint.lng,
          address: data.pinpointAddress ?? pinpointAddress,
        };
      }

      onLocationChange?.(locationData);
    },
    [
      areaCenter,
      radius,
      polygonPoints,
      pinpoint,
      areaType,
      areaAddress,
      pinpointAddress,
      onLocationChange,
    ]
  );

  // Handle search result selection
  const handleSearchSelect = useCallback(
    (lat: number, lng: number, address: string) => {
      const newPosition = { lat, lng };
      setFlyToPosition(newPosition);

      if (mode === "area" && areaType === "circle") {
        setAreaCenter(newPosition);
        setAreaAddress(address);
        emitLocationData({ areaCenter: newPosition, areaAddress: address });
      } else if (mode === "pinpoint") {
        setPinpoint(newPosition);
        setPinpointAddress(address);
        emitLocationData({ pinpoint: newPosition, pinpointAddress: address });
      }
    },
    [mode, areaType, emitLocationData]
  );

  const handleAreaCenterChange = useCallback(
    async (lat: number, lng: number) => {
      const newCenter = { lat, lng };
      setAreaCenter(newCenter);
      setIsLoading(true);
      const address = await fetchAddress(lat, lng);
      setAreaAddress(address);
      setIsLoading(false);
      emitLocationData({ areaCenter: newCenter, areaAddress: address });
    },
    [fetchAddress, emitLocationData]
  );

  const handlePolygonPointAdd = useCallback(
    (lat: number, lng: number) => {
      const newPoints = [...polygonPoints, { lat, lng }];
      setPolygonPoints(newPoints);
      emitLocationData({ polygonPoints: newPoints });
    },
    [polygonPoints, emitLocationData]
  );

  const handlePinpointChange = useCallback(
    async (lat: number, lng: number) => {
      const newPinpoint = { lat, lng };
      setPinpoint(newPinpoint);
      setIsLoading(true);
      const address = await fetchAddress(lat, lng);
      setPinpointAddress(address);
      setIsLoading(false);
      emitLocationData({ pinpoint: newPinpoint, pinpointAddress: address });
    },
    [fetchAddress, emitLocationData]
  );

  const handleRadiusChange = useCallback(
    (newRadius: number) => {
      setRadius(newRadius);
      emitLocationData({ radius: newRadius });
    },
    [emitLocationData]
  );

  const handleAreaTypeChange = useCallback(
    (type: AreaType) => {
      setAreaType(type);
      setAreaCenter(null);
      setPolygonPoints([]);
      setAreaAddress("");
      emitLocationData({
        areaCenter: null,
        polygonPoints: [],
        areaType: type,
        areaAddress: "",
      });
    },
    [emitLocationData]
  );

  const handleClearArea = useCallback(() => {
    setAreaCenter(null);
    setPolygonPoints([]);
    setAreaAddress("");
    emitLocationData({ areaCenter: null, polygonPoints: [], areaAddress: "" });
  }, [emitLocationData]);

  const handleClearPinpoint = useCallback(() => {
    setPinpoint(null);
    setPinpointAddress("");
    emitLocationData({ pinpoint: null, pinpointAddress: "" });
  }, [emitLocationData]);

  const handleUndoPolygonPoint = useCallback(() => {
    const newPoints = polygonPoints.slice(0, -1);
    setPolygonPoints(newPoints);
    emitLocationData({ polygonPoints: newPoints });
  }, [polygonPoints, emitLocationData]);

  const hasAreaSelection =
    (areaType === "circle" && areaCenter) ||
    (areaType === "polygon" && polygonPoints.length >= 3);

  const getInstructionText = () => {
    if (mode === "area") {
      if (areaType === "circle") {
        return areaCenter
          ? "Click elsewhere to move the area, or switch to pinpoint mode"
          : "Click on the map to select a general area";
      } else {
        return polygonPoints.length < 3
          ? `Click to add points (${polygonPoints.length}/3 minimum)`
          : "Click to add more points, or switch to pinpoint mode";
      }
    } else {
      return pinpoint
        ? "Click elsewhere to move the pin"
        : "Click on the map to place an exact location";
    }
  };

  // Loading state while Leaflet loads
  if (!leafletLoaded || !L || !ReactLeaflet) {
    return (
      <div className="w-full space-y-4">
        <LocationSearch onLocationSelect={handleSearchSelect} />
        <div className="h-10 bg-gray-100 rounded-lg animate-pulse w-1/2" />
        <div className="h-[450px] bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
          <span className="text-gray-400">Loading map...</span>
        </div>
      </div>
    );
  }

  const {
    MapContainer,
    TileLayer,
    Marker,
    Circle,
    Polygon,
    useMapEvents,
    useMap,
  } = ReactLeaflet;

  // Create marker icon
  const defaultIcon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  // Map interaction component
  function MapInteraction() {
    useMapEvents({
      click(e) {
        if (mode === "area") {
          if (areaType === "circle") {
            handleAreaCenterChange(e.latlng.lat, e.latlng.lng);
          } else {
            handlePolygonPointAdd(e.latlng.lat, e.latlng.lng);
          }
        } else {
          handlePinpointChange(e.latlng.lat, e.latlng.lng);
        }
      },
    });
    return null;
  }

  // Fly to location component
  function FlyToLocation() {
    const map = useMap();
    useEffect(() => {
      if (flyToPosition) {
        map.flyTo([flyToPosition.lat, flyToPosition.lng], 15, {
          duration: 1.5,
        });
        setFlyToPosition(null);
      }
    }, [map, flyToPosition]);
    return null;
  }

  // Fit to bounds component
  function FitToBounds({ points }: { points: { lat: number; lng: number }[] }) {
    const map = useMap();
    useEffect(() => {
      if (points.length >= 3) {
        const bounds = points.map((p) => [p.lat, p.lng] as [number, number]);
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }, [points, map]);
    return null;
  }

  return (
    <div className="w-full space-y-4 p-5">
      {/* Search Bar */}
      <LocationSearch onLocationSelect={handleSearchSelect} />

      {/* Mode and Type Selection */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex rounded-lg overflow-hidden border border-gray-300">
          <button
            onClick={() => setMode("area")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              mode === "area"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            General Area
          </button>
          <button
            onClick={() => setMode("pinpoint")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              mode === "pinpoint"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Exact Location
          </button>
        </div>

        {mode === "area" && (
          <div className="flex rounded-lg overflow-hidden border border-gray-300">
            <button
              onClick={() => handleAreaTypeChange("circle")}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                areaType === "circle"
                  ? "bg-green-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Circle
            </button>
            <button
              onClick={() => handleAreaTypeChange("polygon")}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                areaType === "polygon"
                  ? "bg-green-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Custom Shape
            </button>
          </div>
        )}

        {mode === "area" && areaType === "circle" && (
          <select
            value={radius}
            onChange={(e) => handleRadiusChange(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
          >
            {RADIUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label} radius
              </option>
            ))}
          </select>
        )}

        {mode === "area" &&
          areaType === "polygon" &&
          polygonPoints.length > 0 && (
            <button
              onClick={handleUndoPolygonPoint}
              className="px-3 py-2 text-sm text-orange-600 hover:text-orange-700 border border-orange-300 rounded-lg hover:bg-orange-50 transition-colors"
            >
              Undo Last Point
            </button>
          )}
      </div>

      {/* Map Container */}
      <div className="relative rounded-lg overflow-hidden border border-gray-300 shadow-sm">
        <MapContainer
          center={defaultCenter}
          zoom={defaultZoom}
          style={{ height: "450px", width: "100%" }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapInteraction />
          <FlyToLocation />

          {areaType === "circle" && areaCenter && (
            <Circle
              center={[areaCenter.lat, areaCenter.lng]}
              radius={radius}
              pathOptions={{
                color: "#3b82f6",
                fillColor: "#3b82f6",
                fillOpacity: 0.2,
                weight: 2,
              }}
            />
          )}

          {areaType === "polygon" && polygonPoints.length >= 3 && (
            <>
              <Polygon
                positions={polygonPoints.map(
                  (p) => [p.lat, p.lng] as [number, number]
                )}
                pathOptions={{
                  color: "#22c55e",
                  fillColor: "#22c55e",
                  fillOpacity: 0.2,
                  weight: 2,
                }}
              />
              <FitToBounds points={polygonPoints} />
            </>
          )}

          {areaType === "polygon" &&
            polygonPoints.map((point, index) => (
              <Circle
                key={index}
                center={[point.lat, point.lng]}
                radius={50}
                pathOptions={{
                  color: "#22c55e",
                  fillColor: "#22c55e",
                  fillOpacity: 0.8,
                  weight: 2,
                }}
              />
            ))}

          {pinpoint && (
            <Marker
              position={[pinpoint.lat, pinpoint.lng]}
              icon={defaultIcon}
            />
          )}
        </MapContainer>

        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-md z-[1000]">
          <p className="text-sm text-gray-700">{getInstructionText()}</p>
        </div>

        <div className="absolute bottom-4 left-4 z-[1000]">
          <div
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              mode === "area"
                ? "bg-blue-100 text-blue-700"
                : "bg-purple-100 text-purple-700"
            }`}
          >
            {mode === "area" ? `Area Mode (${areaType})` : "Pinpoint Mode"}
          </div>
        </div>
      </div>

      {/* Selection Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          className={`rounded-lg p-4 border ${
            hasAreaSelection
              ? "bg-blue-50 border-blue-200"
              : "bg-gray-50 border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900 flex items-center gap-2">
              <span
                className={`w-3 h-3 rounded-full ${
                  hasAreaSelection ? "bg-blue-500" : "bg-gray-300"
                }`}
              />
              General Area
            </h3>
            {hasAreaSelection && (
              <button
                onClick={handleClearArea}
                className="text-xs text-red-600 hover:text-red-700"
              >
                Clear
              </button>
            )}
          </div>

          {hasAreaSelection ? (
            <div className="space-y-2">
              {areaType === "circle" && areaCenter && (
                <>
                  <div className="text-sm">
                    <span className="text-gray-500">Center:</span>{" "}
                    <span className="font-mono">
                      {areaCenter.lat.toFixed(4)}, {areaCenter.lng.toFixed(4)}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">Radius:</span>{" "}
                    {radius >= 1000 ? `${radius / 1000}km` : `${radius}m`}
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">Area:</span>{" "}
                    {isLoading ? (
                      <span className="text-gray-400">Loading...</span>
                    ) : (
                      <span className="line-clamp-2">{areaAddress}</span>
                    )}
                  </div>
                </>
              )}
              {areaType === "polygon" && (
                <div className="text-sm">
                  <span className="text-gray-500">Shape:</span>{" "}
                  {polygonPoints.length} points
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              {mode === "area"
                ? "Click on the map to select an area"
                : "Switch to Area mode to select"}
            </p>
          )}
        </div>

        <div
          className={`rounded-lg p-4 border ${
            pinpoint
              ? "bg-purple-50 border-purple-200"
              : "bg-gray-50 border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900 flex items-center gap-2">
              <span
                className={`w-3 h-3 rounded-full ${
                  pinpoint ? "bg-purple-500" : "bg-gray-300"
                }`}
              />
              Exact Location
              <span className="text-xs font-normal text-gray-500">
                (Optional)
              </span>
            </h3>
            {pinpoint && (
              <button
                onClick={handleClearPinpoint}
                className="text-xs text-red-600 hover:text-red-700"
              >
                Clear
              </button>
            )}
          </div>

          {pinpoint ? (
            <div className="space-y-2">
              <div className="text-sm">
                <span className="text-gray-500">Coordinates:</span>{" "}
                <span className="font-mono">
                  {pinpoint.lat.toFixed(6)}, {pinpoint.lng.toFixed(6)}
                </span>
              </div>
              <div className="text-sm">
                <span className="text-gray-500">Address:</span>{" "}
                {isLoading ? (
                  <span className="text-gray-400">Loading...</span>
                ) : (
                  <span className="line-clamp-2">{pinpointAddress}</span>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              {mode === "pinpoint"
                ? "Click on the map to pin exact location"
                : "Switch to Exact Location mode to pin"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// Main Export - Dynamically imported with no SSR
// ============================================

const LocationPicker = dynamic(() => Promise.resolve(LocationPickerMapInner), {
  ssr: false,
  loading: () => (
    <div className="w-full space-y-4">
      <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
      <div className="h-10 bg-gray-100 rounded-lg animate-pulse w-1/2" />
      <div className="h-[450px] bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
        <span className="text-gray-400">Loading map...</span>
      </div>
    </div>
  ),
});

export default LocationPicker;

// Also export types for consumers
export type { LocationData, Location, AreaSelection, LocationPickerProps };
