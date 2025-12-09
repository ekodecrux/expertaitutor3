ALTER TABLE users
ADD COLUMN passwordHash VARCHAR(255),
ADD COLUMN emailVerified BOOLEAN DEFAULT FALSE,
ADD COLUMN otpCode VARCHAR(6),
ADD COLUMN otpExpiry TIMESTAMP NULL,
ADD COLUMN resetToken VARCHAR(255),
ADD COLUMN resetTokenExpiry TIMESTAMP NULL,
ADD COLUMN failedLoginAttempts INT DEFAULT 0,
ADD COLUMN lockedUntil TIMESTAMP NULL,
ADD COLUMN googleId VARCHAR(255),
ADD COLUMN facebookId VARCHAR(255),
ADD COLUMN gdprConsent BOOLEAN DEFAULT FALSE,
ADD COLUMN gdprConsentDate TIMESTAMP NULL,
ADD COLUMN dataResidency VARCHAR(50),
ADD COLUMN organizationId INT,
ADD COLUMN branchId INT,
ADD INDEX email_idx (email),
ADD INDEX organization_idx (organizationId),
ADD INDEX branch_idx (branchId);

ALTER TABLE users
MODIFY COLUMN role ENUM('student', 'parent', 'teacher', 'admin', 'institution_admin', 'branch_admin', 'super_admin') DEFAULT 'student' NOT NULL;
