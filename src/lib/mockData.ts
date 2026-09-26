const MOCK_PROPERTIES = [
  {
    id: "p1",
    title: "2BR Apartment in Kololo",
    description: "Modern apartment with shared pool, balcony & 24/7 security.",
    propertyType: "apartment",
    location: "Kololo, Kampala",
    brokersUniqueCode: "BRK-001",
    brokerBrandName: "Alice Properties",
    brokerPhone: "+256701234567",
    isAvailable: true,
    createdAt: "2026-08-01T10:00:00Z",
    updatedAt: "2026-08-01T10:00:00Z",
    photoCount: 3,
    videoCount: 0,
    postgisSpatialField: JSON.stringify({ lat: 0.3476, lng: 32.5825 }),
    imageUrl: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
      "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&q=80",
    ],
    videoUrl: [],
    price: 850000,
    brokerBookingFee: 25000,
    subCounty: "Kampala",
    district: "Kampala",
  },
  {
    id: "p2",
    title: "3BR Villa in Muyenga",
    description: "Spacious family villa with garden, double garage & maid's quarter.",
    propertyType: "villa",
    location: "Muyenga, Kampala",
    brokersUniqueCode: "BRK-002",
    brokerBrandName: "Brian Homes",
    brokerPhone: "+256702345678",
    isAvailable: true,
    createdAt: "2026-08-02T10:00:00Z",
    updatedAt: "2026-08-02T10:00:00Z",
    photoCount: 2,
    videoCount: 1,
    postgisSpatialField: JSON.stringify({ lat: 0.2958, lng: 32.6154 }),
    imageUrl: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80",
    ],
    videoUrl: ["https://www.w3schools.com/html/mov_bbb.mp4"],
    price: 1500000,
    brokerBookingFee: 50000,
    subCounty: "Kampala",
    district: "Kampala",
  },
  {
    id: "p3",
    title: "Office Space in CBD",
    description: "Prime office location with secure parking.",
    propertyType: "commercial",
    location: "CBD, Kampala",
    brokersUniqueCode: "BRK-004",
    brokerBrandName: "David Commercial",
    brokerPhone: "+256704567890",
    isAvailable: false,
    createdAt: "2026-08-03T10:00:00Z",
    updatedAt: "2026-08-03T10:00:00Z",
    photoCount: 4,
    videoCount: 0,
    postgisSpatialField: JSON.stringify({ lat: 0.3136, lng: 32.5705 }),
    imageUrl: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
      "https://images.unsplash.com/photo-1497215842964-222b430dc094?w=800&q=80",
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80",
      "https://images.unsplash.com/photo-1604014237800-1c9102c219da?w=800&q=80",
    ],
    videoUrl: [],
    price: 2200000,
    brokerBookingFee: 100000,
    subCounty: "Kampala",
    district: "Kampala",
  },
  {
    id: "p4",
    title: "Land Plot in Kira",
    description: "Residential land for sale, surveyed and ready for title processing.",
    propertyType: "land",
    location: "Kira, Wakiso",
    brokersUniqueCode: "BRK-001",
    brokerBrandName: "Alice Properties",
    brokerPhone: "+256701234567",
    isAvailable: true,
    createdAt: "2026-08-04T10:00:00Z",
    updatedAt: "2026-08-04T10:00:00Z",
    photoCount: 2,
    videoCount: 0,
    postgisSpatialField: JSON.stringify({ lat: 0.3658, lng: 32.6500 }),
    imageUrl: [
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80",
      "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800&q=80",
    ],
    videoUrl: [],
    price: 420000,
    brokerBookingFee: 15000,
    subCounty: "Wakiso",
    district: "Wakiso",
  },
  {
    id: "p5",
    title: "1BR Studio in Ntinda",
    description: "Cozy studio apartment, ideal for young professionals. Gated community.",
    propertyType: "apartment",
    location: "Ntinda, Kampala",
    brokersUniqueCode: "BRK-003",
    brokerBrandName: "Carol Homes",
    brokerPhone: "+256703456789",
    isAvailable: true,
    createdAt: "2026-08-05T10:00:00Z",
    updatedAt: "2026-08-05T10:00:00Z",
    photoCount: 1,
    videoCount: 0,
    postgisSpatialField: JSON.stringify({ lat: 0.3476, lng: 32.6154 }),
    imageUrl: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
    ],
    videoUrl: [],
    price: 320000,
    brokerBookingFee: 10000,
    subCounty: "Kampala",
    district: "Kampala",
  },
  {
    id: "p6",
    title: "Mansion in Munyonyo",
    description: "Luxury lakeside mansion with private beach and gym.",
    propertyType: "mansion",
    location: "Munyonyo, Kampala",
    brokersUniqueCode: "BRK-005",
    brokerBrandName: "Eva Luxury",
    brokerPhone: "+256705678901",
    isAvailable: true,
    createdAt: "2026-08-06T10:00:00Z",
    updatedAt: "2026-08-06T10:00:00Z",
    photoCount: 2,
    videoCount: 1,
    postgisSpatialField: JSON.stringify({ lat: 0.2500, lng: 32.6200 }),
    imageUrl: [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80",
    ],
    videoUrl: ["https://www.w3schools.com/html/mov_bbb.mp4"],
    price: 8500000,
    brokerBookingFee: 100000,
    subCounty: "Kampala",
    district: "Kampala",
  },
];

export const mockData = {
  properties: (query?: Record<string, string | number | boolean | undefined>) => {
    let results = [...MOCK_PROPERTIES];
    if (query?.location) {
      const location = String(query.location).toLowerCase();
      results = results.filter((p) => p.location.toLowerCase().includes(location));
    }
    if (query?.propertyType) {
      const type = String(query.propertyType).toLowerCase();
      results = results.filter((p) => p.propertyType.toLowerCase() === type);
    }
    if (query?.brokerBrandName) {
      const broker = String(query.brokerBrandName).toLowerCase();
      results = results.filter((p) => (p.brokerBrandName || "").toLowerCase().includes(broker));
    }
    if (query?.minPrice != null) {
      const min = Number(query.minPrice);
      results = results.filter((p) => (p.price || 0) >= min);
    }
    if (query?.maxPrice != null) {
      const max = Number(query.maxPrice);
      results = results.filter((p) => (p.price || 0) <= max);
    }
    return { properties: results, total: results.length };
  },
  propertyDetails: (id: string) => ({ property: MOCK_PROPERTIES.find((p) => p.id === id) || MOCK_PROPERTIES[0] }),
  search: (query: string, queryParams?: Record<string, string | number | boolean | undefined>) => {
    const term = (query || "").toLowerCase();
    let results = MOCK_PROPERTIES.filter(
      (p) =>
        p.title.toLowerCase().includes(term) ||
        p.location.toLowerCase().includes(term) ||
        p.brokerBrandName?.toLowerCase().includes(term),
    );
    if (queryParams?.propertyType) {
      const type = String(queryParams.propertyType).toLowerCase();
      results = results.filter((p) => p.propertyType.toLowerCase() === type);
    }
    if (queryParams?.location) {
      const location = String(queryParams.location).toLowerCase();
      results = results.filter((p) => p.location.toLowerCase().includes(location));
    }
    if (queryParams?.brokerBrandName) {
      const broker = String(queryParams.brokerBrandName).toLowerCase();
      results = results.filter((p) => (p.brokerBrandName || "").toLowerCase().includes(broker));
    }
    if (queryParams?.minPrice != null) {
      const min = Number(queryParams.minPrice);
      results = results.filter((p) => (p.price || 0) >= min);
    }
    if (queryParams?.maxPrice != null) {
      const max = Number(queryParams.maxPrice);
      results = results.filter((p) => (p.price || 0) <= max);
    }
    return { properties: results, total: results.length };
  },
  bookings: () => ({
    bookings: [
      { id: "wb1", propertyId: "p1", propertyTitle: "2BR Apartment in Kololo", customerName: "John Doe", customerPhone: "+256701234567", customerEmail: "john@example.com", date: "2026-08-20", status: "pending", amount: 850000, transactionCode: "TXN-BK-001", reason: "property_access", location: "Kololo, Kampala" },
      { id: "wb2", propertyId: "p2", propertyTitle: "3BR Villa in Muyenga", customerName: "Jane Smith", customerPhone: "+256772345678", customerEmail: "jane@example.com", date: "2026-08-21", status: "approved", amount: 1500000, transactionCode: "TXN-BK-002", reason: "property_access", location: "Muyenga, Kampala" },
    ],
  }),
  wallet: () => ({ balance: 2000000, currency: "UGX", walletId: "wallet-web-1" }),
  walletTransactions: () => ({
    transactions: [
      { id: "wt1", type: "credit", amount: 1500000, balanceAfter: 2500000, reason: "Booking payment - Muyenga Villa", referenceNumber: "REF-001", transactionCode: "TXN-001", createdBy: "system", createdAt: "2026-08-21T08:00:00Z" },
      { id: "wt2", type: "debit", amount: 500000, balanceAfter: 2000000, reason: "Platform fee", referenceNumber: "REF-002", transactionCode: "TXN-002", createdBy: "system", createdAt: "2026-08-20T08:00:00Z" },
    ],
    total: 2,
  }),
  brokerProperties: () => ({ properties: MOCK_PROPERTIES.slice(0, 2), total: 2 }),
  brokerDashboard: () => ({
    broker: { id: "b1", username: "Demo Broker", email: "broker@example.com", brokerCode: "BRK-WEB-1", subscriptionTier: "prop" },
    properties: { properties: MOCK_PROPERTIES.slice(0, 2), total: 2 },
    bookings: { bookings: [] },
    wallet: { balance: 2000000, currency: "UGX", walletId: "wallet-web-1" },
  }),
  customerProperties: (query?: Record<string, string | number | boolean | undefined>) => {
    let results = [...MOCK_PROPERTIES];
    if (query?.location) {
      const location = String(query.location).toLowerCase();
      results = results.filter((p) => p.location.toLowerCase().includes(location));
    }
    if (query?.propertyType) {
      const type = String(query.propertyType).toLowerCase();
      results = results.filter((p) => p.propertyType.toLowerCase() === type);
    }
    if (query?.brokerBrandName) {
      const broker = String(query.brokerBrandName).toLowerCase();
      results = results.filter((p) => (p.brokerBrandName || "").toLowerCase().includes(broker));
    }
    if (query?.minPrice != null) {
      const min = Number(query.minPrice);
      results = results.filter((p) => (p.price || 0) >= min);
    }
    if (query?.maxPrice != null) {
      const max = Number(query.maxPrice);
      results = results.filter((p) => (p.price || 0) <= max);
    }
    return { properties: results, total: results.length };
  },
  customerBookings: () => ({
    bookings: [
      { id: "wb1", propertyId: "p1", propertyTitle: "2BR Apartment in Kololo", customerName: "John Doe", customerPhone: "+256701234567", customerEmail: "john@example.com", date: "2026-08-20T10:00:00Z", status: "pending", amount: 850000, transactionCode: "TXN-BK-001", reason: "property_access", location: "Kololo, Kampala" },
    ],
  }),
  customerTransactions: () => ({
    transactions: [
      { id: "wt1", propertyId: "p1", propertyTitle: "2BR Apartment in Kololo", clientPhone: "+256701234567", amount: 850000, platformCommission: 85000, paymentStatus: "completed", reasonForPayment: "Booking - 2BR Apartment in Kololo", referenceNumber: "TXN-001", transactionCode: "TXN-001", customerName: "John Doe", customerEmail: "john@example.com", createdAt: "2026-08-20T09:00:00Z" },
      { id: "wt2", propertyId: "p2", propertyTitle: "3BR Villa in Muyenga", clientPhone: "+256772345678", amount: 1500000, platformCommission: 150000, paymentStatus: "completed", reasonForPayment: "Booking - 3BR Villa in Muyenga", referenceNumber: "TXN-002", transactionCode: "TXN-002", customerName: "Jane Smith", customerEmail: "jane@example.com", createdAt: "2026-08-21T10:00:00Z" },
      { id: "wt3", propertyId: "p1", propertyTitle: "2BR Apartment in Kololo", clientPhone: "+256701234567", amount: 50000, platformCommission: 0, paymentStatus: "pending", reasonForPayment: "Platform fee - Kololo Apartment", referenceNumber: "TXN-003", transactionCode: "TXN-003", customerName: "John Doe", customerEmail: "john@example.com", createdAt: "2026-08-22T11:00:00Z" },
    ],
    total: 3,
  }),
  customerInvoices: () => ({
    invoices: [
      { id: "inv1", propertyId: "p1", propertyTitle: "2BR Apartment in Kololo", clientPhone: "+256701234567", amount: 850000, platformCommission: 85000, paymentStatus: "paid", reasonForPayment: "Booking - 2BR Apartment in Kololo", referenceNumber: "REF-001", transactionCode: "TXN-001", customerName: "John Doe", customerEmail: "john@example.com", createdAt: "2026-08-01T00:00:00Z" },
      { id: "inv2", propertyId: "p4", propertyTitle: "Land Plot in Kira", clientPhone: "+256701234567", amount: 420000, platformCommission: 0, paymentStatus: "unpaid", reasonForPayment: "Booking - Land Plot in Kira", referenceNumber: "REF-002", transactionCode: "TXN-002", customerName: "John Doe", customerEmail: "john@example.com", createdAt: "2026-08-15T00:00:00Z" },
    ],
    total: 2,
  }),
  customerMessages: () => ({
    messages: [
      { id: "msg1", subject: "Booking confirmation - Kololo Apartment", body: "Your booking for the 2BR Apartment in Kololo has been confirmed. The broker will contact you shortly.", source: "system", attachmentUrl: "", createdAt: "2026-08-20T10:00:00Z" },
      { id: "msg2", subject: "Welcome to ZCanopy", body: "Welcome to ZCanopy! Your account has been created successfully. Start browsing properties and booking viewings.", source: "system", attachmentUrl: "", createdAt: "2026-08-15T09:00:00Z" },
    ],
    total: 2,
  }),
  customerNotifications: () => ({
    notifications: [
      { id: "notif1", title: "New message from broker", body: "Alice Properties sent you a message regarding your booking inquiry.", type: "message", isRead: false, createdAt: "2026-08-20T12:00:00Z", readAt: null },
      { id: "notif2", title: "Booking reminder", body: "Your property viewing for 2BR Apartment in Kololo is scheduled for tomorrow at 10:00 AM.", type: "booking", isRead: false, createdAt: "2026-08-21T08:00:00Z", readAt: null },
      { id: "notif3", title: "Payment received", body: "Your payment of UGX 850,000 has been received and your booking is being processed.", type: "payment", isRead: true, createdAt: "2026-08-20T11:00:00Z", readAt: "2026-08-20T11:00:00Z" },
    ],
    total: 3,
    unreadCount: 2,
  }),
  brokerByCode: () => ({ id: "b1", username: "Demo Broker", email: "broker@example.com", brokerCode: "BRK-WEB-1" }),
  featuredProperties: () => ({
    properties: MOCK_PROPERTIES.slice(0, 4).map((p) => ({
      ...p,
      priceLabel: "Booking",
    })),
  }),
};
