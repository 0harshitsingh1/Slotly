"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";

interface ServiceItem {
  id: string;
  name: string;
  duration_minutes: number;
  price: number;
}

interface BusinessImageItem {
  id: string;
  url: string;
}

interface BusinessItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  address: string | null;
  timezone: string;
  latitude: number | null;
  longitude: number | null;
  images: BusinessImageItem[];
  services: ServiceItem[];
}

interface BusinessDirectoryClientProps {
  initialBusinesses: BusinessItem[];
}

// Haversine formula to calculate distance between two coordinates in miles
function haversineMiles(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3958.8; // Earth radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function BusinessDirectoryClient({
  initialBusinesses,
}: BusinessDirectoryClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const handleNearMe = () => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.");
      return;
    }

    setGeoLoading(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setGeoLoading(false);
      },
      (error) => {
        setGeoLoading(false);
        setGeoError(`Location access denied: ${error.message}`);
      }
    );
  };

  const handleClearNearMe = () => {
    setUserLocation(null);
    setGeoError(null);
  };

  // Filter and sort businesses
  const processedBusinesses = useMemo(() => {
    let result = initialBusinesses.map((b) => {
      let distance: number | null = null;
      if (
        userLocation &&
        b.latitude !== null &&
        b.longitude !== null
      ) {
        distance = haversineMiles(
          userLocation.lat,
          userLocation.lng,
          b.latitude,
          b.longitude
        );
      }
      return { ...b, distance };
    });

    // 1. Text Search Filter (name or service name)
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(
        (b) =>
          b.name.toLowerCase().includes(term) ||
          b.services.some((s) => s.name.toLowerCase().includes(term)) ||
          (b.description && b.description.toLowerCase().includes(term)) ||
          (b.address && b.address.toLowerCase().includes(term))
      );
    }

    // 2. Sort by distance if userLocation is active
    if (userLocation) {
      result.sort((a, b) => {
        if (a.distance === null && b.distance === null) return 0;
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      });
    }

    return result;
  }, [initialBusinesses, searchTerm, userLocation]);

  return (
    <div className="space-y-8">
      {/* Search Bar & Near Me Controls */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Text Filter Input */}
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              🔍
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search businesses or services (e.g. Salon, Haircut, Massage)..."
              className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Clear
              </button>
            )}
          </div>

          {/* Near Me Toggle Button */}
          {userLocation ? (
            <button
              onClick={handleClearNearMe}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-2.5 text-sm font-semibold text-brand-700 hover:bg-brand-100 dark:border-brand-900 dark:bg-brand-950/60 dark:text-brand-300"
            >
              <span>📍 Distance Active</span>
              <span className="text-xs bg-brand-200 dark:bg-brand-900 rounded-full px-1.5 py-0.5">✕</span>
            </button>
          ) : (
            <Button
              onClick={handleNearMe}
              isLoading={geoLoading}
              variant="primary"
              size="md"
            >
              📍 Near Me
            </Button>
          )}
        </div>

        {geoError && (
          <p className="text-xs text-danger-600 dark:text-danger-400 font-medium">
            ⚠️ {geoError}
          </p>
        )}

        {userLocation && (
          <p className="text-xs text-brand-600 dark:text-brand-400 font-medium">
            Showing businesses sorted by distance from your current location.
          </p>
        )}
      </div>

      {/* Directory Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-xl font-extrabold text-slate-900 dark:text-white">
            Available Businesses ({processedBusinesses.length})
          </h2>
        </div>

        {processedBusinesses.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2">
            {processedBusinesses.map((business) => {
              const coverImage = business.images && business.images.length > 0 ? business.images[0].url : null;
              const displayServices = business.services.slice(0, 3);
              const extraServicesCount = business.services.length - displayServices.length;

              return (
                <div
                  key={business.id}
                  className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-500/10 hover:border-brand-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-700"
                >
                  {/* Top Cover Image Area */}
                  <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-900">
                    {coverImage ? (
                      <Image
                        src={coverImage}
                        alt={`${business.name} cover photo`}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                        unoptimized
                      />
                    ) : (
                      /* Clean Placeholder with Subtle Gradient (Requirement 5) */
                      <div className="h-full w-full bg-gradient-to-br from-brand-700 via-brand-800 to-slate-950 flex items-center justify-center p-6 text-center">
                        <span className="text-4xl opacity-25">🏬</span>
                      </div>
                    )}

                    {/* Dark Gradient Overlay for Readability Contrast */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />

                    {/* Distance Badge if Geolocation enabled */}
                    {business.distance !== null && (
                      <span className="absolute top-3 right-3 rounded-full bg-slate-900/80 px-3 py-1 text-xs font-bold text-white backdrop-blur-md border border-white/20 shadow-md">
                        📍 {business.distance.toFixed(1)} miles away
                      </span>
                    )}

                    {/* Business Name Overlaid at Bottom of Cover Image (Requirements 1 & 2) */}
                    <div className="absolute bottom-3 left-4 right-4 space-y-0.5">
                      <Link href={`/${business.slug}`} className="inline-block group/title">
                        <h3 className="font-heading text-xl font-extrabold text-white tracking-tight transition-all duration-200 group-hover:text-brand-300 group-hover:translate-x-1 drop-shadow-md">
                          {business.name}
                        </h3>
                      </Link>
                      <p className="text-[11px] font-medium text-slate-300 flex items-center gap-2 truncate">
                        <span>🕒 {business.timezone}</span>
                        {business.address && (
                          <span className="truncate"> • 📍 {business.address}</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Card Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    {/* Truncated Description (Requirement 3) */}
                    {business.description ? (
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                        {business.description}
                      </p>
                    ) : (
                      <p className="text-xs italic text-slate-400">
                        No description provided.
                      </p>
                    )}

                    {/* Streamlined Services Offered Preview (Requirement 4) */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400">
                        <span>Services Offered</span>
                        <span>{business.services.length} Total</span>
                      </div>

                      {business.services.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {displayServices.map((service) => (
                            <span
                              key={service.id}
                              className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                            >
                              {service.name} • ₹{service.price.toFixed(2)}
                            </span>
                          ))}
                          {extraServicesCount > 0 && (
                            <span className="inline-flex items-center rounded-lg bg-brand-50 px-2 py-1 text-xs font-bold text-brand-700 dark:bg-brand-950/60 dark:text-brand-300">
                              +{extraServicesCount} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs italic text-slate-400">
                          No services added yet.
                        </p>
                      )}
                    </div>

                    {/* Book Appointment CTA Button */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                      <Link href={`/${business.slug}`} className="block">
                        <Button variant="primary" fullWidth size="md">
                          Book Appointment →
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-800">
            <h3 className="font-heading font-bold text-slate-900 dark:text-slate-100 text-base">
              No Businesses Found
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {searchTerm
                ? `No business or service matching "${searchTerm}". Try a different keyword.`
                : "There are no businesses registered in the directory yet."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
