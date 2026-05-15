import express, { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { validate } from '../middleware/validate';

const router = express.Router();
const prisma = new PrismaClient();

const contactSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().regex(/^[6-9]\d{9}$/).optional(),
    interest: z.string().min(1),
    message: z.string().optional().default(''),
  }),
});

router.post(
  '/',
  validate(contactSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, email, phone, interest, message } = req.body as {
        name: string;
        email: string;
        phone?: string;
        interest: string;
        message: string;
      };

      await prisma.contactForm.create({
        data: {
          name,
          email,
          phone: phone ?? null,
          interest,
          message: message || '',
        },
      });

      res.status(201).json({
        success: true,
        message: "We'll be in touch soon!",
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
