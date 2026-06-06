# Admin Security Setup Guide

## Overview
This document explains how to set up the secure admin login system for SNIPFIT.

## Security Features Implemented

### 1. **Multi-Factor Authentication**
- Admins require both password AND a unique 6-character security code
- Security code is stored securely in the database
- Only administrators know their personal security codes

### 2. **Rate Limiting**
- Maximum 5 admin login attempts per 15 minutes per IP address
- Prevents brute force attacks on admin accounts

### 3. **Account Lockout**
- Account automatically locks after 5 failed security code attempts
- Lockout duration: 30 minutes
- Requires manual intervention or waiting period to unlock

### 4. **Audit Logging**
- All admin login attempts are logged with:
  - Timestamp
  - IP address
  - User agent
  - Success/failure status
  - Failure reasons
- Accessible via API endpoint for security monitoring

### 5. **Response Timing**
- Failed attempts include deliberate delays to prevent timing attacks
- Generic error messages to prevent information disclosure

## Initial Setup

### Step 1: Create Admin User
Ensure you have an admin user in the system. If not, create one through the Supabase dashboard or set the role in the database directly.

```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'admin@snipfit.com';
```

### Step 2: Set Security Code
You can set the admin security code using the API endpoint:

**POST** `/api/admin-auth/set-security-code`

```json
{
  "userId": "admin-user-id",
  "currentCode": null,
  "newCode": "ABC123"
}
```

**Requirements:**
- Must be at least 6 characters
- Must be alphanumeric (letters and numbers only)
- Should be memorable but not obvious
- Store it securely (password manager recommended)

### Step 3: Test Admin Login
1. Navigate to `/login`
2. Click "Switch to Admin Login"
3. Enter admin email
4. Enter password
5. Enter the 6-character security code
6. Click "Admin Sign In"

## Security Best Practices

### Security Code Guidelines
- **DO:**
  - Use a unique code for each admin
  - Store in a secure password manager
  - Change codes periodically (every 90 days)
  - Use a mix of letters and numbers
  - Make it memorable but not guessable

- **DON'T:**
  - Share codes via email or chat
  - Use common patterns (123456, ADMIN1, etc.)
  - Write codes on sticky notes
  - Reuse codes from other systems
  - Use the same code for multiple admins

### Monitoring
Regularly check admin login logs:
```bash
GET /api/admin-auth/login-history/:userId
```

Look for:
- Unusual IP addresses
- Failed login attempts
- Login attempts at odd hours
- Multiple failed attempts in short time

### Emergency Procedures
If an admin account is locked:
1. Wait 30 minutes for automatic unlock
2. Or manually reset via database:
```sql
UPDATE "User" 
SET 
  "failedLoginAttempts" = 0,
  "accountLockedUntil" = NULL,
  "lastFailedLoginAt" = NULL
WHERE email = 'admin@snipfit.com';
```

## API Endpoints

### Verify Security Code
**POST** `/api/admin-auth/verify-security-code`
- Verifies admin security code before allowing login
- Includes rate limiting and account lockout checks

### Set Security Code
**POST** `/api/admin-auth/set-security-code`
- Sets or updates admin security code
- Requires current code if already set
- Validates code format (6+ alphanumeric characters)

### Get Login History
**GET** `/api/admin-auth/login-history/:userId`
- Returns last 50 admin login attempts
- Includes IP, timestamp, success/failure status
- Useful for security auditing

## Database Schema Updates

### New User Fields
- `adminSecurityCode`: Stores the unique security code (plain text for this implementation, consider hashing for production)
- `failedLoginAttempts`: Tracks consecutive failed attempts
- `lastFailedLoginAt`: Timestamp of last failed attempt
- `accountLockedUntil`: Timestamp for temporary lockout

### New Table: AdminLoginLog
- `id`: Unique identifier
- `userId`: Reference to user
- `ipAddress`: IP address of login attempt
- `userAgent`: Browser/client information
- `success`: Whether login was successful
- `failureReason`: Reason for failure (if applicable)
- `createdAt`: Timestamp of attempt

## Frontend Integration

### Login Page
- Toggle between regular and admin login modes
- Admin mode requires security code field
- Visual feedback for admin mode (shield icon)
- Automatic redirect if admin tries regular login

### Admin Login Page
- Dedicated admin login at `/admin-login`
- Enhanced security UI with dark theme
- Clear indication of secure login process
- Account lockout warnings

## Security Considerations for Production

### Recommended Enhancements
1. **Hash security codes** instead of storing plain text
2. **Implement 2FA/TOTP** as additional layer
3. **IP whitelisting** for admin access
4. **Hardware security keys** (WebAuthn)
5. **Time-based access restrictions** (business hours only)
6. **Geolocation verification** for unusual logins
7. **SMS verification** for high-risk actions
8. **Session timeout** for admin accounts

### Current Limitations
- Security codes stored in plain text ( hashing recommended)
- No hardware 2FA support
- No geolocation verification
- No time-based restrictions

## Troubleshooting

### "Account is locked" error
- Wait 30 minutes for automatic unlock
- Or manually reset via database
- Check login logs for suspicious activity

### "Invalid security code" error
- Verify code is correct (case-sensitive)
- Ensure code is exactly 6 characters
- Check if code was recently changed
- Contact system administrator if code is forgotten

### Rate limiting errors
- Wait 15 minutes before trying again
- Check if you're behind a proxy/VPN
- Contact IT if legitimate access is blocked

## Support
For security issues or questions about admin access, contact the system administrator or review the audit logs for troubleshooting information.
