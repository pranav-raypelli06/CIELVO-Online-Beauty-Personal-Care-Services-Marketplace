import { z } from 'zod';

export const customerRegisterSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Must be a valid 10-digit Indian mobile number'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  state: z.string().min(2, 'State is required'),
  city: z.string().min(2, 'City is required'),
  termsAccepted: z.boolean().refine((val) => val === true, 'You must accept the Terms and Privacy Policy'),
});

export const salonRegisterSchema = z.object({
  businessName: z.string().min(3, 'Business name must be at least 3 characters'),
  ownerName: z.string().min(2, 'Owner name must be at least 2 characters'),
  email: z.string().email('Invalid business email address'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Must be a valid 10-digit Indian mobile number'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  state: z.string().min(2, 'State is required'),
  district: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  locality: z.string().min(2, 'Locality is required'),
  postalCode: z.string().regex(/^\d{6}$/, 'Must be a valid 6-digit Indian PIN code'),
  addressLine: z.string().min(5, 'Full address is required'),
  description: z.string().min(20, 'Please provide a detailed business description (minimum 20 characters)'),
  registrationNumber: z.string().optional(),
  allowInSalon: z.boolean().default(true),
  allowAtHome: z.boolean().default(false),
  termsAccepted: z.boolean().refine((val) => val === true, 'You must accept the Salon Partner Agreement'),
});

export const loginSchema = z.object({
  emailOrPhone: z.string().min(3, 'Email or mobile number is required'),
  password: z.string().min(1, 'Password is required'),
});

export const createBookingSchema = z.object({
  salonId: z.string().uuid('Invalid salon ID'),
  locationId: z.string().uuid('Invalid branch location ID'),
  salonServiceId: z.string().uuid('Invalid service ID'),
  bookingType: z.enum(['IN_SALON', 'AT_HOME']),
  appointmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format must be YYYY-MM-DD'),
  appointmentTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time format must be HH:MM'),
  customerNotes: z.string().optional(),
  // For AT_HOME bookings
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  landmark: z.string().optional(),
  locality: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  customerLatitude: z.number().optional(),
  customerLongitude: z.number().optional(),
});

export const updateBookingStatusSchema = z.object({
  status: z.enum([
    'REQUESTED',
    'ACCEPTED',
    'REJECTED',
    'CONFIRMED',
    'PROVIDER_EN_ROUTE',
    'ARRIVED',
    'IDENTITY_VERIFIED',
    'IN_PROGRESS',
    'COMPLETION_PENDING',
    'COMPLETED',
    'CANCELLED',
    'NO_SHOW',
    'DISPUTED',
  ]),
  notes: z.string().optional(),
  cancellationReason: z.string().optional(),
});

export const assignStaffSchema = z.object({
  staffId: z.string().uuid('Invalid staff ID'),
});

export const verifyOtpSchema = z.object({
  code: z.string().length(6, 'Verification code must be 6 digits'),
});

export const recordPaymentSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  paymentMethod: z.enum(['CASH', 'UPI', 'DIRECT_OTHER']),
  transactionReference: z.string().optional(),
  notes: z.string().optional(),
});

export const acknowledgePaymentSchema = z.object({
  isAcknowledged: z.boolean(),
  disputeReason: z.string().optional(),
});

export const submitReviewSchema = z.object({
  bookingId: z.string().uuid('Invalid booking ID'),
  rating: z.number().int().min(1).max(5),
  title: z.string().min(2, 'Review title is required'),
  comment: z.string().min(10, 'Review comment must be at least 10 characters'),
});

export const locationInterestSchema = z.object({
  state: z.string().min(2, 'State is required'),
  city: z.string().min(2, 'City is required'),
  pincode: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().regex(/^[6-9]\d{9}$/).optional(),
});
