import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import prisma from './prisma';

export interface GeneratedOtpPair {
  customerOtp: string;
  professionalOtp: string;
  customerOtpHashed: string;
  professionalOtpHashed: string;
  expiresAt: Date;
}

/**
 * Generate cryptographically secure 6-digit numeric OTP
 */
export function generateSecureOtp(): string {
  // Generate random integer between 100000 and 999999
  const buffer = crypto.randomBytes(4);
  const num = buffer.readUInt32BE(0);
  const otp = 100000 + (num % 900000);
  return otp.toString();
}

/**
 * Generate two independent OTPs with bcrypt hashes and 5-minute expiry
 */
export async function createTwoWayOtpChallenge(): Promise<GeneratedOtpPair> {
  const customerOtp = generateSecureOtp();
  const professionalOtp = generateSecureOtp();

  const [customerOtpHashed, professionalOtpHashed] = await Promise.all([
    bcrypt.hash(customerOtp, 8),
    bcrypt.hash(professionalOtp, 8),
  ]);

  const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES || '5', 10);
  const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

  return {
    customerOtp,
    professionalOtp,
    customerOtpHashed,
    professionalOtpHashed,
    expiresAt,
  };
}

/**
 * Verify Customer OTP (entered by Assigned Staff)
 */
export async function verifyCustomerOtpByStaff(
  challengeId: string,
  enteredCode: string,
  staffUserId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<{ success: boolean; message: string; isFullyVerified: boolean }> {
  const challenge = await prisma.bookingOtpChallenge.findUnique({
    where: { id: challengeId },
    include: { booking: true },
  });

  if (!challenge) {
    return { success: false, message: 'OTP challenge not found', isFullyVerified: false };
  }

  if (challenge.isLocked) {
    return { success: false, message: 'Challenge is locked due to too many failed attempts. Please request a new code.', isFullyVerified: false };
  }

  if (new Date() > challenge.expiresAt) {
    return { success: false, message: 'Verification code has expired (valid for 5 minutes). Please request a new code.', isFullyVerified: false };
  }

  if (challenge.customerOtpVerified) {
    return { success: true, message: 'Customer code was already successfully verified.', isFullyVerified: challenge.professionalOtpVerified };
  }

  // Check attempt threshold
  const maxAttempts = parseInt(process.env.OTP_MAX_ATTEMPTS || '5', 10);
  if (challenge.failedAttemptsCustomer >= maxAttempts) {
    await prisma.bookingOtpChallenge.update({
      where: { id: challengeId },
      data: { isLocked: true },
    });
    return { success: false, message: 'Maximum attempts exceeded. Challenge locked for safety.', isFullyVerified: false };
  }

  // Compare entered code with hash
  const isValid = await bcrypt.compare(enteredCode.trim(), challenge.customerOtpHashed);

  // Log attempt
  await prisma.otpAttemptLog.create({
    data: {
      challengeId,
      attemptType: 'CUSTOMER_CODE',
      submittedByUserId: staffUserId,
      isSuccessful: isValid,
      failureReason: isValid ? null : 'INVALID_CODE',
      ipAddress: ipAddress || null,
      userAgent: userAgent || null,
    },
  });

  if (!isValid) {
    const updated = await prisma.bookingOtpChallenge.update({
      where: { id: challengeId },
      data: {
        failedAttemptsCustomer: { increment: 1 },
        isLocked: challenge.failedAttemptsCustomer + 1 >= maxAttempts,
      },
    });

    const remaining = maxAttempts - updated.failedAttemptsCustomer;
    return {
      success: false,
      message: `Invalid customer verification code. ${remaining > 0 ? `${remaining} attempts remaining.` : 'Challenge locked.'}`,
      isFullyVerified: false,
    };
  }

  // Mark Customer OTP as verified
  const isFullyVerified = challenge.professionalOtpVerified;
  await prisma.bookingOtpChallenge.update({
    where: { id: challengeId },
    data: {
      customerOtpVerified: true,
      verifiedAt: isFullyVerified ? new Date() : null,
    },
  });

  // If both are now verified, transition booking to IDENTITY_VERIFIED
  if (isFullyVerified) {
    await prisma.booking.update({
      where: { id: challenge.bookingId },
      data: {
        status: 'IDENTITY_VERIFIED',
        verifiedAt: new Date(),
      },
    });

    await prisma.bookingStatusHistory.create({
      data: {
        bookingId: challenge.bookingId,
        fromStatus: 'ARRIVED',
        toStatus: 'IDENTITY_VERIFIED',
        changedByUserId: staffUserId,
        notes: 'Doorstep two-way OTP verification completed successfully. Identity verified.',
      },
    });
  }

  return {
    success: true,
    message: isFullyVerified
      ? 'Both codes verified successfully! Identity verified. You may now start service.'
      : 'Customer code verified. Waiting for customer to enter professional code.',
    isFullyVerified,
  };
}

/**
 * Verify Professional OTP (entered by Customer)
 */
export async function verifyProfessionalOtpByCustomer(
  challengeId: string,
  enteredCode: string,
  customerUserId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<{ success: boolean; message: string; isFullyVerified: boolean }> {
  const challenge = await prisma.bookingOtpChallenge.findUnique({
    where: { id: challengeId },
    include: { booking: true },
  });

  if (!challenge) {
    return { success: false, message: 'OTP challenge not found', isFullyVerified: false };
  }

  if (challenge.isLocked) {
    return { success: false, message: 'Challenge is locked due to too many failed attempts. Please ask the professional to re-issue.', isFullyVerified: false };
  }

  if (new Date() > challenge.expiresAt) {
    return { success: false, message: 'Verification code has expired. Please ask the professional to re-issue.', isFullyVerified: false };
  }

  if (challenge.professionalOtpVerified) {
    return { success: true, message: 'Professional code was already successfully verified.', isFullyVerified: challenge.customerOtpVerified };
  }

  const maxAttempts = parseInt(process.env.OTP_MAX_ATTEMPTS || '5', 10);
  if (challenge.failedAttemptsProfessional >= maxAttempts) {
    await prisma.bookingOtpChallenge.update({
      where: { id: challengeId },
      data: { isLocked: true },
    });
    return { success: false, message: 'Maximum attempts exceeded. Challenge locked.', isFullyVerified: false };
  }

  const isValid = await bcrypt.compare(enteredCode.trim(), challenge.professionalOtpHashed);

  // Log attempt
  await prisma.otpAttemptLog.create({
    data: {
      challengeId,
      attemptType: 'PROFESSIONAL_CODE',
      submittedByUserId: customerUserId,
      isSuccessful: isValid,
      failureReason: isValid ? null : 'INVALID_CODE',
      ipAddress: ipAddress || null,
      userAgent: userAgent || null,
    },
  });

  if (!isValid) {
    const updated = await prisma.bookingOtpChallenge.update({
      where: { id: challengeId },
      data: {
        failedAttemptsProfessional: { increment: 1 },
        isLocked: challenge.failedAttemptsProfessional + 1 >= maxAttempts,
      },
    });

    const remaining = maxAttempts - updated.failedAttemptsProfessional;
    return {
      success: false,
      message: `Invalid professional code. ${remaining > 0 ? `${remaining} attempts remaining.` : 'Challenge locked.'}`,
      isFullyVerified: false,
    };
  }

  // Mark Professional OTP as verified
  const isFullyVerified = challenge.customerOtpVerified;
  await prisma.bookingOtpChallenge.update({
    where: { id: challengeId },
    data: {
      professionalOtpVerified: true,
      verifiedAt: isFullyVerified ? new Date() : null,
    },
  });

  if (isFullyVerified) {
    await prisma.booking.update({
      where: { id: challenge.bookingId },
      data: {
        status: 'IDENTITY_VERIFIED',
        verifiedAt: new Date(),
      },
    });

    await prisma.bookingStatusHistory.create({
      data: {
        bookingId: challenge.bookingId,
        fromStatus: 'ARRIVED',
        toStatus: 'IDENTITY_VERIFIED',
        changedByUserId: customerUserId,
        notes: 'Doorstep two-way OTP verification completed successfully. Identity verified.',
      },
    });
  }

  return {
    success: true,
    message: isFullyVerified
      ? 'Both codes verified successfully! Identity confirmed. Professional is authorized to start service.'
      : 'Professional code verified. Waiting for professional to enter your code.',
    isFullyVerified,
  };
}
