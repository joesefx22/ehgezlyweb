// الثوابت والنماذج
const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed'
};

const PAYMENT_TYPES = {
  DEPOSIT: 'deposit',
  FULL: 'full'
};

const CODE_TYPES = {
  PITCH: 'pitch',
  PREMIUM: 'premium',
  COMPENSATION: 'compensation'
};

const CODE_SOURCES = {
  PITCH: 'pitch',
  OWNER: 'owner',
  CANCELLATION: 'cancellation'
};

const TIME_SLOT_STATUS = {
  AVAILABLE: 'available',
  BOOKED: 'booked', 
  PENDING: 'pending',
  GOLDEN: 'golden',
  BLOCKED: 'blocked'
};

const PLAYER_REQUEST_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected'
};

const VOUCHER_STATUS = {
  ACTIVE: 'active',
  USED: 'used',
  EXPIRED: 'expired'
};

// بيانات الملاعب
const pitchesData = [
  {
    id: 1, name: "نادي الطيارة - الملعب الرئيسي", location: "المقطم - شارع التسعين", area: "mokatam", 
    type: "artificial", image: "/images/tyara-1.jpg", price: 250, deposit: 75, depositRequired: true,
    features: ["نجيلة صناعية", "كشافات ليلية", "غرف تبديل", "موقف سيارات", "كافتيريا"],
    rating: 4.7, totalRatings: 128, coordinates: { lat: 30.0130, lng: 31.2929 },
    workingHours: { start: 8, end: 24 }, googleMaps: "https://maps.app.goo.gl/v6tj8pxhG5FHfoSj9",
    availability: 8, totalSlots: 12, availabilityPercentage: 67,
    depositPolicy: {
      lessThan24Hours: 0,
      between24_48Hours: 30,
      moreThan48Hours: 50
    },
    managers: [],
    blockedSlots: []
  },
  {
    id: 2, name: "نادي الطيارة - الملعب الثاني", location: "المقطم - شارع التسعين", area: "mokatam", 
    type: "artificial", image: "/images/tyara-2.jpg", price: 200, deposit: 60, depositRequired: true,
    features: ["نجيلة صناعية", "كشافات ليلية", "غرف تبديل", "موقف سيارات"],
    rating: 4.5, totalRatings: 89, coordinates: { lat: 30.0135, lng: 31.2935 },
    workingHours: { start: 8, end: 24 }, googleMaps: "https://maps.app.goo.gl/v6tj8pxhG5FHfoSj9",
    availability: 6, totalSlots: 10, availabilityPercentage: 60
  }
];

module.exports = {
  BOOKING_STATUS,
  PAYMENT_TYPES,
  CODE_TYPES,
  CODE_SOURCES,
  TIME_SLOT_STATUS,
  PLAYER_REQUEST_STATUS,
  VOUCHER_STATUS,
  pitchesData
};
