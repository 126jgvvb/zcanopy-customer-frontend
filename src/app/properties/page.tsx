"use client";

import { useEffect, useMemo, useState, useRef, useTransition, useDeferredValue, useSyncExternalStore } from "react";
import PropertyCard from "@/components/PropertyCard";
import PropertyShowcaseRow from "@/components/PropertyShowcaseRow";
import PropertyVideoReel from "@/components/PropertyVideoReel";
import { LayoutGrid, Rows3, Video } from "lucide-react";
import { webApi, getSessionId, ensureAnonymousSession } from "@/lib/api";
import Link from "next/link";
import { usePlacePredictions } from "@/hooks/useGooglePlaces";
import BackButton from "@/components/BackButton";
import { useBookingRedirect } from "@/hooks/useBookingRedirect";
import { invalidateBookedPropertyIds } from "@/hooks/useBookedPropertyIds";

function formatUGX(n: number) {
  try {
    return new Intl.NumberFormat("en-UG", { style: "currency", currency: "UGX", maximumFractionDigits: 0 }).format(n);
  } catch {
    return `UGX ${n.toLocaleString()}`;
  }
}

export interface Property {
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
  postgisSpatialField?: string | null;
  subCounty?: string;
  district?: string;
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

type LayoutMode = "grid" | "showcase" | "video";
const LAYOUT_KEY = "zcanopy_properties_layout";
const LAYOUT_EVENT = "zcanopy-layout-change";

/**
 * localStorage read through useSyncExternalStore so the preference survives
 * reloads without a setState-in-effect, and so SSR can send the default.
 */
const layoutStore = {
  subscribe(cb: () => void) {
    window.addEventListener(LAYOUT_EVENT, cb);
    window.addEventListener("storage", cb);
    return () => {
      window.removeEventListener(LAYOUT_EVENT, cb);
      window.removeEventListener("storage", cb);
    };
  },
  get(): LayoutMode {
    const stored = window.localStorage.getItem(LAYOUT_KEY);
    if (stored === "showcase" || stored === "video") return stored;
    return "grid";
  },
  getServerSnapshot(): LayoutMode {
    return "grid";
  },
  set(next: LayoutMode) {
    window.localStorage.setItem(LAYOUT_KEY, next);
    window.dispatchEvent(new Event(LAYOUT_EVENT));
  },
};

const LAYOUT_OPTIONS: Array<{ value: LayoutMode; label: string; Icon: typeof LayoutGrid }> = [
  { value: "grid", label: "Grid", Icon: LayoutGrid },
  { value: "showcase", label: "Showcase", Icon: Rows3 },
  { value: "video", label: "Reel", Icon: Video },
];

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
const [paymentStatus, setPaymentStatus] = useState<string>("");
const layout = useSyncExternalStore(
    layoutStore.subscribe,
    layoutStore.get,
    layoutStore.getServerSnapshot,
  );
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

  const [isPending, startTransition] = useTransition();
  const deferredSearch = useDeferredValue(search);
  const deferredLocationFilter = useDeferredValue(locationFilter);
  const deferredBrokerFilter = useDeferredValue(brokerFilter);
  const deferredPropertyTypeFilter = useDeferredValue(propertyTypeFilter);
  const deferredMinPrice = useDeferredValue(minPrice);
  const deferredMaxPrice = useDeferredValue(maxPrice);
  const deferredSubCountyFilter = useDeferredValue(subCountyFilter);
  const deferredDistrictFilter = useDeferredValue(districtFilter);
  const deferredDateFrom = useDeferredValue(dateFrom);
const deferredDateTo = useDeferredValue(dateTo);

  const isInitialMount = useRef(true);

  // Single source of truth for the active filters. Every request path uses this,
  // so no filter can be silently dropped from one endpoint but not another.
  const activeFilters = {
    location: locationFilter || undefined,
    brokerBrandName: brokerFilter || undefined,
    propertyType: propertyTypeFilter || undefined,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    subCounty: subCountyFilter || undefined,
    district: districtFilter || undefined,
    fromDate: dateFrom || undefined,
    toDate: dateTo || undefined,
  };

  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (isInitialMount.current) {
        setLoading(true);
        isInitialMount.current = false;
      } else {
        setIsFetching(true);
      }
      setError("");
      try {
        let data: { properties?: Property[]; total?: number } = { properties: [], total: 0 };
        if (search) {
          try {
            const res = await webApi.searchPropertiesPaginated(search, 1, PAGE_SIZE, activeFilters);
            data = res as { properties?: Property[]; total?: number };
          } catch {
            data = { properties: [], total: 0 };
          }
        } else {
          try {
            const res = await webApi.customer.explorer({ page: 1, limit: PAGE_SIZE, ...activeFilters });
            data = res as { properties?: Property[]; total?: number };
          } catch {
            try {
              const fallback = await webApi.publicPropertiesPaginated(1, PAGE_SIZE, activeFilters);
              data = fallback as { properties?: Property[]; total?: number };
            } catch {
              data = { properties: [], total: 0 };
            }
          }
        }
        if (!cancelled) {
          startTransition(() => {
            resetSeenKeys(data.properties || []);
            setProperties(data.properties || []);
            setTotal(data.total || 0);
            setHasMore(1 * PAGE_SIZE < (data.total || 0));
            setPage(1);
          });
        }
      } catch {
        if (!cancelled) {
          setError("Failed to load properties");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setIsFetching(false);
        }
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [search, locationFilter, brokerFilter, propertyTypeFilter, minPrice, maxPrice, subCountyFilter, districtFilter, dateFrom, dateTo]);

  useEffect(() => {
    if (!search) return;
    const timeout = setTimeout(() => {
      webApi.recordSearch(getSessionId(), {
        query: search,
        location: locationFilter,
      }).catch(() => {});
    }, 300);
    return () => clearTimeout(timeout);
  }, [search, locationFilter]);

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

  const seenKeysRef = useRef<Set<string>>(new Set());

  const propertyIdentity = (p: Property): string => {
    const id = p.id?.trim();
    if (id) return `id:${id}`;
    return `k:${p.title}|${p.location}|${p.brokerCode ?? ""}|${p.createdAt}`;
  };

  // Rebuilds the identity set whenever the result set is replaced (page 1).
  const resetSeenKeys = (list: Property[]) => {
    seenKeysRef.current = new Set(list.map(propertyIdentity));
    return list;
  };

  // Appends only properties not already tracked. The set is maintained incrementally,
  // so each page costs O(incoming) instead of rebuilding from the whole array.
  const appendUniqueProperties = (incoming: Property[] | undefined): number => {
    if (!incoming?.length) return 0;
    const fresh: Property[] = [];
    for (const p of incoming) {
      const key = propertyIdentity(p);
      if (seenKeysRef.current.has(key)) continue;
      seenKeysRef.current.add(key);
      fresh.push(p);
    }
    if (fresh.length > 0) {
      setProperties((prev) => [...prev, ...fresh]);
    }
    return fresh.length;
  };

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      let data: { properties?: Property[]; total?: number } = { properties: [], total: 0 };
      if (search) {
        try {
          const res = await webApi.searchPropertiesPaginated(search, nextPage, PAGE_SIZE, activeFilters);
          data = res as { properties?: Property[]; total?: number };
        } catch {
          data = { properties: [], total: 0 };
        }
      } else {
        try {
          const res = await webApi.customer.explorer({ page: nextPage, limit: PAGE_SIZE, ...activeFilters });
          data = res as { properties?: Property[]; total?: number };
          if ((data.properties || []).length === 0) {
            const fallback = await webApi.publicPropertiesPaginated(nextPage, PAGE_SIZE, activeFilters);
            data = fallback as { properties?: Property[]; total?: number };
          }
        } catch {
          const fallback = await webApi.publicPropertiesPaginated(nextPage, PAGE_SIZE, activeFilters);
          data = fallback as { properties?: Property[]; total?: number };
        }
      }
      const incomingCount = (data.properties || []).length;
      const addedCount = appendUniqueProperties(data.properties);
      // A page that adds nothing new means we have caught up with the server's
      // result set. Stop paging instead of re-fetching the same window forever.
      setHasMore(addedCount > 0 && incomingCount > 0 && nextPage * PAGE_SIZE < (data.total || 0));
      setTotal(data.total || 0);
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
  }, [loading, loadingMore, hasMore, page, deferredSearch, deferredLocationFilter, deferredBrokerFilter, deferredPropertyTypeFilter, deferredMinPrice, deferredMaxPrice, deferredSubCountyFilter, deferredDistrictFilter, deferredDateFrom, deferredDateTo]);

  // Filter options are loaded once from unfiltered endpoints. Deriving them from
  // `properties` would mean that selecting a filter shrinks the dropdown to only
  // the currently-selected value, making it impossible to switch to another.
  const [filterOptions, setFilterOptions] = useState<{
    locations: string[];
    propertyTypes: string[];
    brokers: Array<{ code: string; name: string }>;
  }>({ locations: [], propertyTypes: [], brokers: [] });

  useEffect(() => {
    let cancelled = false;
    const loadOptions = async () => {
      // Locations + types come from one unfiltered call; brokers need their own
      // endpoint for the code -> brand name mapping.
      const [locationsRes, brokersRes] = await Promise.allSettled([
        webApi.getLocations(),
        webApi.getBrokers({ limit: 200 }),
      ]);
      if (cancelled) return;

      const locations: string[] = [];
      const propertyTypes: string[] = [];
      const brokerCodes = new Set<string>();
      if (locationsRes.status === "fulfilled") {
        const seenLoc = new Set<string>();
        const seenType = new Set<string>();
        for (const row of locationsRes.value?.locations || []) {
          if (row.location && !seenLoc.has(row.location)) {
            seenLoc.add(row.location);
            locations.push(row.location);
          }
          if (row.propertyType && !seenType.has(row.propertyType)) {
            seenType.add(row.propertyType);
            propertyTypes.push(row.propertyType);
          }
          if (row.brokerCode) brokerCodes.add(row.brokerCode);
        }
      }

      const brokers: Array<{ code: string; name: string }> = [];
      if (brokersRes.status === "fulfilled") {
        const seenBroker = new Set<string>();
        for (const b of brokersRes.value?.brokers || []) {
          if (!b.brokerCode || seenBroker.has(b.brokerCode)) continue;
          // Only offer brokers that actually have listings.
          if (brokerCodes.size > 0 && !brokerCodes.has(b.brokerCode)) continue;
          seenBroker.add(b.brokerCode);
          brokers.push({ code: b.brokerCode, name: b.brokerBrandName || b.brandName || b.brokerCode });
        }
      }

      setFilterOptions({
        locations: locations.sort((a, b) => a.localeCompare(b)),
        propertyTypes: propertyTypes.sort((a, b) => a.localeCompare(b)),
        brokers: brokers.sort((a, b) => a.name.localeCompare(b.name)),
      });
    };
    loadOptions().catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Fall back to the loaded page's values while the option request is in flight,
  // so the dropdowns are never empty on first paint.
  const uniqueLocations = useMemo(
    () => (filterOptions.locations.length > 0 ? filterOptions.locations : Array.from(new Set(properties.map((p) => p.location).filter(Boolean) as string[])).sort()),
    [filterOptions.locations, properties],
  );

  const uniquePropertyTypes = useMemo(
    () => (filterOptions.propertyTypes.length > 0 ? filterOptions.propertyTypes : Array.from(new Set(properties.map((p) => p.propertyType).filter(Boolean) as string[])).sort()),
    [filterOptions.propertyTypes, properties],
  );

  const uniqueBrokers = useMemo(() => {
    if (filterOptions.brokers.length > 0) return filterOptions.brokers;
    const brokers = new Map<string, string>();
    properties.forEach((p) => {
      if (p.brokerCode && p.brokerBrandName) {
        brokers.set(p.brokerCode, p.brokerBrandName);
      }
    });
    return Array.from(brokers.entries()).map(([code, name]) => ({ code, name }));
  }, [filterOptions.brokers, properties]);

  const filteredProperties = properties;

  // Scroll reveal for property cards.
  // `layout` is a dependency because switching views swaps the rendered tree:
  // the newly mounted .slide-up nodes start at opacity 0 and would never be
  // observed if this only re-ran when the result count changed.
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

    elements.forEach((el) => {
      // Check if already in viewport
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add("visible");
      } else {
        observer.observe(el);
      }
    });

    return () => observer.disconnect();
  }, [filteredProperties.length, layout]);

  const [needsAuth, setNeedsAuth] = useState(false);

  // After a successful booking the customer is sent to their dashboard.
  const {
    schedule: scheduleBookingRedirect,
    cancel: cancelBookingRedirect,
    goToBookings,
  } = useBookingRedirect();

  const isAuthenticated = () => {
    const getCookie = (name: string) => {
      if (typeof document === 'undefined') return null;
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
      return null;
    };

    return !!localStorage.getItem('zcanopy_token') || !!getCookie('zcanopy_token');
  };

  const closeBooking = () => {
    cancelBookingRedirect();
    setSelectedProperty(null);
    setNeedsAuth(false);
    setBookedProperty(null);
    setForm(emptyForm);
    setSubmitError("");
    setSuccess("");
    setPaymentStatus("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProperty) return;

    setSubmitting(true);
    setSubmitError("");
    setSuccess("");
    setPaymentStatus("");

    try {
      const token = localStorage.getItem("zcanopy_token") || "";
      setPaymentStatus("Initiating payment...");
      
      const result = await webApi.createBooking(token, {
        propertyId: selectedProperty.id,
        customerName: form.customerName,
        customerPhone: form.customerPhone,
        customerEmail: form.customerEmail,
        status: "pending",
      });

      const paymentResult = result as { success?: boolean; message?: string; bookingCode?: string; brokerPhone?: string };
      
      if (paymentResult.success) {
        setPaymentStatus("Payment completed successfully!");
        setSuccess("Booking confirmed! Check your email and SMS for the invoice code.");
        setForm(emptyForm);
        setBookedProperty({ ...selectedProperty, brokerPhone: paymentResult.brokerPhone });
        invalidateBookedPropertyIds();
        scheduleBookingRedirect();
      } else {
        setPaymentStatus("");
        setSubmitError(paymentResult.message || "Payment failed. Please try again.");
      }
    } catch {
      setPaymentStatus("");
      setSubmitError("Failed to process payment. Please try again.");
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
    <div className="w-full space-y-6 px-4 py-8 md:px-6">
      <BackButton />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl">Browse Properties</h2>
          <p className="mt-2 text-gray-500">Find your next home or investment and book directly.</p>
        </div>

        {/* Layout switcher */}
        <div
          role="group"
          aria-label="Property layout"
          className="flex items-center gap-1 rounded-xl border border-[var(--border-strong)] bg-[var(--zcanopy-surface)] p-1 shadow-sm"
        >
          {LAYOUT_OPTIONS.map(({ value, label, Icon }) => {
            const active = layout === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => layoutStore.set(value)}
                aria-pressed={active}
                title={`${label} view`}
                className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors ${
                  active ? "text-white" : "text-gray-600 hover:text-[var(--zcanopy-primary)]"
                }`}
                style={active ? { background: "var(--zcanopy-primary)" } : undefined}
              >
                <Icon size={16} />
                <span className="hidden sm:inline">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--zcanopy-surface)] p-5 shadow-[var(--shadow-soft)]">
        <div className="relative">
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

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
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
              {uniquePropertyTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
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
      </div>

      {/* Filter/query refetches keep the current results on screen and show an
          inline indicator, so changing a filter never blanks the grid. */}
      {isFetching && (
        <div className="mb-6 flex items-center justify-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--zcanopy-surface)] px-4 py-3">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--border-strong)] border-t-[var(--zcanopy-primary)]" />
          <span className="text-sm font-medium text-gray-600">Updating properties…</span>
        </div>
      )}

      {filteredProperties.length === 0 ? (
        isFetching ? null : (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--zcanopy-surface)] p-5 shadow-[var(--shadow-soft)]">
            <div className="py-12 text-center">
              <p className="text-gray-500">No properties found.</p>
            </div>
          </div>
        )
      ) : layout === "showcase" ? (
        <div className="flex flex-col gap-5">
          {filteredProperties.map((property, idx) => (
            <div
              key={property.id || `${property.title}-${idx}`}
              className="slide-up"
              style={{ animationDelay: `${Math.min(idx, 8) * 60}ms` }}
            >
              <PropertyShowcaseRow property={property} />
            </div>
          ))}
        </div>
      ) : layout === "video" ? (
        <PropertyVideoReel initialProperties={filteredProperties} onClose={() => layoutStore.set("grid")} />
      ) : (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProperties.map((property, idx) => (
            <div
              key={property.id || `${property.title}-${idx}`}
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
                  <button
                    type="button"
                    onClick={goToBookings}
                    className="btn-primary px-4 py-2 text-sm"
                  >
                    Go to my bookings
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

                  {paymentStatus && !submitError && (
                    <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                      {paymentStatus}
                    </div>
                  )}

                  {submitError && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                      {submitError}
                    </div>
                  )}
                  {success && !submitError && (
                    <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                      {success}
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={closeBooking}
                      disabled={submitting}
                      className="btn-ghost px-4 py-2 text-sm disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-primary px-4 py-2 text-sm disabled:opacity-50"
                    >
                      {submitting ? "Processing payment..." : "Confirm Booking"}
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