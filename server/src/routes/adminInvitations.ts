import express, { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { PrismaClient, Role } from '@prisma/client';
import { authenticate, adminOnly } from '../middleware/auth';
import { sendAdminInvitation, sendAdminInvitationAccepted } from '../lib/email';

const router = express.Router();
const prisma = new PrismaClient();

// Generate a secure random token
const generateInvitationToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

// POST /api/admin-invitations/invite - Send admin invitation
router.post('/invite', authenticate, adminOnly, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body as { email: string };
    const inviterId = req.user!.id;
    const inviterName = req.user!.name || 'Admin';

    if (!email) {
      res.status(400).json({ success: false, error: 'Email is required', statusCode: 400 });
      return;
    }

    // Check if email already has an admin invitation
    const existingInvitation = await prisma.adminInvite.findFirst({
      where: {
        email: email as string,
        acceptedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (existingInvitation) {
      res.status(400).json({ 
        success: false, 
        error: 'A pending invitation already exists for this email', 
        statusCode: 400 
      });
      return;
    }

    // Check if user already exists and is already an admin
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser && existingUser.role === 'ADMIN') {
      res.status(400).json({ 
        success: false, 
        error: 'This user is already an admin', 
        statusCode: 400 
      });
      return;
    }

    // Generate invitation token
    const token = generateInvitationToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create invitation record
    const invitation = await prisma.adminInvite.create({
      data: {
        email,
        token,
        invitedByUserId: inviterId,
        expiresAt,
      },
    });

    // Send invitation email
    const acceptLink = `${process.env.FRONTEND_URL}/accept-admin-invitation?token=${token}`;
    try {
      await sendAdminInvitation(email, {
        inviterName,
        acceptLink,
        expiryHours: 24,
      });
    } catch (emailError) {
      console.error('Failed to send admin invitation email:', emailError);
      // Delete invitation if email fails
      await prisma.adminInvite.delete({
        where: { id: invitation.id },
      });
      res.status(500).json({ 
        success: false, 
        error: 'Failed to send invitation email', 
        statusCode: 500 
      });
      return;
    }

    res.json({ 
      success: true, 
      message: 'Admin invitation sent successfully',
      invitation: {
        id: invitation.id,
        email,
        expiresAt,
      }
    });

  } catch (error) {
    next(error);
  }
});

// GET /api/admin-invitations - Get all invitations (for admin dashboard)
router.get('/', authenticate, adminOnly, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const invitations = await prisma.adminInvite.findMany({
      include: {
        invitedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, invitations });

  } catch (error) {
    next(error);
  }
});

// POST /api/admin-invitations/:token/accept - Accept admin invitation
router.post('/:token/accept', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token } = req.params;
    const { name, password } = req.body as { name: string; password: string };

    // Find valid invitation
    const invitation = await prisma.adminInvite.findFirst({
      where: {
        token: token as string,
        acceptedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        invitedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!invitation) {
      res.status(400).json({ 
        success: false, 
        error: 'Invalid or expired invitation token', 
        statusCode: 400 
      });
      return;
    }

    // Check if user already exists with this email
    let user = await prisma.user.findUnique({
      where: { email: invitation.email as string },
    });

    if (user) {
      // Update existing user to admin role
      if (user.role === 'ADMIN') {
        res.status(400).json({ 
          success: false, 
          error: 'User is already an admin', 
          statusCode: 400 
        });
        return;
      }

      user = await prisma.user.update({
        where: { id: user.id },
        data: { role: 'ADMIN' },
      });
    } else {
      // Create new user with admin role
      user = await prisma.user.create({
        data: {
          email: invitation.email as string,
          name: name || (invitation.email as string).split('@')[0] || 'Admin',
          role: 'ADMIN',
        },
      });
    }

    // Mark invitation as accepted
    await prisma.adminInvite.update({
      where: { id: invitation.id },
      data: { acceptedAt: new Date() },
    });

    // Notify the inviter
    if (invitation.invitedBy) {
      try {
        await sendAdminInvitationAccepted(invitation.invitedBy.email as string, {
          newAdminName: user.name,
          newAdminEmail: user.email,
        });
      } catch (emailError) {
        console.error('Failed to send invitation accepted email:', emailError);
      }
    }

    res.json({ 
      success: true, 
      message: 'Admin invitation accepted successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      }
    });

  } catch (error) {
    next(error);
  }
});

// DELETE /api/admin-invitations/:id - Cancel pending invitation
router.delete('/:id', authenticate, adminOnly, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params as { id: string };

    const invitation = await prisma.adminInvite.findUnique({
      where: { id: id as string },
    });

    if (!invitation) {
      res.status(404).json({ 
        success: false, 
        error: 'Invitation not found', 
        statusCode: 404 
      });
      return;
    }

    if (invitation.acceptedAt) {
      res.status(400).json({ 
        success: false, 
        error: 'Cannot cancel an already accepted invitation', 
        statusCode: 400 
      });
      return;
    }

    await prisma.adminInvite.delete({
      where: { id },
    });

    res.json({ success: true, message: 'Invitation cancelled successfully' });

  } catch (error) {
    next(error);
  }
});

// POST /api/admin-invitations/:id/resend - Resend invitation email
router.post('/:id/resend', authenticate, adminOnly, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params as { id: string };

    const invitation = await prisma.adminInvite.findUnique({
      where: { id: id as string },
      include: {
        invitedBy: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!invitation) {
      res.status(404).json({ 
        success: false, 
        error: 'Invitation not found', 
        statusCode: 404 
      });
      return;
    }

    if (invitation.acceptedAt) {
      res.status(400).json({ 
        success: false, 
        error: 'Cannot resend an already accepted invitation', 
        statusCode: 400 
      });
      return;
    }

    if (new Date() > new Date(invitation.expiresAt)) {
      res.status(400).json({ 
        success: false, 
        error: 'Invitation has expired', 
        statusCode: 400 
      });
      return;
    }

    // Generate new token and update expiry
    const newToken = generateInvitationToken();
    const newExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.adminInvite.update({
      where: { id },
      data: {
        token: newToken,
        expiresAt: newExpiresAt,
      },
    });

    // Send new invitation email
    const acceptLink = `${process.env.FRONTEND_URL}/accept-admin-invitation?token=${newToken}`;
    try {
      await sendAdminInvitation(invitation.email, {
        inviterName: invitation.invitedBy.name,
        acceptLink,
        expiryHours: 24,
      });
    } catch (emailError) {
      console.error('Failed to resend admin invitation email:', emailError);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to resend invitation email', 
        statusCode: 500 
      });
      return;
    }

    res.json({ 
      success: true, 
      message: 'Invitation resent successfully',
      invitation: {
        id: invitation.id,
        email: invitation.email,
        expiresAt: newExpiresAt,
      }
    });

  } catch (error) {
    next(error);
  }
});

export default router;
