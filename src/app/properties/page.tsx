"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import PropertyCard from "@/components/PropertyCard";
import { webApi } from "@/lib/api";
import { MapPin, Calendar, DollarSign, Video, Image as ImageIcon } from "lucide-react";

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

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        let data;
        if (viewMode === "broker" && selectedBrokerCode) {
          const res = await webApi.brokerPropertiesByCode(selectedBrokerCode);
          data = res as any;
        } else if (search) {
          const res = await webApi.searchProperties(search);
          data = res as any;
        } else {
          const res = await webApi.publicProperties();
          data = res as any;
        }
        setProperties((data as any)?.properties || []);
      } catch {
        setError("Failed to load properties");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [search, viewMode, selectedBrokerCode]);

  const handleSearchChange = (value: string) => {
    setLocalSearch(value);
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }
    searchTimerRef.current = setTimeout(() => {
      setSearch(value);
    }, 300);
  };

  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      if (locationFilter && !p.location.toLowerCase().includes(locationFilter.toLowerCase())) return false;
      if (brokerFilter && !(p.brokerBrandName || "").toLowerCase().includes(brokerFilter.toLowerCase())) return false;
      if (dateFrom && p.createdAt < dateFrom) return false;
      if (dateTo && p.createdAt > dateTo + "T23:59:59Z") return false;
      return true;
    });
  }, [properties, locationFilter, brokerFilter, dateFrom, dateTo]);

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

  const openBooking = (property: Property) => {
    setSelectedProperty(property);
    setForm(emptyForm);
    setSubmitError("");
    setSuccess("");
  };

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
    <div className="mx-auto max-w-7xl px-3 md:px-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[var(--zcanopy-card-brown)]">Browse Properties</h2>
        <p className="text-gray-500">Find your next home or investment and book directly.</p>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-[var(--zcanopy-surface)] p-4 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">Search</label>
            <input
              type="text"
              value={localSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by title, location, broker..."
              className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-2 shadow-sm transition-colors focus:border-[var(--zcanopy-primary)] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-2 shadow-sm focus:border-[var(--zcanopy-primary)] focus:outline-none"
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
              className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-2 shadow-sm focus:border-[var(--zcanopy-primary)] focus:outline-none"
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
            <label className="block text-sm font-medium text-gray-700">From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-2 shadow-sm focus:border-[var(--zcanopy-primary)] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-2 shadow-sm focus:border-[var(--zcanopy-primary)] focus:outline-none"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-gray-100 pt-3">
          <span className="text-sm font-medium text-gray-700">View:</span>
          <button
            onClick={() => { setViewMode("all"); setSelectedBrokerCode(""); }}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${viewMode === "all" ? "bg-[var(--zcanopy-primary)] text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
          >
            All Properties
          </button>
          {uniqueBrokers.map((b) => (
            <button
              key={b.code}
              onClick={() => { setViewMode("broker"); setSelectedBrokerCode(b.code); }}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${viewMode === "broker" && selectedBrokerCode === b.code ? "bg-[var(--zcanopy-primary)] text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
            >
              {b.name}
            </button>
          ))}
        </div>
      </div>

      {filteredProperties.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-[var(--zcanopy-surface)] p-5 shadow-sm">
          <div className="py-12 text-center">
            <p className="text-gray-500">No properties found.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProperties.map((property) => (
            <PropertyCard key={property.id} {...property} />
          ))}
        </div>
      )}

      {selectedProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-gray-100 bg-[var(--zcanopy-surface)] p-5 shadow-sm max-h-[90vh] overflow-y-auto">
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
                    className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
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
                      className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-2 shadow-sm focus:border-[var(--zcanopy-primary)] focus:outline-none"
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
                      className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-2 shadow-sm focus:border-[var(--zcanopy-primary)] focus:outline-none"
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
                      className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-2 shadow-sm focus:border-[var(--zcanopy-primary)] focus:outline-none"
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
                      className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="rounded-xl bg-[var(--zcanopy-primary)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:opacity-90 disabled:opacity-50"
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
