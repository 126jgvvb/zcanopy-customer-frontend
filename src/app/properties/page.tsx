"use client";

import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import PropertyCard from "@/components/PropertyCard";
import { webApi } from "@/lib/api";
import Link from "next/link";
import { usePlacePredictions } from "@/hooks/useGooglePlaces";

function formatUGX(n: number) {
  try {
    return new Intl.NumberFormat("en-UG", { style: "currency", currency: "UGX", maximumFractionDigits: 0 }).format(n);
  } catch {
    return `UGX ${n.toLocaleString()}`;
  }
}

interface Property {
  id: string;
  title: string;
  description: string;
  propertyType: string;
  location: string;
  isAvailable: boolean;
  createdAt: string;
  imageUrl?: string[];
  videoUrl?: string[];
  brokerBrandName?: string;
  brokerCode?: string;
  brokerPhone?: string;
  price?: number;
  bookingFee?: number;
  postgis_spatial_field?: { lat: number; lng: number } | null;
}

interface BookingForm {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
}

const emptyForm: BookingForm = {
  customerName: "",
  customerPhone: "",
  customerEmail: "",
};

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [brokerFilter, setBrokerFilter] = useState("");
  const [propertyTypeFilter, setPropertyTypeFilter] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [subCountyFilter, setSubCountyFilter] = useState("");
  const [districtFilter, setDistrictFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [form, setForm] = useState<BookingForm>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState("");
  const [bookedProperty, setBookedProperty] = useState<Property | null>(null);
  const [viewMode, setViewMode] = useState<"all" | "broker">("all");
  const [selectedBrokerCode, setSelectedBrokerCode] = useState<string>("");
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [localSearch, setLocalSearch] = useState("");
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const PAGE_SIZE = 12;
  const observerTarget = useRef<HTMLDivElement>(null);
  const { predictions: locationPredictions, loading: locationLoading, error: locationError } = usePlacePredictions(
    localSearch
  );

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        let data: { properties?: Property[]; total?: number; hasMore?: boolean };
        const hasFilters = locationFilter || brokerFilter || propertyTypeFilter || minPrice || maxPrice || subCountyFilter || districtFilter || dateFrom || dateTo;
        if (viewMode === "broker" && selectedBrokerCode) {
          const res = await webApi.brokerPropertiesByCode(selectedBrokerCode);
          data = res as { properties?: Property[]; total?: number; hasMore?: boolean };
        } else if (search || hasFilters) {
          const res = await webApi.searchPropertiesPaginated(search, 1, PAGE_SIZE, {
            location: locationFilter || undefined,
            propertyType: propertyTypeFilter || undefined,
            minPrice: minPrice ? Number(minPrice) : undefined,
            maxPrice: maxPrice ? Number(maxPrice) : undefined,
            subCounty: subCountyFilter || undefined,
            district: districtFilter || undefined,
          });
          data = res as { properties?: Property[]; total?: number; hasMore?: boolean };
        } else {
          const res = await webApi.publicPropertiesPaginated(1, PAGE_SIZE, {
            location: locationFilter || undefined,
          });
          data = res as { properties?: Property[]; total?: number; hasMore?: boolean };
        }
        if (!cancelled) {
          setProperties(data.properties || []);
          setTotal(data.total || 0);
          setHasMore(!!data.hasMore);
          setPage(1);
        }
      } catch {
        if (!cancelled) {
          setError("Failed to load properties");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [search, viewMode, selectedBrokerCode, locationFilter, propertyTypeFilter, minPrice, maxPrice, subCountyFilter, districtFilter]);

  useEffect(() => {
    if (!search) return;
    const timeout = setTimeout(() => {
      webApi.recordSearch({
        query: search,
        location: locationFilter,
        propertyType: viewMode === "broker" ? "broker" : undefined,
      }).catch(() => {});
    }, 300);
    return () => clearTimeout(timeout);
  }, [search, locationFilter, viewMode]);

  const handleSearchChange = (value: string) => {
    setLocalSearch(value);
    setShowLocationSuggestions(value.trim().length > 0);
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }
    searchTimerRef.current = setTimeout(() => {
      setSearch(value);
    }, 300);
  };

  const handleLocationSuggestionSelect = (description: string) => {
    setLocationFilter(description);
    setLocalSearch(description);
    setSearch(description);
    setShowLocationSuggestions(false);
  };

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const hasFilters = locationFilter || brokerFilter || propertyTypeFilter || minPrice || maxPrice || subCountyFilter || districtFilter || dateFrom || dateTo;
      let data: { properties?: Property[]; hasMore?: boolean };
      if (search || hasFilters) {
        const res = await webApi.searchPropertiesPaginated(search, nextPage, PAGE_SIZE, {
          location: locationFilter || undefined,
          propertyType: propertyTypeFilter || undefined,
          minPrice: minPrice ? Number(minPrice) : undefined,
          maxPrice: maxPrice ? Number(maxPrice) : undefined,
          subCounty: subCountyFilter || undefined,
          district: districtFilter || undefined,
        });
        data = res as { properties?: Property[]; hasMore?: boolean };
      } else {
        const res = await webApi.publicPropertiesPaginated(nextPage, PAGE_SIZE, {
          location: locationFilter || undefined,
        });
        data = res as { properties?: Property[]; hasMore?: boolean };
      }
      setProperties((prev) => [...prev, ...(data.properties || [])]);
      setHasMore(!!data.hasMore);
      setPage(nextPage);
    } catch {
      // silently fail
    } finally {
      setLoadingMore(false);
    }
  };

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    if (loading || loadingMore || !hasMore) return;
    const el = observerTarget.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: "200px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [loading, loadingMore, hasMore, page, search, locationFilter, propertyTypeFilter, minPrice, maxPrice, subCountyFilter, districtFilter]);

  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      if (locationFilter && !p.location.toLowerCase().includes(locationFilter.toLowerCase())) return false;
      if (brokerFilter && !(p.brokerBrandName || "").toLowerCase().includes(brokerFilter.toLowerCase())) return false;
      if (propertyTypeFilter && p.propertyType !== propertyTypeFilter) return false;
      if (minPrice && (p.price ?? 0) < Number(minPrice)) return false;
      if (maxPrice && (p.price ?? 0) > Number(maxPrice)) return false;
      if (dateFrom && p.createdAt < dateFrom) return false;
      if (dateTo && p.createdAt > dateTo + "T23:59:59Z") return false;
      return true;
    });
  }, [properties, locationFilter, brokerFilter, propertyTypeFilter, minPrice, maxPrice, dateFrom, dateTo]);

  // Scroll reveal for property cards
  useEffect(() => {
    const elements = document.querySelectorAll(".slide-up");
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [filteredProperties.length]);

  const uniqueLocations = useMemo(() => {
    const locs = new Set(properties.map((p) => p.location));
    return Array.from(locs).sort();
  }, [properties]);

  const uniqueBrokers = useMemo(() => {
    const brokers = new Map<string, string>();
    properties.forEach((p) => {
      if (p.brokerCode && p.brokerBrandName) {
        brokers.set(p.brokerCode, p.brokerBrandName);
      }
    });
    return Array.from(brokers.entries()).map(([code, name]) => ({ code, name }));
  }, [properties]);

  const closeBooking = () => {
    setSelectedProperty(null);
    setBookedProperty(null);
    setForm(emptyForm);
    setSubmitError("");
    setSuccess("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProperty) return;

    setSubmitting(true);
    setSubmitError("");

    try {
      const token = localStorage.getItem("zcanopy_token") || "";
      await webApi.createBooking(token, {
        propertyId: selectedProperty.id,
        customerName: form.customerName,
        customerPhone: form.customerPhone,
        customerEmail: form.customerEmail,
        status: "pending",
      });
      setSuccess("Booking created successfully!");
      setForm(emptyForm);
      setBookedProperty(selectedProperty);
      setTimeout(closeBooking, 1500);
    } catch {
      setSubmitError("Failed to create booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-sm text-gray-500">Loading properties...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 md:px-6">
      <div>
        <h2 className="text-3xl">Browse Properties</h2>
        <p className="mt-2 text-gray-500">Find your next home or investment and book directly.</p>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--zcanopy-surface)] p-5 shadow-[var(--shadow-soft)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          <div className="flex-1 relative">
            <label className="block text-sm font-medium text-gray-700">Search</label>
            <input
              type="text"
              value={localSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => localSearch.trim().length > 0 && setShowLocationSuggestions(true)}
              onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 150)}
              placeholder="Search by title, location, broker..."
              className="mt-1 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--zcanopy-surface)] px-4 py-2.5 shadow-sm"
            />
            {showLocationSuggestions && (locationPredictions.length > 0 || locationLoading || locationError) && (
              <div className="absolute z-20 mt-1 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--zcanopy-surface)] shadow-lg">
                {locationLoading && (
                  <div className="px-4 py-2 text-sm text-gray-500">Loading suggestions...</div>
                )}
                {locationError && (
                  <div className="px-4 py-2 text-sm text-red-600">Location suggestions unavailable</div>
                )}
                {!locationLoading &&
                  !locationError &&
                  locationPredictions.map((item) => (
                    <button
                      key={item.placeId}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleLocationSuggestionSelect(item.description)}
                      className="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                    >
                      {item.description}
                    </button>
                  ))}
                {!locationLoading && !locationError && locationPredictions.length === 0 && (
                  <div className="px-4 py-2 text-sm text-gray-500">No suggestions</div>
                )}
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--zcanopy-surface)] px-4 py-2.5 shadow-sm"
            >
              <option value="">All locations</option>
              {uniqueLocations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Broker</label>
            <select
              value={brokerFilter}
              onChange={(e) => setBrokerFilter(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--zcanopy-surface)] px-4 py-2.5 shadow-sm"
            >
              <option value="">All brokers</option>
              {uniqueBrokers.map((b) => (
                <option key={b.code} value={b.name}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Property Type</label>
            <select
              value={propertyTypeFilter}
              onChange={(e) => setPropertyTypeFilter(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--zcanopy-surface)] px-4 py-2.5 shadow-sm"
            >
              <option value="">All types</option>
              <option value="RESIDENTIAL">Residential</option>
              <option value="COMMERCIAL">Commercial</option>
              <option value="LAND">Land</option>
              <option value="APARTMENT">Apartment</option>
              <option value="VILLA">Villa</option>
              <option value="CONDO">Condo</option>
              <option value="OFFICE">Office</option>
              <option value="WAREHOUSE">Warehouse</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Min Price (UGX)</label>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="0"
              className="mt-1 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--zcanopy-surface)] px-4 py-2.5 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Max Price (UGX)</label>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="No limit"
              className="mt-1 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--zcanopy-surface)] px-4 py-2.5 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Sub-county</label>
            <input
              type="text"
              value={subCountyFilter}
              onChange={(e) => setSubCountyFilter(e.target.value)}
              placeholder="e.g. Kampala Central"
              className="mt-1 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--zcanopy-surface)] px-4 py-2.5 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">District</label>
            <input
              type="text"
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              placeholder="e.g. Kampala"
              className="mt-1 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--zcanopy-surface)] px-4 py-2.5 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--zcanopy-surface)] px-4 py-2.5 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--zcanopy-surface)] px-4 py-2.5 shadow-sm"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-[var(--border)] pt-4">
          <span className="text-sm font-medium text-gray-700">View:</span>
          <button
            onClick={() => { setViewMode("all"); setSelectedBrokerCode(""); }}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${viewMode === "all" ? "btn-primary" : "btn-ghost"}`}
          >
            All Properties
          </button>
          {uniqueBrokers.map((b) => (
            <button
              key={b.code}
              onClick={() => { setViewMode("broker"); setSelectedBrokerCode(b.code); }}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${viewMode === "broker" && selectedBrokerCode === b.code ? "btn-primary" : "btn-ghost"}`}
            >
              {b.name}
            </button>
          ))}
          <Link
            href="/properties/favorites"
            className="btn-ghost rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
          >
            My Favorites
          </Link>
        </div>
      </div>

      {filteredProperties.length === 0 ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--zcanopy-surface)] p-5 shadow-[var(--shadow-soft)]">
          <div className="py-12 text-center">
            <p className="text-gray-500">No properties found.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProperties.map((property, idx) => (
            <div
              key={property.id}
              className={`slide-up ${idx >= 12 ? "" : ""}`}
              style={{ animationDelay: `${(idx % 12) * 60}ms` }}
            >
              <PropertyCard {...property} />
            </div>
          ))}
        </div>
      )}

      {hasMore && (
        <div ref={observerTarget} className="mt-8 flex justify-center">
          {loadingMore ? (
            <p className="text-sm text-gray-500">Loading more properties...</p>
          ) : (
            <p className="text-sm text-gray-400">Scroll down for more</p>
          )}
        </div>
      )}

      {selectedProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--zcanopy-surface)] p-6 shadow-[var(--shadow-lift)]">
            {bookedProperty ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[var(--zcanopy-card-brown)]">Booking Confirmed</h3>
                <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                  Your booking request has been submitted successfully.
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-600">
                  <p className="font-semibold text-[var(--zcanopy-card-brown)]">Broker contact: {bookedProperty.brokerPhone || "Not provided"}</p>
                  <p className="mt-2">You will receive a message having an invoice code on both email and SMS showing your invoice payment code.</p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-600">
                  <p className="font-semibold text-[var(--zcanopy-card-brown)]">Complaints or inquiries</p>
                  <p className="mt-1">If you have successfully made a payment but have not received an SMS or email, please contact us:</p>
                  <p className="mt-1">Email: <a href="mailto:support@zcanopy.com" className="text-[var(--zcanopy-primary)]">support@zcanopy.com</a></p>
                  <p>Phone: <a href="tel:+256741882818" className="text-[var(--zcanopy-primary)]">+256 741 882 818</a></p>
                </div>
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeBooking}
                    className="btn-ghost px-4 py-2 text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h3 className="mb-4 text-lg font-semibold text-[var(--zcanopy-card-brown)]">Book: {selectedProperty.title}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-600">
                    <p className="font-semibold text-[var(--zcanopy-card-brown)]">Booking charge: {selectedProperty.bookingFee !== undefined ? formatUGX(selectedProperty.bookingFee) : "Not set"}</p>
                    <p className="mt-2">You will receive a message having an invoice code on both email and SMS showing your invoice payment code.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input
                      type="text"
                      required
                      value={form.customerName}
                      onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--zcanopy-surface)] px-4 py-2.5 shadow-sm"
                      placeholder="Your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={form.customerPhone}
                      onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--zcanopy-surface)] px-4 py-2.5 shadow-sm"
                      placeholder="+256 700 000000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      required
                      value={form.customerEmail}
                      onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--zcanopy-surface)] px-4 py-2.5 shadow-sm"
                      placeholder="you@example.com"
                    />
                  </div>

                  {submitError && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                      {submitError}
                    </div>
                  )}
                  {success && (
                    <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                      {success}
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={closeBooking}
                      className="btn-ghost px-4 py-2 text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-primary px-4 py-2 text-sm disabled:opacity-50"
                    >
                      {submitting ? "Submitting..." : "Confirm Booking"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
