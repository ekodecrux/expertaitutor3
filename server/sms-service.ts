import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

let twilioClient: ReturnType<typeof twilio> | null = null;

if (accountSid && authToken && fromNumber) {
  try {
    twilioClient = twilio(accountSid, authToken);
    console.log('[SMS] Twilio client initialized successfully');
  } catch (error) {
    console.warn('[SMS] Failed to initialize Twilio client - SMS sending disabled');
    console.warn('[SMS] Error:', error instanceof Error ? error.message : 'Unknown error');
  }
} else {
  console.warn('[SMS] Twilio credentials not configured - SMS sending disabled');
  console.warn('[SMS] OTP codes will be logged to console for development/testing');
}

export async function sendSMS(to: string, message: string): Promise<boolean> {
  if (!twilioClient || !fromNumber) {
    console.error('[SMS] Twilio not configured, cannot send SMS');
    console.log(`[SMS] Would have sent to ${to}: ${message}`);
    return false;
  }

  try {
    const result = await twilioClient.messages.create({
      body: message,
      from: fromNumber,
      to: to,
    });

    console.log(`[SMS] Message sent successfully to ${to}, SID: ${result.sid}`);
    return true;
  } catch (error) {
    console.error('[SMS] Failed to send SMS:', error);
    return false;
  }
}

export async function sendOTPSMS(mobile: string, otp: string): Promise<boolean> {
  const message = `Your ACES-AIProfessor verification code is: ${otp}. This code will expire in 10 minutes.`;
  return sendSMS(mobile, message);
}
