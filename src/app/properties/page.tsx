"use client";

import { useEffect, useMemo, useState, useRef, useTransition, useDeferredValue, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import PropertyCard from "@/components/PropertyCard";
import { SlidersHorizontal, X, Sparkles } from "lucide-react";
import { webApi, getSessionId, ensureAnonymousSession } from "@/lib/api";
import { SUPPORT_EMAIL } from "@/lib/navigation";
import Link from "next/link";
import { usePlacePredictions } from "@/hooks/useGooglePlaces";

import { useBookingRedirect } from "@/hooks/useBookingRedirect";
import { invalidateBookedPropertyIds } from "@/hooks/useBookedPropertyIds";
import { useSearchWizard } from "@/contexts/searchWizard";

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

// Reads the URL's guided-search params and pushes them into the page's filter
// state. Lives under a Suspense boundary so the page can stay statically
// prerendered while still reacting to client-side navigations (e.g. the
// wizard's router.push to /properties?guided=1&...).
function GuidedQuerySync({ onApply }: { onApply: (p: { location: string; propertyType: string; minPrice: string; maxPrice: string }) => void }) {
  const searchParams = useSearchParams();
  const qs = searchParams.toString();
  const seenRef = useRef<string | null>(null);

  useEffect(() => {
    const sp = new URLSearchParams(qs);
    if (!sp.has("guided")) return;
    if (qs === seenRef.current) return;
    seenRef.current = qs;
    onApply({
      location: sp.get("location") || "",
      propertyType: sp.get("propertyType") || "",
      minPrice: sp.get("minPrice") || "",
      maxPrice: sp.get("maxPrice") || "",
    });
  }, [qs, onApply]);

  return null;
}

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

  const { openWizard } = useSearchWizard();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sort, setSort] = useState<"newest" | "price-asc" | "price-desc">("newest");

  // Applied when the guided-search wizard confirms (or a guided URL is loaded
  // directly). Driven by useSearchParams so a client-side router.push to
  // /properties?guided=1&... while already on this page still re-applies the
  // filters and triggers a filtered fetch.
  const applyGuidedQuery = useCallback((p: { location: string; propertyType: string; minPrice: string; maxPrice: string }) => {
    setLocationFilter(p.location);
    setPropertyTypeFilter(p.propertyType);
    setMinPrice(p.minPrice);
    setMaxPrice(p.maxPrice);
  }, []);

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

  // Client-side sort applied to whatever has been loaded so far (the API has
  // no server-side sort param). Newest is the default, matching the explorer.
  const sortedProperties = useMemo(() => {
    const list = [...filteredProperties];
    if (sort === "price-asc") list.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    else if (sort === "price-desc") list.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    else list.sort((a, b) => Date.parse(b.createdAt || "0") - Date.parse(a.createdAt || "0"));
    return list;
  }, [filteredProperties, sort]);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const activeChips: { key: string; label: string; clear: () => void }[] = [];
  if (search) activeChips.push({ key: "search", label: `“${search}”`, clear: () => { setSearch(""); setLocalSearch(""); } });
  if (locationFilter) activeChips.push({ key: "location", label: locationFilter, clear: () => setLocationFilter("") });
  if (brokerFilter) activeChips.push({ key: "broker", label: brokerFilter, clear: () => setBrokerFilter("") });
  if (propertyTypeFilter) activeChips.push({ key: "type", label: propertyTypeFilter, clear: () => setPropertyTypeFilter("") });
  if (minPrice) activeChips.push({ key: "minPrice", label: `From ${formatUGX(Number(minPrice))}`, clear: () => setMinPrice("") });
  if (maxPrice) activeChips.push({ key: "maxPrice", label: `Up to ${formatUGX(Number(maxPrice))}`, clear: () => setMaxPrice("") });
  if (subCountyFilter) activeChips.push({ key: "subCounty", label: subCountyFilter, clear: () => setSubCountyFilter("") });
  if (districtFilter) activeChips.push({ key: "district", label: districtFilter, clear: () => setDistrictFilter("") });
  if (dateFrom) activeChips.push({ key: "dateFrom", label: `From ${dateFrom}`, clear: () => setDateFrom("") });
  if (dateTo) activeChips.push({ key: "dateTo", label: `To ${dateTo}`, clear: () => setDateTo("") });

  const clearAllFilters = () => {
    setSearch("");
    setLocalSearch("");
    setLocationFilter("");
    setBrokerFilter("");
    setPropertyTypeFilter("");
    setMinPrice("");
    setMaxPrice("");
    setSubCountyFilter("");
    setDistrictFilter("");
    setDateFrom("");
    setDateTo("");
  };

  // Scroll reveal for property cards. `.slide-up` starts at opacity 0 until
  // `.visible` is added. Depend on `properties` (not a ref counter): changing
  // a filter re-renders before the new list arrives, which would consume a
  // ref-based dep and skip observing the replacement cards.
  useEffect(() => {
    let observer: IntersectionObserver | null = null;
    let cancelled = false;
    let rafId = 0;

    const observeElements = () => {
      if (cancelled) return;
      const elements = document.querySelectorAll(".slide-up");
      if (!elements.length) return;

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("visible");
              observer?.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
      );

      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          el.classList.add("visible");
        } else {
          observer?.observe(el);
        }
      });
    };

    // After paint so newly mounted .slide-up nodes have layout.
    rafId = requestAnimationFrame(() => {
      observeElements();
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      observer?.disconnect();
    };
  }, [properties]);

  const [needsAuth, setNeedsAuth] = useState(false);

  // Confirmation lets the customer decide where to go next; no forced
  // navigation away from the property page.
  const { goToBookings } = useBookingRedirect();

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

  const filterFields = (
    <>
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
            {locationLoading && <div className="px-4 py-2 text-sm text-gray-500">Loading suggestions...</div>}
            {locationError && <div className="px-4 py-2 text-sm text-red-600">Location suggestions unavailable</div>}
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

      <div className="mt-4 grid grid-cols-1 gap-4">
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
    </>
  );

  const filterDrawer = (
    <div className="fixed inset-0 z-[60] block lg:hidden">
      <button
        type="button"
        aria-label="Close filters"
        onClick={() => setDrawerOpen(false)}
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
      />
      <div className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-[var(--zcanopy-surface)] shadow-[var(--shadow-lift)]">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
          <h3 className="text-lg font-semibold text-[var(--zcanopy-card-brown)]">Filters</h3>
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close filters"
            className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{filterFields}</div>
        {activeChips.length > 0 && (
          <div className="border-t border-[var(--border)] px-5 py-4">
            <button type="button" onClick={clearAllFilters} className="btn-ghost w-full px-4 py-2.5 text-sm">
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

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
      <Suspense fallback={null}>
        <GuidedQuerySync onApply={applyGuidedQuery} />
      </Suspense>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="eyebrow">The catalogue</span>
          <h2 className="mt-3 text-4xl md:text-[2.75rem]">Browse Properties</h2>
          <p className="mt-2 max-w-xl text-gray-500">
            {filteredProperties.length > 0 ? `${filteredProperties.length} properties found` : "Searching ZCanopy properties"} — book directly, no fees beyond the listed booking charge.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={openWizard}
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl bg-gradient-to-b from-[#bc8120] to-[var(--zcanopy-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors duration-150 hover:brightness-105"
          >
            <Sparkles size={16} />
            Guided search
          </button>

          <select
            aria-label="Sort properties"
            value={sort}
            onChange={(e) => setSort(e.target.value as "newest" | "price-asc" | "price-desc")}
            className="rounded-xl border border-[var(--border)] bg-[var(--zcanopy-surface)] px-3 py-2 text-sm font-medium text-gray-700 shadow-sm focus:border-[var(--zcanopy-primary)] focus:outline-none"
          >
            <option value="newest">Newest first</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>

          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="relative inline-flex items-center gap-2 rounded-xl border border-[var(--border-strong)] bg-[var(--zcanopy-surface)] px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:border-[var(--zcanopy-primary)] hover:text-[var(--zcanopy-primary)] lg:hidden"
          >
            <SlidersHorizontal size={16} />
            <span className="hidden sm:inline">Filters</span>
            {activeChips.length > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--zcanopy-primary)] px-1.5 text-xs font-bold text-white">
                {activeChips.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {activeChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {activeChips.map((chip) => (
            <span
              key={chip.key}
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-strong)] bg-[var(--zcanopy-surface)] py-1 pl-3 pr-1.5 text-sm font-medium text-[var(--zcanopy-card-brown)] shadow-sm"
            >
              {chip.label}
              <button
                type="button"
                onClick={chip.clear}
                aria-label={`Remove ${chip.label}`}
                className="rounded-full p-0.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
              >
                <X size={14} />
              </button>
            </span>
          ))}
          {activeChips.length > 1 && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-sm font-medium text-[var(--zcanopy-primary)] transition-colors hover:underline"
            >
              Clear all
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <div className="filter-panel rounded-2xl border border-[var(--border)] bg-[var(--zcanopy-surface)] p-5 shadow-[var(--shadow-soft)]">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--zcanopy-card-brown)]">
                  Filters
                </h3>
                {activeChips.length > 0 && (
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="text-sm font-medium text-[var(--zcanopy-primary)] hover:underline"
                  >
                    Clear all
                  </button>
                )}
              </div>
              {filterFields}
            </div>
          </div>
        </aside>

        <div className="min-w-0">

      {/* Filter/query refetches keep the current results on screen and show an
          inline indicator, so changing a filter never blanks the grid. */}
      {isFetching && (
        <div className="mb-6 flex items-center justify-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--zcanopy-surface)] px-4 py-3">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--border-strong)] border-t-[var(--zcanopy-primary)]" />
          <span className="text-sm font-medium text-gray-600">Updating properties…</span>
        </div>
      )}

      {sortedProperties.length === 0 ? (
        isFetching ? null : (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--zcanopy-surface)] p-5 shadow-[var(--shadow-soft)]">
            <div className="py-12 text-center">
              <p className="text-gray-500">No properties found.</p>
            </div>
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {sortedProperties.map((property, idx) => (
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
        </div>
      </div>

      {drawerOpen && filterDrawer}

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
                  <p className="mt-1">Email: <a href={`mailto:${SUPPORT_EMAIL}`} className="text-[var(--zcanopy-primary)]">{SUPPORT_EMAIL}</a></p>
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