import express from 'express';
import { z } from 'zod';

// @ts-ignore
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/stats', async (req, res) => {
  try {
    // Get current week's workouts
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    const weekEnd = new Date(now.setDate(now.getDate() + (6 - now.getDay())));

    const workoutsThisWeek = await prisma.workout.count({
      where: {
        createdAt: {
          gte: weekStart,
          lte: weekEnd,
        },
      },
    });

    // Get last week's workouts for comparison
    const lastWeekStart = new Date(weekStart.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastWeekEnd = new Date(weekStart.getTime() - 1);
    
    const workoutsLastWeek = await prisma.workout.count({
      where: {
        createdAt: {
          gte: lastWeekStart,
          lte: lastWeekEnd,
        },
      },
    });

    const workoutChange = workoutsThisWeek - workoutsLastWeek;

    // Get upcoming gym class
    const nextClass = await prisma.gymClass.findFirst({
      where: {
        schedule: {
          gte: new Date(),
        },
      },
      orderBy: {
        schedule: 'asc',
      },
    });

    // Get user measurements for progress
    const measurements = await prisma.measurement.findMany({
      orderBy: {
        measuredAt: 'desc',
      },
      take: 2,
    });

    let progressData = null;
    if (measurements.length > 0) {
      const current = measurements[0];
      const previous = measurements[1];
      
      progressData = {
        currentWeight: current.weight,
        currentBMI: current.bmi,
        weightChange: previous ? current.weight - previous.weight : 0,
        bmiChange: previous ? current.bmi - previous.bmi : 0,
        lastMeasurementDate: current.measuredAt.toLocaleDateString(),
      };
    }

    // Calculate streak (simplified - consecutive days with activity)
    const recentActivity = await prisma.workout.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    let currentStreak = 0;
    const today = new Date().toDateString();
    
    for (const workout of recentActivity) {
      const workoutDate = workout.createdAt.toDateString();
      if (workoutDate === today) {
        currentStreak = 1;
        break;
      }
    }

    // Simple streak calculation (this is a basic implementation)
    if (currentStreak === 0 && recentActivity.length > 0) {
      currentStreak = 1; // At least had some activity recently
    }

    const stats = {
      workoutsThisWeek,
      workoutChange,
      currentStreak,
      nextSession: nextClass ? nextClass.name : 'No sessions',
      nextSessionTime: nextClass ? 
        `${nextClass.schedule.toLocaleDateString()} ${nextClass.schedule.toLocaleTimeString()}` : 
        'Schedule a class',
      progressData,
    };

    res.json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

export default router;
