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
