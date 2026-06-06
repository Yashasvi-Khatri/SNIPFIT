# Invite-Only Admin System

## Overview

The SNIPFIT gym management system now includes a secure, invite-only admin account creation system. This ensures that only trusted individuals can become administrators through a controlled, audited invitation process.

## Features

### 🔐 Security Features
- **Email-based invitations**: Only existing admins can invite new administrators via email
- **Secure token system**: Each invitation contains a unique, time-limited token
- **24-hour expiration**: Invitation links expire after 24 hours for security
- **One-time use**: Tokens can only be used once and are invalidated after acceptance
- **Audit logging**: All invitation actions are logged with timestamps and inviter information
- **Role verification**: System prevents inviting users who are already admins
- **Email notifications**: Both inviter and invitee receive email confirmations

### 🎯 User Experience
- **Admin Dashboard**: Existing admins can manage all invitations from a single interface
- **Pending invitation tracking**: View all pending, accepted, and expired invitations
- **Resend capability**: Administrators can resend invitations if needed
- **Cancel invitations**: Pending invitations can be cancelled at any time
- **Professional email templates**: Custom-designed email templates for invitation flow
- **Status indicators**: Clear visual feedback for invitation status (pending, accepted, expired)

## Database Schema

### New Table: `AdminInvitation`

```prisma
model AdminInvitation {
  id             String   @id @default(cuid())
  email          String
  token          String   @unique
  invitedByUserId String
  invitedBy      User     @relation("AdminInvitations", fields: [invitedByUserId], references: [id])
  expiresAt      DateTime
  acceptedAt     DateTime?
  createdAt      DateTime @default(now())
}
```

### Updated User Model
The `User` model now includes the `adminInvitationsSent` relation to track invitations sent by each admin.

## API Endpoints

### Admin Invitation Routes (requires admin authentication)

#### POST `/api/admin-invitations/invite`
**Description**: Send an admin invitation to a specified email address.

**Request Body**:
```json
{
  "email": "admin@snipfit.com"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Admin invitation sent successfully",
  "invitation": {
    "id": "invitation_id",
    "email": "admin@snipfit.com",
    "expiresAt": "2024-01-02T12:00:00Z"
  }
}
```

#### GET `/api/admin-invitations`
**Description**: Get all admin invitations (including pending, accepted, and expired).

**Response**:
```json
{
  "success": true,
  "invitations": [
    {
      "id": "invitation_id",
      "email": "admin@snipfit.com",
      "token": "unique_token",
      "expiresAt": "2024-01-02T12:00:00Z",
      "acceptedAt": null,
      "createdAt": "2024-01-01T12:00:00Z",
      "invitedBy": {
        "id": "user_id",
        "name": "Admin User",
        "email": "existing@snipfit.com"
      }
    }
  ]
}
```

#### POST `/api/admin-invitations/:token/accept`
**Description**: Accept an admin invitation (public endpoint, used by email link).

**Request Parameters**: `token` (URL parameter)

**Request Body**:
```json
{
  "name": "New Admin",
  "password": "securePassword123"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Admin invitation accepted successfully",
  "user": {
    "id": "user_id",
    "email": "admin@snipfit.com",
    "name": "New Admin",
    "role": "ADMIN"
  }
}
```

#### DELETE `/api/admin-invitations/:id`
**Description**: Cancel a pending invitation.

**Response**:
```json
{
  "success": true,
  "message": "Invitation cancelled successfully"
}
```

#### POST `/api/admin-invitations/:id/resend`
**Description**: Resend an invitation email with a new token and updated expiration.

**Response**:
```json
{
  "success": true,
  "message": "Invitation resent successfully",
  "invitation": {
    "id": "invitation_id",
    "email": "admin@snipfit.com",
    "expiresAt": "2024-01-03T12:00:00Z"
  }
}
```

## Frontend Components

### AdminInvitationManager
Located at `src/components/admin/AdminInvitationManager.tsx`

**Features**:
- Form to invite new admins via email
- List of pending invitations with status indicators
- Resend and cancel buttons for pending invitations
- View of past (accepted/expired) invitations
- Real-time status updates using React Query

**Usage in Admin Dashboard**:
```tsx
import AdminInvitationManager from '@/components/admin/AdminInvitationManager';

// Add to admin dashboard layout
<AdminInvitationManager />
```

### AcceptAdminInvitation Page
Located at `src/pages/AcceptAdminInvitation.tsx`

**Features**:
- Professional invitation acceptance form
- Token validation
- User registration/role upgrade
- Password creation for new users
- Success feedback and redirect to login

**Route**: `/accept-admin-invitation?token=invitation_token`

## Email Templates

### Invitation Email
**Subject**: 🎉 Admin Invitation - SNIPFIT Gym

**Content**: 
- Inviter name and introduction
- Admin privileges overview
- Acceptance button with secure token
- 24-hour expiration notice
- Professional branding

### Invitation Accepted Notification
**Subject**: ✅ Admin Invitation Accepted - SNIPFIT

**Content**:
- New admin details
- Next steps for onboarding
- Security code setup reminder
- Training suggestions

## Security Considerations

### Token Security
- **Generation**: Uses `crypto.randomBytes(32)` for cryptographically secure tokens
- **Uniqueness**: Tokens are stored with unique constraint in database
- **Expiration**: 24-hour time limit prevents indefinite validity
- **Single-use**: Tokens are marked as used immediately after acceptance

### Access Control
- **Admin-only invitations**: Only authenticated admins can send invitations
- **Role verification**: System prevents duplicate admin invitations
- **Database validation**: All operations are validated at the database level

### Audit Trail
- **Invitation creation**: Records who invited whom and when
- **Invitation acceptance**: Tracks when invitations are accepted
- **Invitation cancellation**: Logs cancelled invitations with reasons
- **Resend tracking**: Monitors how many times invitations are resent

## Usage Guide

### For Existing Admins

1. **Invite a New Admin**:
   - Navigate to Admin Dashboard
   - Find the "Admin Invitations" section
   - Enter the email address of the person you want to invite
   - Click "Invite" to send the invitation

2. **Manage Pending Invitations**:
   - View all pending invitations in the Admin Invitations section
   - Resend invitations if the email wasn't received
   - Cancel invitations if they're no longer needed

3. **Monitor Invitation Status**:
   - Track which invitations have been accepted
   - View expired invitations
   - Monitor invitation history for security auditing

### For New Admins

1. **Accept Invitation**:
   - Click the link in the invitation email
   - Enter your name and create a password
   - Submit the form to accept the invitation

2. **Complete Setup**:
   - Set up your admin security code using the Admin Security Code script
   - Log in using the Admin Login page with your credentials
   - Access the admin dashboard with full privileges

## Testing

### Test the Invitation Flow

1. **Backend Testing**:
```bash
# Ensure backend server is running
cd server
npm run dev

# Test invitation endpoint
curl -X POST http://localhost:3000/api/admin-invitations/invite \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{"email": "testadmin@snipfit.com"}'
```

2. **Frontend Testing**:
```bash
# Ensure frontend is running
npm run dev

# Navigate to admin dashboard
# Test invitation form and management features
```

3. **Acceptance Flow Testing**:
```bash
# Get invitation token from database
# Navigate to: http://localhost:5173/accept-admin-invitation?token=TOKEN
# Test acceptance form and role upgrade
```

## Troubleshooting

### Common Issues

**Issue**: "A pending invitation already exists for this email"
- **Solution**: Cancel the existing invitation or wait for it to expire

**Issue**: "Invalid or expired invitation token"
- **Solution**: Request a new invitation from the admin

**Issue**: Email not received
- **Solution**: Check spam folder, use "Resend" button in admin dashboard

**Issue**: "User is already an admin"
- **Solution**: This user already has admin privileges, no invitation needed

## Maintenance

### Database Cleanup
```sql
-- Remove expired invitations (older than 30 days)
DELETE FROM "AdminInvitation" 
WHERE "acceptedAt" IS NULL 
AND "expiresAt" < NOW() - INTERVAL '30 days';
```

### Monitoring
- Monitor invitation acceptance rate
- Track failed invitations for security analysis
- Audit invitation logs periodically

## Future Enhancements

Potential improvements to consider:
- Add invitation expiration reminders
- Implement invitation revocation after acceptance
- Add admin role levels (super admin, admin, moderator)
- Multi-factor authentication requirement for admin invitations
- Invitation approval workflow for high-privilege roles

## Support

For issues or questions about the Admin Invitation System:
1. Check the Admin Dashboard for invitation status
2. Review the server logs for error messages
3. Consult the database logs for audit trail
4. Contact the development team for technical support

## Summary

The Invite-Only Admin System provides a secure, controlled, and auditable method for adding new administrators to the SNIPFIT gym management system. This ensures that only trusted individuals can access sensitive admin functionality while maintaining a complete audit trail of all administrative access changes.