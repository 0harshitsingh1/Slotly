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

const CATEGORY_CHIPS = [
  { label: "All Services", filter: "" },
  { label: "Hair & Beauty", filter: "Salon" },
  { label: "Medical Clinics", filter: "Clinic" },
  { label: "Tutors & Classes", filter: "Tutor" },
  { label: "Fitness", filter: "Fitness" },
  { label: "Spa & Massage", filter: "Massage" },
];

export default function BusinessDirectoryClient({
  initialBusinesses,
}: BusinessDirectoryClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
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

    // 1. Category Filter
    if (activeCategory) {
      const cat = activeCategory.toLowerCase();
      result = result.filter(
        (b) =>
          b.name.toLowerCase().includes(cat) ||
          b.services.some((s) => s.name.toLowerCase().includes(cat)) ||
          (b.description && b.description.toLowerCase().includes(cat))
      );
    }

    // 2. Text Search Filter (name or service name)
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

    // 3. Sort by distance if userLocation is active
    if (userLocation) {
      result.sort((a, b) => {
        if (a.distance === null && b.distance === null) return 0;
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      });
    }

    return result;
  }, [initialBusinesses, searchTerm, activeCategory, userLocation]);

  return (
    <div className="space-y-8">
      {/* Bento Grid Search Bar & Controls (Stitch Design) */}
      <div className="rounded-2xl border border-white/10 bg-[#161b22]/90 p-5 sm:p-6 shadow-[0_12px_48px_rgba(139,92,246,0.12)] backdrop-blur-xl space-y-4">
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
              placeholder="Search salons, clinics, tutors, or services..."
              className="w-full rounded-xl border border-white/10 bg-[#273647]/90 py-3 pl-10 pr-10 text-sm text-slate-100 placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20 shadow-[0_0_15px_rgba(160,120,255,0.1)] transition-all duration-200"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-xs font-semibold text-slate-400 hover:text-slate-200"
              >
                Clear
              </button>
            )}
          </div>

          {/* Near Me Toggle Button */}
          {userLocation ? (
            <button
              onClick={handleClearNearMe}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-brand-500/40 bg-brand-500/10 px-5 py-2.5 text-xs font-extrabold text-brand-300 hover:bg-brand-500/20 transition-all"
            >
              <span>📍 Distance Active</span>
              <span className="text-xs bg-brand-500/30 rounded-full px-1.5 py-0.5">✕</span>
            </button>
          ) : (
            <Button
              onClick={handleNearMe}
              isLoading={geoLoading}
              variant="primary"
              size="md"
              className="rounded-full !py-2.5 shadow-[0_0_20px_rgba(160,120,255,0.25)]"
            >
              📍 Near Me
            </Button>
          )}
        </div>

        {/* Category Chips (Stitch Design) */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORY_CHIPS.map((chip) => {
            const isActive = activeCategory === chip.filter;
            return (
              <button
                key={chip.label}
                onClick={() => setActiveCategory(chip.filter)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? "bg-brand-500 text-white shadow-md shadow-brand-500/20"
                    : "bg-[#122131] border border-white/5 text-slate-300 hover:text-white hover:border-white/20"
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>

        {geoError && (
          <p className="text-xs text-danger-400 font-medium">
            ⚠️ {geoError}
          </p>
        )}

        {userLocation && (
          <p className="text-xs text-brand-400 font-medium">
            Showing businesses sorted by distance from your current location.
          </p>
        )}
      </div>

      {/* Directory Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-xl sm:text-2xl font-extrabold text-slate-100">
            Available Businesses ({processedBusinesses.length})
          </h2>
        </div>

        {processedBusinesses.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {processedBusinesses.map((business) => {
              const coverImage = business.images && business.images.length > 0 ? business.images[0].url : null;
              const displayServices = business.services.slice(0, 3);
              const extraServicesCount = business.services.length - displayServices.length;
              const minPrice = business.services.length > 0
                ? Math.min(...business.services.map((s) => s.price))
                : null;

              return (
                <div
                  key={business.id}
                  className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#161b22] shadow-md transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-500/15 hover:border-brand-500/40 relative"
                >
                  {/* Left Hover Accent Strip (Stitch Design) */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-400 opacity-0 group-hover:opacity-100 transition-opacity z-20" />

                  {/* Top Cover Image Area */}
                  <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-900">
                    {coverImage ? (
                      <Image
                        src={coverImage}
                        alt={`${business.name} cover photo`}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                        unoptimized
                      />
                    ) : (
                      /* Clean Placeholder with Dark Gradient */
                      <div className="h-full w-full bg-gradient-to-br from-brand-900 via-indigo-950 to-slate-950 flex items-center justify-center p-6 text-center">
                        <span className="text-4xl opacity-30">🏬</span>
                      </div>
                    )}

                    {/* Dark Gradient Overlay for Contrast */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#161b22] via-[#161b22]/50 to-transparent" />

                    {/* Distance Badge if Geolocation enabled */}
                    {business.distance !== null && (
                      <span className="absolute top-3 right-3 rounded-full bg-slate-950/80 px-3 py-1 text-xs font-bold text-white backdrop-blur-md border border-white/20 shadow-md">
                        📍 {business.distance.toFixed(1)} miles away
                      </span>
                    )}

                    {/* Business Name Overlaid at Bottom of Cover Image */}
                    <div className="absolute bottom-3 left-4 right-4 space-y-0.5 z-10">
                      <Link href={`/${business.slug}`} className="inline-block group/title">
                        <h3 className="font-heading text-lg sm:text-xl font-extrabold text-white tracking-tight transition-all duration-200 group-hover/title:text-brand-300 group-hover/title:translate-x-1 drop-shadow-md">
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
                    {/* Truncated Description */}
                    {business.description ? (
                      <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 leading-relaxed">
                        {business.description}
                      </p>
                    ) : (
                      <p className="text-xs italic text-slate-500">
                        No description provided.
                      </p>
                    )}

                    {/* Streamlined Services Offered Preview */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        <span>Services Offered</span>
                        <span>{business.services.length} Total</span>
                      </div>

                      {business.services.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {displayServices.map((service) => (
                            <span
                              key={service.id}
                              className="inline-flex items-center rounded-lg border border-white/10 bg-[#273647]/80 px-2.5 py-1 text-xs font-medium text-slate-200"
                            >
                              {service.name} • ₹{service.price.toFixed(2)}
                            </span>
                          ))}
                          {extraServicesCount > 0 && (
                            <span className="inline-flex items-center rounded-lg bg-brand-500/20 px-2 py-1 text-xs font-bold text-brand-300">
                              +{extraServicesCount} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs italic text-slate-500">
                          No services added yet.
                        </p>
                      )}
                    </div>

                    {/* Bottom Pricing & Book Appointment CTA Button */}
                    <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-slate-400">
                          {minPrice !== null ? "Starting from" : "Pricing"}
                        </span>
                        <span className="font-heading text-base sm:text-lg font-extrabold text-brand-400">
                          {minPrice !== null ? `₹${minPrice.toFixed(0)}` : "Contact"}
                        </span>
                      </div>

                      <Link href={`/${business.slug}`}>
                        <button className="rounded-full bg-brand-500/15 text-brand-300 border border-brand-500/30 hover:bg-brand-500 hover:text-white font-heading font-extrabold text-xs px-4 py-2 sm:py-2.5 transition-all duration-200 shadow-sm flex items-center gap-1">
                          <span>Book Now</span>
                          <span>→</span>
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center bg-[#161b22]/50">
            <h3 className="font-heading font-bold text-slate-200 text-base">
              No Businesses Found
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              {searchTerm || activeCategory
                ? `No business or service matching your filter. Try a different keyword.`
                : "There are no businesses registered in the directory yet."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
