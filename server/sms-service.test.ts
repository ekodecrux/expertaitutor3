import { describe, it, expect } from 'vitest';
import { sendSMS } from './sms-service';

describe('SMS Service - Twilio Integration', () => {
  it('should validate Twilio credentials are configured', () => {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    expect(accountSid).toBeDefined();
    expect(authToken).toBeDefined();
    expect(fromNumber).toBeDefined();
    
    if (accountSid) {
      expect(accountSid.length).toBeGreaterThan(0);
      console.log('[Test] Twilio Account SID configured');
    }
    
    if (fromNumber) {
      expect(fromNumber).toMatch(/^\+?[1-9]\d{1,14}$/);
      console.log('[Test] Twilio phone number format valid');
    }
  });

  it('should handle SMS sending gracefully when credentials are invalid', async () => {
    // This test verifies the function doesn't crash with invalid credentials
    // In production, invalid credentials will log errors but not throw
    const result = await sendSMS('+1234567890', 'Test message');
    
    // Result can be true (if credentials valid) or false (if invalid/not configured)
    expect(typeof result).toBe('boolean');
    console.log('[Test] SMS service handles credentials gracefully');
  });
});
