import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { v4 as uuidv4 } from "uuid";
import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key-min-32-chars-long");
const BCRYPT_ROUNDS = 12;

// Password validation
export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (password.length < 8) {
    return { valid: false, error: "Password must be at least 8 characters" };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: "Password must contain uppercase letter" };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, error: "Password must contain lowercase letter" };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: "Password must contain a number" };
  }
  return { valid: true };
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Generate JWT
export async function generateToken(userId: number, email: string, role: string): Promise<string> {
  return new SignJWT({ userId, email, role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

// Verify JWT
export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { userId: number; email: string; role: string };
  } catch {
    return null;
  }
}

// Generate OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Register user
export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
  role?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");

  // Validate password
  const passwordCheck = validatePassword(data.password);
  if (!passwordCheck.valid) {
    throw new Error(passwordCheck.error);
  }

  // Check existing user
  const existing = await db.select().from(users).where(eq(users.email, data.email)).limit(1);
  if (existing.length > 0) {
    throw new Error("Email already registered");
  }

  // Hash password
  const passwordHash = await hashPassword(data.password);

  // Create user
  const result = await db.insert(users).values({
    openId: uuidv4(),
    name: data.name,
    email: data.email,
    passwordHash,
    role: (data.role as any) || "student",
    loginMethod: "email",
    emailVerified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  });

  return { userId: 1 }; // ID will be auto-generated
}

// Login user
export async function loginUser(email: string, password: string) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");

  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (result.length === 0) {
    throw new Error("Invalid credentials");
  }

  const user = result[0];

  // Check account lock
  if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
    throw new Error("Account locked. Try again later");
  }

  // Verify password
  if (!user.passwordHash) {
    throw new Error("Invalid login method");
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    // Increment failed attempts
    const attempts = (user.failedLoginAttempts || 0) + 1;
    const updates: any = { failedLoginAttempts: attempts, updatedAt: new Date() };
    
    if (attempts >= 5) {
      updates.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
    }
    
    await db.update(users).set(updates).where(eq(users.id, user.id));
    throw new Error("Invalid credentials");
  }

  // Reset failed attempts
  await db.update(users).set({
    failedLoginAttempts: 0,
    lockedUntil: null,
    lastSignedIn: new Date(),
    updatedAt: new Date(),
  }).where(eq(users.id, user.id));

  // Generate token
  const token = await generateToken(user.id, user.email!, user.role);

  return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
}

// Request OTP
export async function requestOTP(email: string) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");

  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (result.length === 0) {
    return { success: true }; // Don't reveal if email exists
  }

  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

  await db.update(users).set({
    otpCode: otp,
    otpExpiry,
    updatedAt: new Date(),
  }).where(eq(users.id, result[0].id));

  // OTP will be sent via email service in production
  // For development, OTP is logged to console
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Auth] OTP for ${email}: ${otp}`);
  }

  return { success: true };
}

// Verify OTP
export async function verifyOTP(email: string, otp: string) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");

  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (result.length === 0) {
    throw new Error("Invalid OTP");
  }

  const user = result[0];

  if (!user.otpCode || user.otpCode !== otp) {
    throw new Error("Invalid OTP");
  }

  if (!user.otpExpiry || new Date(user.otpExpiry) < new Date()) {
    throw new Error("OTP expired");
  }

  // Clear OTP
  await db.update(users).set({
    otpCode: null,
    otpExpiry: null,
    lastSignedIn: new Date(),
    updatedAt: new Date(),
  }).where(eq(users.id, user.id));

  // Generate token
  const token = await generateToken(user.id, user.email!, user.role);

  return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
}


// Generate password reset token
export async function generateResetToken(email: string): Promise<{ success: boolean; error?: string }> {
  const db = await getDb();
  if (!db) return { success: false, error: "Database not available" };

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  
  if (!user) {
    // Don't reveal if email exists for security
    return { success: true };
  }

  // Generate secure random token
  const resetToken = uuidv4();
  const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

  await db.update(users)
    .set({
      resetToken,
      resetTokenExpiry,
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id));

  return { success: true };
}

// Verify reset token and update password
export async function resetPasswordWithToken(
  token: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  const db = await getDb();
  if (!db) return { success: false, error: "Database not available" };

  // Validate password
  const validation = validatePassword(newPassword);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  // Find user with valid token
  const [user] = await db.select()
    .from(users)
    .where(eq(users.resetToken, token))
    .limit(1);

  if (!user) {
    return { success: false, error: "Invalid or expired reset token" };
  }

  // Check if token is expired
  if (!user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
    return { success: false, error: "Reset token has expired" };
  }

  // Hash new password
  const passwordHash = await hashPassword(newPassword);

  // Update password and clear reset token
  await db.update(users)
    .set({
      passwordHash,
      resetToken: null,
      resetTokenExpiry: null,
      failedLoginAttempts: 0,
      lockedUntil: null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id));

  return { success: true };
}

// Get reset token info (for validation on frontend)
export async function getResetTokenInfo(token: string): Promise<{ valid: boolean; email?: string }> {
  const db = await getDb();
  if (!db) return { valid: false };

  const [user] = await db.select()
    .from(users)
    .where(eq(users.resetToken, token))
    .limit(1);

  if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
    return { valid: false };
  }

  return { valid: true, email: user.email || undefined };
}
