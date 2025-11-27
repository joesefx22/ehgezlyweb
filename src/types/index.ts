// أنواع البيانات المشتركة في التطبيق

/** يمثل المستخدم في النظام */
export type UserRole = 'player' | 'owner' | 'manager' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  is_approved: boolean;
  avatar_url?: string;
  created_at: string;
}

/** يمثل الملعب */
export interface Stadium {
  id: string;
  owner_id: string;
  name: string;
  location: string;
  size_m2: number;
  price_per_hour: number;
  description: string;
  amenities: string[];
  images: string[];
  average_rating: number;
}

/** يمثل فترة زمنية متاحة للحجز */
export interface TimeSlot {
  id: string;
  stadium_id: string;
  start_time: string; // "HH:MM"
  end_time: string; // "HH:MM"
  date: string; // "YYYY-MM-DD"
  is_booked: boolean;
  price: number;
}

/** يمثل الحجز */
export interface Booking {
  id: string;
  player_id: string;
  stadium_id: string;
  slot_id: string;
  date: string;
  start_time: string;
  end_time: string;
  total_price: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'checked_in';
  created_at: string;
}

/** يمثل طلب لاعب للانضمام إلى مباراة */
export interface PlayerRequest {
  id: string;
  booking_id: string;
  requester_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  message?: string;
  created_at: string;
}

/** يمثل كود التعويض/الخصم */
export interface CompensationCode {
  id: string;
  code: string;
  discount_percentage: number;
  valid_until: string;
  status: 'active' | 'used' | 'expired';
}

/** بيانات إحصائية للوحة التحكم */
export interface DashboardStats {
  total_bookings: number;
  total_revenue: number;
  new_users: number;
  available_stadiums: number;
  pending_managers: number;
}

// أنواع بيانات الـ API
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  errors?: any;
}

// src/types/index.ts
export type UserRole = 'player' | 'employee' | 'owner' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  is_approved: boolean;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export type SlotStatus = 
  | 'AVAILABLE' 
  | 'BOOKED_CONFIRMED' 
  | 'BOOKED_UNCONFIRMED' 
  | 'PLAYED' 
  | 'EXPIRED_UNBOOKED' 
  | 'REPORTED_NOT_PLAYED';

export interface Stadium {
  id: string;
  name: string;
  location: string;
  type: string;
  images: string[];
  features: Record<string, boolean>;
  morning_hours_template: string[];
  evening_hours_template: string[];
  price_per_hour: number;
  deposit_amount: number;
  owner_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  average_rating?: number;
  total_ratings?: number;
}

export interface StadiumSlot {
  id: string;
  stadium_id: string;
  slot_time: string;
  slot_date: string;
  status: SlotStatus;
  deposit_paid?: number;
  final_price?: number;
  booking_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  slot_id: string;
  user_id: string;
  stadium_id: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'REFUNDED';
  total_price: number;
  deposit_amount: number;
  remaining_amount: number;
  payment_method: 'PAYMOB' | 'CODE';
  payment_reference?: string;
  date: string;
  start_time: string;
  end_time: string;
  created_at: string;
  updated_at: string;
  stadium_name?: string;
  user_name?: string;
}

export interface EmployeeAssignment {
  id: string;
  user_id: string;
  stadium_id: string;
  role_in_field: string;
  stadium_name?: string;
  location?: string;
}

export interface DiscountCode {
  id: string;
  code: string;
  type: 'DISCOUNT_GLOBAL' | 'PAYMENT_CODE_FOR_STADIUM' | 'COMPENSATION_CODE';
  stadium_id?: string;
  amount: number;
  is_percent: boolean;
  expires_at: string;
  uses_left: number;
  created_by: string;
}
