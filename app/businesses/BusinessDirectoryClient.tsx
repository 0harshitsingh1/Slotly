"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

interface ServiceItem {
  id: string;
  name: string;
  duration_minutes: number;
  price: number;
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
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Text Filter Input */}
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              🔍
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search businesses or services (e.g. Salon, Haircut, Massage)..."
              className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs font-semibold text-gray-400 hover:text-gray-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Near Me Toggle Button */}
          {userLocation ? (
            <button
              onClick={handleClearNearMe}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950/60 dark:text-blue-300 dark:hover:bg-blue-900/80"
            >
              <span>📍 Distance Active</span>
              <span className="text-xs bg-blue-200 dark:bg-blue-900 rounded-full px-1.5 py-0.5">✕</span>
            </button>
          ) : (
            <button
              onClick={handleNearMe}
              disabled={geoLoading}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              {geoLoading ? "Locating..." : "📍 Near Me"}
            </button>
          )}
        </div>

        {geoError && (
          <p className="text-xs text-red-600 dark:text-red-400 font-medium">
            ⚠️ {geoError}
          </p>
        )}

        {userLocation && (
          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
            Showing businesses sorted by distance from your current location.
          </p>
        )}
      </div>

      {/* Directory Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Available Businesses ({processedBusinesses.length})
          </h2>
        </div>

        {processedBusinesses.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {processedBusinesses.map((business) => (
              <div
                key={business.id}
                className="group flex flex-col justify-between rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-500/10 hover:border-brand-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-700"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-extrabold text-gray-900 dark:text-gray-100">
                        <Link
                          href={`/${business.slug}`}
                          className="hover:text-blue-600 hover:underline dark:hover:text-blue-400"
                        >
                          {business.name}
                        </Link>
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        Timezone: {business.timezone}
                      </p>
                    </div>

                    {/* Distance Badge if Geolocation enabled */}
                    {business.distance !== null && (
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800 dark:bg-blue-900/60 dark:text-blue-200 shrink-0">
                        📍 {business.distance.toFixed(1)} miles away
                      </span>
                    )}
                  </div>

                  {business.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                      {business.description}
                    </p>
                  )}

                  {business.address && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-start gap-1">
                      <span className="shrink-0">📍</span>
                      <span className="whitespace-pre-line break-words">{business.address}</span>
                    </p>
                  )}

                  {/* Services Preview List */}
                  <div className="pt-2">
                    <h4 className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-2">
                      Services Offered ({business.services.length})
                    </h4>
                    {business.services.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {business.services.map((service) => (
                          <span
                            key={service.id}
                            className="inline-flex items-center rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
                          >
                            {service.name} • {service.duration_minutes}m • ₹{service.price.toFixed(2)}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs italic text-gray-400">
                        No services added yet.
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <Link
                    href={`/${business.slug}`}
                    className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                  >
                    Book Appointment →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center dark:border-gray-800">
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
              No Businesses Found
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
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
