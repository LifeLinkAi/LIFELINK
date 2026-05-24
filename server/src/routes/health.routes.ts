import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  res.status(200).json({
    success: true,
    message: 'LifeLink server is healthy',
    data: {
      status: 'OK',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      database: dbStatus,
      memoryUsage: process.memoryUsage(),
    }
  });
});

export default router;
