/**
 * CIELVO SMS & OTP Delivery Service
 * Integrates with MSG91 (DLT registered Indian SMS Gateway)
 */

interface SendSmsResult {
  success: boolean;
  messageId?: string;
  provider: 'MSG91' | 'DEV_MOCK';
  error?: string;
  devCode?: string; // only populated if OTP_DEV_MODE is active and NOT in production
}

export async function sendOtpSms(phone: string, otpCode: string, recipientRole: 'CUSTOMER' | 'PROFESSIONAL'): Promise<SendSmsResult> {
  const isProduction = process.env.NODE_ENV === 'production';
  const isDevMode = process.env.OTP_DEV_MODE === 'true';
  const authKey = process.env.MSG91_AUTH_KEY;
  const senderId = process.env.MSG91_SENDER_ID || 'CIELVO';
  const templateId = process.env.MSG91_OTP_TEMPLATE_ID;

  // Format phone number to E.164 without leading plus for Indian gateways if needed
  const cleanPhone = phone.replace(/\D/g, '');

  // 1. Production SMS with MSG91
  if (authKey && templateId) {
    try {
      const response = await fetch(`https://control.msg91.com/api/v5/otp?template_id=${templateId}&mobile=${cleanPhone}&authkey=${authKey}&otp=${otpCode}&sender=${senderId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      if (response.ok && data.type === 'success') {
        return {
          success: true,
          messageId: data.message || 'msg91-success',
          provider: 'MSG91',
        };
      } else {
        console.error('MSG91 OTP delivery failed:', data);
        if (isProduction) {
          return { success: false, provider: 'MSG91', error: data.message || 'SMS delivery failed' };
        }
      }
    } catch (err: any) {
      console.error('Error invoking SMS gateway:', err);
      if (isProduction) {
        return { success: false, provider: 'MSG91', error: err.message || 'Network error calling SMS gateway' };
      }
    }
  }

  // 2. Safe Development Test Mode (Strictly disabled in production)
  if (!isProduction && isDevMode) {
    console.log(`[CIELVO DEV OTP] Delivered to ${cleanPhone} (${recipientRole}): Code = ${otpCode}`);
    return {
      success: true,
      messageId: `dev-sim-${Date.now()}`,
      provider: 'DEV_MOCK',
      devCode: otpCode,
    };
  }

  return {
    success: false,
    provider: 'MSG91',
    error: 'SMS Gateway credentials not configured in production environment',
  };
}
