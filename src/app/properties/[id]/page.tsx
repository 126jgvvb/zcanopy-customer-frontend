"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { webApi, getSessionId, ensureAnonymousSession } from "@/lib/api";
import { MapPin, Calendar, Video, ArrowLeft, ExternalLink, Heart, MessageSquare, Star } from "lucide-react";
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

interface Comment {
  id: string;
  customerName: string;
  comment: string;
  rating: number;
  createdAt: string;
}

const emptyForm: BookingForm = {
  customerName: "",
  customerPhone: "",
  customerEmail: "",
};

const emptyCommentForm = {
  customerName: "",
  customerPhone: "",
  customerEmail: "",
  comment: "",
  rating: 0,
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
  const [favorited, setFavorited] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [commentForm, setCommentForm] = useState(emptyCommentForm);
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await webApi.propertyDetails(id);
        const prop = (data as any)?.property || (data as any) || null;
        setProperty(prop);

        let commentsData: any = { comments: [], averageRating: 0 };
        try {
          commentsData = await webApi.getPropertyComments(id);
        } catch {
          // comments endpoint may be unavailable
        }
        setComments((commentsData as any)?.comments || []);
        setAverageRating((commentsData as any)?.averageRating || 0);

        const sessionId = getSessionId();
        if (sessionId) {
          try {
            const favs = await webApi.getCustomerFavorites(sessionId);
            const favList = (favs as any)?.favorites || [];
            setFavorited(favList.some((f: any) => f.propertyId === id));
          } catch {
            // favorites endpoint may be unavailable
          }
        }
      } catch {
        setError("Failed to load property details");
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  const toggleFavorite = async () => {
    try {
      let sessionId = getSessionId();
      if (!sessionId) {
        const newSession = await ensureAnonymousSession();
        sessionId = newSession || null;
      }
      if (!sessionId) {
        window.alert("Unable to start a customer session right now. Please refresh and try again.");
        return;
      }
      const res = await webApi.toggleFavorite({
        sessionToken: sessionId,
        propertyId: id,
        propertyTitle: property?.title || "",
        propertyLocation: property?.location || "",
        imageUrl: property?.imageUrl?.[0] || "",
        price: property?.price || 0,
      });
      setFavorited((res as any).favorited);
    } catch {
      // ignore
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!property) return;
    const sessionId = getSessionId();
    if (!sessionId) {
      window.alert("Please continue as a customer to comment.");
      return;
    }
    setSubmittingComment(true);
    try {
      const res = await webApi.addComment({
        sessionToken: sessionId,
        propertyId: property.id,
        customerName: commentForm.customerName,
        customerPhone: commentForm.customerPhone,
        customerEmail: commentForm.customerEmail,
        comment: commentForm.comment,
        rating: commentForm.rating,
      });
      if ((res as any).success) {
        setCommentForm(emptyCommentForm);
        const commentsData = await webApi.getPropertyComments(property.id);
        setComments((commentsData as any)?.comments || []);
        setAverageRating((commentsData as any)?.averageRating || 0);
      }
    } catch {
      // ignore
    } finally {
      setSubmittingComment(false);
    }
  };

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

          {(lat != null && lng != null && lat !== 0 && lng !== 0) ? (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--zcanopy-surface)] p-6 shadow-[var(--shadow-soft)]">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-[var(--zcanopy-card-brown)]">
                <MapPin size={18} />
                Location
              </h3>
              <div className="h-80 w-full overflow-hidden rounded-xl">
                <iframe
                  title={`Map of ${property.title}`}
                  src={`https://www.google.com/maps?q=${lat},${lng}&z=15&output=embed`}
                  className="h-full w-full border-0"
                  loading="lazy"
                  allowFullScreen
                />
              </div>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-[var(--zcanopy-primary)] hover:text-[var(--zcanopy-primary)]"
              >
                <ExternalLink size={16} />
                Open in Google Maps
              </a>
            </div>
          ) : (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--zcanopy-surface)] p-6 shadow-[var(--shadow-soft)]">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-[var(--zcanopy-card-brown)]">
                <MapPin size={18} />
                Location
              </h3>
              <div className="py-8 text-center text-sm text-gray-500">
                <p>This property was not lively captured on site,please refer to the location text</p>
                <p className="mt-1 text-xs text-gray-400">Location: {property.location}</p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--zcanopy-surface)] p-6 shadow-[var(--shadow-soft)]">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-[var(--zcanopy-card-brown)]">Booking Info</h3>
              </div>
              <button
                type="button"
                onClick={toggleFavorite}
                className="rounded-full p-2 text-gray-600 transition hover:bg-gray-100"
              >
                <Heart
                  size={20}
                  fill={favorited ? "#ef4444" : "none"}
                  color={favorited ? "#ef4444" : "currentColor"}
                />
              </button>
            </div>
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

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--zcanopy-surface)] p-6 shadow-[var(--shadow-soft)]">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-[var(--zcanopy-card-brown)]">
              <MessageSquare size={18} />
              Reviews & Comments
            </h3>
            {averageRating > 0 && (
              <div className="mb-4 text-sm text-gray-600">
                Average rating: <span className="font-semibold">{averageRating.toFixed(1)}</span> / 5
              </div>
            )}
            <div className="space-y-3">
              {comments.map((c) => (
                <div key={c.id} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-800">{c.customerName}</p>
                    <span className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{c.comment}</p>
                  <p className="mt-1 text-xs text-gray-500">Rating: {c.rating}/5</p>
                </div>
              ))}
              {comments.length === 0 && (
                <p className="text-sm text-gray-500">No comments yet. Be the first to review this property.</p>
              )}
            </div>
            <form onSubmit={handleCommentSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  required
                  value={commentForm.customerName}
                  onChange={(e) => setCommentForm({ ...commentForm, customerName: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--zcanopy-surface)] px-4 py-2.5 shadow-sm"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  required
                  value={commentForm.customerPhone}
                  onChange={(e) => setCommentForm({ ...commentForm, customerPhone: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--zcanopy-surface)] px-4 py-2.5 shadow-sm"
                  placeholder="+256 700 000000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={commentForm.customerEmail}
                  onChange={(e) => setCommentForm({ ...commentForm, customerEmail: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--zcanopy-surface)] px-4 py-2.5 shadow-sm"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Rating</label>
                <StarRating value={commentForm.rating} onChange={(rating) => setCommentForm({ ...commentForm, rating })} average={averageRating || undefined} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Comment</label>
                <textarea
                  required
                  value={commentForm.comment}
                  onChange={(e) => setCommentForm({ ...commentForm, comment: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--zcanopy-surface)] px-4 py-2.5 shadow-sm"
                  rows={3}
                  placeholder="Share your experience..."
                />
              </div>
              <button
                type="submit"
                disabled={submittingComment}
                className="btn-primary w-full px-4 py-2.5 text-sm disabled:opacity-50"
              >
                {submittingComment ? "Submitting..." : "Submit Review"}
              </button>
            </form>
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

function StarRating({ value, onChange, average }: { value: number; onChange: (value: number) => void; average?: number }) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="relative transition-transform duration-200 hover:scale-110"
        >
          <Star
            size={24}
            fill={star <= (hover || value) ? "#facc15" : "none"}
            color={star <= (hover || value) ? "#facc15" : "#9ca3af"}
            className={star === value ? "animate-[starDust_0.6s_ease-out]" : ""}
          />
          {star === value && (
            <>
              <span className="absolute -top-1 left-1/2 h-1 w-1 rounded-full bg-yellow-400 opacity-0 animate-[starDust_0.7s_ease-out_0.05s_forwards]" />
              <span className="absolute -top-2 left-1/2 h-1.5 w-1.5 rounded-full bg-yellow-300 opacity-0 animate-[starDust_0.8s_ease-out_0.1s_forwards]" />
              <span className="absolute top-1/2 -right-2 h-1 w-1 rounded-full bg-yellow-400 opacity-0 animate-[starDust_0.7s_ease-out_0.15s_forwards]" />
              <span className="absolute top-1/2 -left-2 h-1.5 w-1.5 rounded-full bg-yellow-300 opacity-0 animate-[starDust_0.8s_ease-out_0.2s_forwards]" />
            </>
          )}
        </button>
      ))}
      {typeof average === "number" && (
        <span className="ml-2 text-sm text-gray-600">{average.toFixed(1)} / 5</span>
      )}
      <style jsx>{`
        @keyframes starDust {
          0% { transform: translate(0, 0) scale(1); opacity: 0.9; }
          100% { transform: translate(var(--dx, 8px), var(--dy, -12px)) scale(0); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
