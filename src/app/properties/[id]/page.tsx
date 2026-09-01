"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { webApi } from "@/lib/api";
import { MapPin, Calendar, Video, ArrowLeft } from "lucide-react";
import Link from "next/link";

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

export default function PropertyDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [form, setForm] = useState<BookingForm>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState("");
  const [bookedProperty, setBookedProperty] = useState<Property | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await webApi.propertyDetails(id);
        setProperty((data as any)?.property || null);
      } catch {
        setError("Failed to load property details");
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  const openBooking = () => {
    if (!property) return;
    setSelectedProperty(property);
    setForm(emptyForm);
    setSubmitError("");
    setSuccess("");
    setBookedProperty(null);
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
    } catch {
      setSubmitError("Failed to create booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-sm text-gray-500">Loading property details...</p>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="space-y-4">
        <Link href="/properties" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[var(--zcanopy-primary)]">
          <ArrowLeft size={16} />
          Back to properties
        </Link>
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error || "Property not found"}
        </div>
      </div>
    );
  }

  const images = property.imageUrl || [];
  const videos = property.videoUrl || [];
  const lat = property.postgis_spatial_field?.lat;
  const lng = property.postgis_spatial_field?.lng;

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-6 py-10 md:px-10">
      <Link href="/properties" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[var(--zcanopy-primary)]">
        <ArrowLeft size={16} />
        Back to properties
      </Link>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--zcanopy-surface)] p-6 shadow-[var(--shadow-soft)]">
            <div className="aspect-video w-full overflow-hidden rounded-t-2xl bg-gray-100">
              <img
                src={selectedImage || images[0] || "https://via.placeholder.com/400x200?text=No+Image"}
                alt={property.title}
                className="h-full w-full object-cover"
              />
            </div>
            {images.length > 1 && (
              <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`h-16 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 ${selectedImage === img ? "border-[var(--zcanopy-primary)]" : "border-transparent"}`}
                  >
                    <img src={img} alt={`${property.title} ${idx + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--zcanopy-surface)] p-6 shadow-[var(--shadow-soft)]">
            <h1 className="text-3xl">{property.title}</h1>
            <p className="mt-2 text-gray-600">{property.description}</p>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin size={16} />
                {property.location}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar size={16} />
                {new Date(property.createdAt).toLocaleDateString()}
              </div>
              {property.price !== undefined && (
                <div className="flex items-center gap-2 text-sm font-semibold text-[var(--zcanopy-card-brown)]">
                  {formatUGX(property.price)}
                </div>
              )}
              {property.brokerBrandName && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-medium">Broker:</span> {property.brokerBrandName}
                </div>
              )}
            </div>
          </div>

          {videos.length > 0 && (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--zcanopy-surface)] p-6 shadow-[var(--shadow-soft)]">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-[var(--zcanopy-card-brown)]">
                <Video size={18} />
                Videos
              </h3>
              <div className="space-y-4">
                {videos.map((video, idx) => (
                  <video
                    key={idx}
                    src={video}
                    className="h-64 w-full rounded-xl object-cover"
                    controls
                    preload="metadata"
                  />
                ))}
              </div>
            </div>
          )}

          {lat !== undefined && lng !== undefined && (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--zcanopy-surface)] p-6 shadow-[var(--shadow-soft)]">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-[var(--zcanopy-card-brown)]">
                <MapPin size={18} />
                Location
              </h3>
              <div className="h-80 w-full overflow-hidden rounded-xl">
                <iframe
                  title={`Map of ${property.title}`}
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.02}%2C${lat - 0.02}%2C${lng + 0.02}%2C${lat + 0.02}&layer=mapnik&marker=${lat}%2C${lng}`}
                  className="h-full w-full border-0"
                  loading="lazy"
                  allowFullScreen
                />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--zcanopy-surface)] p-6 shadow-[var(--shadow-soft)]">
            <h3 className="text-lg font-semibold text-[var(--zcanopy-card-brown)]">Booking Info</h3>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${property.isAvailable ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                  {property.isAvailable ? "Available" : "Booked"}
                </span>
              </div>
              {property.price !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Price</span>
                  <span className="text-sm font-semibold text-[var(--zcanopy-card-brown)]">{formatUGX(property.price)}</span>
                </div>
              )}
              {property.bookingFee !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Booking fee</span>
                  <span className="text-sm font-semibold text-[var(--zcanopy-card-brown)]">{formatUGX(property.bookingFee)}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Type</span>
                <span className="text-sm font-semibold text-[var(--zcanopy-card-brown)]">{property.propertyType}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Photos</span>
                <span className="text-sm font-semibold text-[var(--zcanopy-card-brown)]">{images.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Videos</span>
                <span className="text-sm font-semibold text-[var(--zcanopy-card-brown)]">{videos.length}</span>
              </div>
            </div>
            {property.isAvailable && (
              <button
                onClick={openBooking}
                className="btn-primary mt-4 w-full px-4 py-2.5 text-sm"
              >
                Book Now
              </button>
            )}
          </div>
        </div>
      </div>

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
