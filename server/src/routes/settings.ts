import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// PATCH /api/members/me/profile - Update profile
router.patch('/profile', async (req, res) => {
  try {
    const userId = req.user?.id;
    
    const {
      name,
      phone,
      dateOfBirth,
      gender,
      address,
      emergencyContact,
      emergencyPhone,
    } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        phone,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender,
        address,
        emergencyContact,
      },
    });

    res.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error('Error updating profile:', error);
    res.status(500).json({ success: false, error: 'Failed to update profile', statusCode: 500 });
  }
});

// PATCH /api/auth/change-password - Change password
router.patch('/change-password', async (req, res) => {
  try {
    const userId = req.user?.id;
    const { currentPassword, newPassword } = req.body;

    // Note: This is a simplified version. In production, you'd want to:
    // 1. Verify the current password using Supabase Auth
    // 2. Update the password using Supabase Auth client
    // For now, this is a placeholder that assumes the auth layer handles password validation
    
    // This would typically call Supabase Auth admin API to update password
    // const { error } = await supabase.auth.admin.updateUserById(userId, { password: newPassword });
    
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error changing password:', error);
    res.status(500).json({ success: false, error: 'Failed to change password', statusCode: 500 });
  }
});

// DELETE /api/members/me - Delete account (soft delete)
router.delete('/me', async (req, res) => {
  try {
    const userId = req.user?.id;

    await prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() },
    });

    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting account:', error);
    res.status(500).json({ success: false, error: 'Failed to delete account', statusCode: 500 });
  }
});

export default router;