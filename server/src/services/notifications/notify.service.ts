import { Notification } from '../../models/Notification';
import { getIO } from '../../sockets';
import { logger } from '../../utils/logger';

interface NotifyPayload {
  recipientId: string;
  recipientRole: 'Donor' | 'Hospital' | 'Admin' | 'User' | 'Patient' | 'Driver';
  type: string;
  title: string;
  message: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  actionUrl?: string;
  metadata?: any;
}

export const notify = async (payload: NotifyPayload): Promise<void> => {
  try {
    // 1. Save to Database
    const notification = await Notification.create({
      ...payload,
      isRead: false,
      delivered: false, // Initially false until we emit it
    });

    // 2. Emit live via Socket.io
    try {
      const io = getIO();
      const roomName = `user:${payload.recipientId}`;
      
      // We pass the document so the client has _id, createdAt, etc.
      io.to(roomName).emit('notification:new', notification);
      
      // Since emit doesn't guarantee receipt if they aren't online, we don't 
      // strictly know they received it. However, if they are connected to this room,
      // we assume delivery. If they are offline, they'll fetch via REST API later.
      // We can mark delivered = true here to optimize the REST API fetch.
      notification.delivered = true;
      await notification.save();

    } catch (socketError: any) {
      // getIO() throws if socket server isn't initialized yet
      logger.warn(`Failed to emit notification via socket: ${socketError.message}`);
    }

  } catch (dbError: any) {
    logger.error(`Failed to create notification in DB: ${dbError.message}`);
  }
};
